import { GoogleGenAI } from "@google/genai"
import getPrismaInstance from "./prisma"
import { getLikeCountsForWebsites } from "./websites.core"
import { debugLog } from "./log"
import { auth } from "./auth"
import type { AIUsageType } from "@/types/user"
import { isToday } from "date-fns"
import { MAX_AI_USAGES_PER_DAY } from "@/helpers/ai.helper"

export const getWebsitesRecommendation = async ({ headers, content }: { headers: Headers, content: string }) => {
    const currentUser = await auth.api.getSession({
        headers: headers
    })

    if (!currentUser) throw new Error("You must be logged in to perform this action")

    const aiUsage: AIUsageType | null = currentUser.user.ai_usage as AIUsageType | null
    if (aiUsage && (isToday(aiUsage.date) && aiUsage.used >= MAX_AI_USAGES_PER_DAY)) throw new Error("You've reached maximum daily usage of Search AI. Try again tommorow.")

    const websites = await getPrismaInstance().websites.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            url: true,
            image: true,
            tags: true,
            created_by: true,
            comment: {
                select: { id: true }
            }
        },
    })

    const websiteLikes = await getLikeCountsForWebsites(getPrismaInstance(), websites.map((w) => w.id))

    const userLikes = currentUser ? await getPrismaInstance().user_likes.findMany({
        where: {
            user_id: currentUser.user.id,
            website_id: { in: websites.map((w) => w.id) }
        },
        select: { website_id: true }
    }) : []

    const fullWebsites = websites.map((web) => {
        return {
            ...web,
            commentsCount: web.comment.length,
            isLiked: userLikes.map((l) => l.website_id).includes(web.id),
            likesCount: websiteLikes[web.id] ?? 0
        }
    })

    //debugLog("SUCCESS", 'Got websites', fullWebsites)

    const ai = new GoogleGenAI({ apiKey: import.meta.env.GEMINI_API_KEY })
    const predefinedStructure = [
        "(YOUR JOB IS TO RECOMMEND WEBSITES BASED ON THE REQUEST, THE BEST 4 WEBSITES BASED ON USER'S REQUIREMENTS AND SORTING BY THE MOST LIKES)",
        "(RETURN RECOMMENDED WEBSITES IN JSON ARRAY FORMAT, WITH THE SAME JSON OBJECT FORMAT I GAVE YOU THESE WEBSITES)",
        "(IF YOU ARE NOT SURE OR DON'T FIND BEST MATCHES, THEN JUST RETURN AN EMPTY ARRAY, DO NOT WRITE ANY COMMENTS, JUST RETURN PLAIN JSON ARRAY, DON'T EVEN TYPE MARKDOWN FORMAT, RETURN PLAIN JSON)",
        "(IF YOU CAN'T FIND 4 BEST MATCHES YOU CAN RETURN FEWER)",
        "(FOR PICKING THE BEST 4 WEBSITES, USE THE DESCRIPTION, TAGS AND GENERAL KNOWLEDGE ABOUT SPECIFIC URL)",
        "(HERE ARE WEBSITES ARRAY)",
        JSON.stringify(fullWebsites),
        "USER REQUEST CONTENT:"
    ]

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: [
            ...predefinedStructure,
            content
        ]
    })

    debugLog("WARN", response.text)

    const updatedUsage: AIUsageType = (!aiUsage || (!isToday(aiUsage.date)) ? {
        date: new Date(),
        used: 1
    } : {
        date: aiUsage.date,
        used: aiUsage.used + 1
    })

    await getPrismaInstance().user.update({
        where: {
            id: currentUser.user.id
        },
        data: {
            ai_usage: updatedUsage
        }
    })

    const extractedJson = response.text?.replaceAll("```json", "").replaceAll("```", "") ?? "[]"
    return { response: JSON.parse(extractedJson ?? []), usage: updatedUsage }
}