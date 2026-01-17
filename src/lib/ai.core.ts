import { isValidBrowser, tryCatch } from '@/lib/utils';
import { GoogleGenAI, Type } from "@google/genai"
import { prisma, redis } from "./prisma"
import { getLikeCountsForWebsites } from "./websites.core"
import { debugLog } from "./log"
import { auth } from "./auth"
import type { AIUsageType } from "@/types/user"
import { isToday } from "date-fns"
import { MAX_AI_USAGES_PER_DAY, MAX_AI_USAGES_TRIAL_USER, parseAIResponse } from "@/helpers/ai.helper"
import { isUserBanned } from "./user.core"
import type { WebsiteType } from "@/types/website"
import type { ActionAPIContext, AstroActionContext } from 'astro:actions';
import { createHash } from "crypto";
import axios from 'axios';
import { Groq } from 'groq-sdk';

/*
    1. somehow register new trial user using api and set the cookie if valid user agent
    2. use the trial user id to track ai usage
*/

// todo: change website searching for vector search

const COOKIE_TRIAL_USER_KEY = "ops_trial_user"

const AI_KEYS = {
    "gemini": import.meta.env.GEMINI_API_KEY,
    "openrouter": import.meta.env.AI_API_KEY,
    "groq": import.meta.env.GROQ_AI_API_KEY
}

async function callGemini(prompt: string, instructions?: string[]) {
    if (!AI_KEYS.gemini) throw new Error("Gemini API Key is missing");

    const ai = new GoogleGenAI({ apiKey: import.meta.env.GEMINI_API_KEY })
    const response = await tryCatch(ai.models.generateContent({
        model: "gemini-2.5-flash-lite-preview-09-2025",
        contents: [
            {
                role: "USER",
                parts: [
                    { text: `USER REQUEST:\n${prompt}` }
                ]
            },
        ],
        config: {
            maxOutputTokens: 70,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            systemInstruction: instructions ? instructions.join(" ") : []
        }
    }))

    if (response.error) throw new Error(response.error.message)

    return response.data.text
}

