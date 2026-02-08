/*
    * ai-vector.core - prototype of revamped ai.core that uses only vector search enhanced by openrouter and google embedding models to improve search results.
*/

import { GoogleGenAI } from "@google/genai";
import { debugLog } from "./log";
import type { ActionAPIContext } from "astro:actions";
import { prisma, redis } from "./prisma";
import { isToday } from "date-fns";
import { MAX_AI_USAGES_PER_DAY, MAX_AI_USAGES_TRIAL_USER } from "@/helpers/ai.helper";
import type { AIUsageType } from "@/types/user";
import { isUserBanned } from "./user.core";
import { isValidBrowser, tryCatch } from "./utils";
import { auth } from "./auth";
import { generateFingerprint, updateUsage } from "./ai.core";

const apiKey = import.meta.env?.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;

export async function generateEmbedding(input: string): Promise<number[]> {
    const cleanedInput = input.replace(/\n/g, " ").trim();

    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: [
            { role: "user", parts: [{ text: cleanedInput }] }
        ],
    })

    const vectors = response.embeddings ? response.embeddings[0].values : (() => { throw new Error("Embeddings are empty") })()
    return vectors ?? []
}

export const getVectorBasedRecommendations = async ({ headers, input, context }: { headers: Headers, input: string, context: ActionAPIContext }) => {
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

    // * 4. generate vector embedding from user's input
    const vector = await generateEmbedding(input)
    const vectorStr = JSON.stringify(vector)

    const vectorMatches = await prisma.$queryRaw<Array<{ id: string; similarity: number }>>`
        SELECT 
            id, 
            (1 - (embedding <=> ${vectorStr}::vector)) as similarity
        FROM websites
        WHERE hidden = false
        AND (1 - (embedding <=> ${vectorStr}::vector)) > 0.5
        ORDER BY embedding <=> ${vectorStr}::vector ASC
        LIMIT 4;
    `;

    //debugLog("DEBUG", 'VECTORS', vectorMatches)

    //if (vectorMatches.length === 0) return [];

    const matchIds = vectorMatches.map(m => m.id);

    const websites = await prisma.websites.findMany({
        where: { id: { in: matchIds } },
        include: {
            _count: {
                select: { comment: true, user_likes: true }
            }
        }
    });

    debugLog("WARN", websites)

    const sortedWebsites = matchIds
        .map(id => websites.find(w => w.id === id))
        .filter(Boolean);

    const userLikes = (currentUser) ? await prisma.user_likes.findMany({
        where: {
            user_id: currentUser.user.id,
            website_id: { in: matchIds }
        },
        select: { website_id: true }
    }) : [];

    const likedIds = new Set(userLikes.map(l => l.website_id));

    // * 5. update user's usage
    const updatedUsage = await tryCatch(updateUsage({ aiUsage, currentUser, trialUserFingerprint }))
    if (updatedUsage.error) throw new Error(updatedUsage.error.message)

    const uniqueWebsites = Array.from(new Map(sortedWebsites.filter(Boolean).map(web => [web!.id, web])).values());

    return {
        response: uniqueWebsites.map((web: any) => ({
            ...web,
            commentsCount: web._count.comment,
            likesCount: web._count.user_likes,
            isLiked: likedIds.has(web.id)
        })),
        usage: updatedUsage
    };
}