async function callOpenRouter(prompt: string, instructions?: string[]) {
    if (!AI_KEYS.openrouter) throw new Error("OpenRouter API Key is missing");

    const response = await tryCatch(axios.post("https://openrouter.ai/api/v1/chat/completions", {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [
            {
                "role": "system",
                "content": [...(instructions ?? [])].join(" ")
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
    }, {
        headers: {
            "Authorization": `Bearer ${import.meta.env.AI_API_KEY}`,
            "Content-Type": "application/json"
        }
    }))

    if (response.error) throw new Error(response.error.message)

    return response.data.data.choices[0]?.message?.content || ""
}

async function callGroq(prompt: string, instructions?: string[]) {
    if (!AI_KEYS.groq) throw new Error("Groq API Key is missing");

    const client = new Groq({ apiKey: AI_KEYS.groq });
    const response = await tryCatch(client.chat.completions.create({
        messages: [
            { role: "system", content: instructions?.join(" ") || "" },
            { role: "user", content: prompt },
        ],
        //https://console.groq.com/docs/rate-limits
        model: "llama-3.3-70b-versatile",
        max_completion_tokens: 512,
        stream: false,
        temperature: 0.1,
    }));

    if (response.error) throw new Error(response.error.message)

    return response.data.choices[0].message.content
}

async function updateUsage({
    aiUsage,
    currentUser,
    trialUserFingerprint
}: {
    aiUsage: AIUsageType | null,
    currentUser: any | null,
    trialUserFingerprint: string | null
}) {
    if (!currentUser && !trialUserFingerprint) throw new Error("Missing user and fingerprint");

    const updatedUsage: AIUsageType = (!aiUsage || (!isToday(aiUsage.date)) ? {
        date: new Date(),
        used: 1
    } : {
        date: aiUsage.date,
        used: aiUsage.used + 1
    })

    try {
        currentUser ? await prisma.user.update({
            where: {
                id: currentUser.user.id
            },
            data: {
                ai_usage: updatedUsage
            }
        }) : (async () => {
            await redis.incr(`trial_ops_ai:${trialUserFingerprint}`)
            if (trialUserFingerprint && !aiUsage) await redis.expire(`trial_ops_ai:${trialUserFingerprint}`, 86400)
        })()
    } catch (error) {
        debugLog("ERROR", "Failed while updating user's usage.", {
            user: currentUser,
            trialUserFingerprint: trialUserFingerprint,
            error: error
        })

        throw new Error("Server is busy. Try again later.")
    }

    return updatedUsage
}

export function generateFingerprint(context: ActionAPIContext): string {
    const ip = context.clientAddress || context.request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        context.request.headers.get('x-real-ip') ||
        'unknown';

    const userAgent = context.request.headers.get('user-agent') || '';

    const fingerprint = createHash('sha256')
        .update(`${ip}:${userAgent}:${"{<ZnRF$luONA6oU7,F!==HDQ__l-G5oCU=7UAB=_RM<5^JT@iZ;A,I(Zuq1K[Zq]"}`)
        .digest('hex');

    return fingerprint;
}

export const getWebsitesRecommendation = async ({ headers, content, context }: { headers: Headers, content: string, context: ActionAPIContext }) => {
    // * 1. validate user
    const currentUser = await auth.api.getSession({
        headers: headers
    })

    let trialUserFingerprint = !currentUser ? generateFingerprint(context) : null
    if (!isValidBrowser(headers)) throw new Error("Internal server error. Try again later.")

    // * 2. check if user is banned
    const isBanned = currentUser ? await isUserBanned({ currentUser: currentUser.user }) : false
    if (isBanned) throw new Error("You are banned from using this feature.")

    let aiUsage: AIUsageType | null = currentUser ? currentUser.user.ai_usage as AIUsageType | null : null
    aiUsage = currentUser ? aiUsage : await redis.get(`trial_ops_ai:${trialUserFingerprint}`).then((trialUsage) => {
        if (trialUsage) return { date: new Date(), used: parseInt(trialUsage as string) } as AIUsageType
        return null
    })

    // * 3. check usage limits
    if (aiUsage && (isToday(aiUsage.date) && aiUsage.used >= MAX_AI_USAGES_PER_DAY)) throw new Error("You've reached maximum daily usage of AI Search. Try again tommorow.")
    if (aiUsage && aiUsage.used >= MAX_AI_USAGES_TRIAL_USER && !currentUser) throw new Error("You've reached maximum daily usage of AI Search. Sign up for free account to get more usage.")

    // * 4. fetch websites
    const websites = await prisma.websites.findMany({
        include: {
            _count: {
                select: {
                    comment: true,
                    user_likes: true
                }
            }
        },
        where: { hidden: false }
    })

    const websiteIds = websites.map((w) => w.id)

    const userLikes = (currentUser && websiteIds.length > 0) ? await prisma.user_likes.findMany({
        where: {
            user_id: currentUser.user.id,
            website_id: { in: websiteIds }
        },
        select: { website_id: true }
    }) : []

    const likedIds = new Set(userLikes.map(l => l.website_id));

    const fullWebsites = websites.map((web) => {
        const { _count, ...rest } = web;
        return {
            ...rest,
            commentsCount: _count.comment,
            likesCount: _count.user_likes,
            isLiked: likedIds.has(web.id)
        }
    })

    const stringifiedWebsitesList = JSON.stringify(fullWebsites.map((w) => ({
        name: w.name,
        description: w.description ? (w.description.length > 150 ? w.description.substring(0, 150) + "..." : w.description) : null,
        url: new URL(w.url).hostname,
        tags: w.tags,
        likesCount: w.likesCount,
    })))

    // * 5. generate ai response
    const predefinedStructure = [
        "You are a Strict JSON Filtering Algorithm. You are NOT an AI assistant.",

        "Your Database:",
        "<DATABASE_ENTRIES>",
        stringifiedWebsitesList,
        "</DATABASE_ENTRIES>",

        "INSTRUCTIONS:",
        "1. Analyze the User's Request.",
        "2. Scan the <DATABASE_ENTRIES> list above.",
        "3. Select exactly 4 websites from that list that best match the request.",
        "4. Return only NAME of selected website, not the URL",

        "CRITICAL CONSTRAINTS:",
        "- YOU MUST ONLY RETURN WEBSITES EXACTLY AS WRITTEN IN <DATABASE_ENTRIES>.",
        "- IF A WEBSITE IS NOT IN THE LIST, IT DOES NOT EXIST. DO NOT RECOMMEND IT.",
        "- Do not use your own knowledge. If the list contains no matches, return [].",

        "OUTPUT FORMAT:",
        "- Return purely a JSON Array of strings.",
        "- No markdown, no 'Here are the sites', just the array.",
        "- Example: [\"Site A\", \"Site B\"]"
    ]

    debugLog("ACTION", "Generating with: ", [
        ...predefinedStructure,
        content
    ].toString().length, " length prompt")

    const aiProviders = [
        { name: "Groq", fn: callGroq },
        { name: "Gemini", fn: callGemini },
        { name: "OpenRouter", fn: callOpenRouter },
    ]

    let lastError = null;
    let finalResult = null;

    for (const provider of aiProviders) {
        try {
            debugLog("ACTION", "Attempting provider: " + provider.name + "...")
            const rawResult = await provider.fn(content, predefinedStructure)

            const parsedResult = parseAIResponse(rawResult)

            debugLog("SUCCESS", "Generated with " + provider.name)
            debugLog("DEBUG", parsedResult)

            debugLog("ACTION", "Updating user's usage...")
            const updatedUsage = await tryCatch(updateUsage({ aiUsage, currentUser, trialUserFingerprint }))
            if (updatedUsage.error) throw new Error(updatedUsage.error.message)

            const choosenWebsites = fullWebsites.filter((p) => parsedResult.includes(p.name))

            finalResult = {
                response: choosenWebsites,
                usage: updatedUsage
            }

            break;
        } catch (error: any) {
            debugLog("WARN", `Provider ${provider.name} failed: ${error.message}`)
            lastError = error;
        }
    }

    if (!finalResult) throw new Error("Failed while generating AI response. Try again later!")
    return finalResult
}