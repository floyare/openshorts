import { GoogleGenAI } from "@google/genai"
import getPrismaInstance from "./prisma"
import { getLikeCountsForWebsites } from "./websites.core"
import { debugLog } from "./log"
import { auth } from "./auth"


export const getWebsitesRecommendation = async ({ headers, content }: { headers: Headers, content: string }) => {
    const websites = await getPrismaInstance().websites.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            url: true,
            image: true,
            tags: true,
            created_by: true
        }
    })

    const websiteLikes = await getLikeCountsForWebsites(getPrismaInstance(), websites.map((w) => w.id))

    const currentUser = await auth.api.getSession({
        headers: headers
    })

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
            isLiked: userLikes.map((l) => l.website_id).includes(web.id),
            likesCount: websiteLikes[web.id] ?? 0
        }
    })

    //debugLog("SUCCESS", 'Got websites', fullWebsites)

    const ai = new GoogleGenAI({ apiKey: import.meta.env.GEMINI_API_KEY })
    const predefinedStructure = [
        "(YOUR JOB IS TO RECOMMEND WEBSITES BASED ON THE REQUEST, THE BEST 3 WEBSITES BASED ON USER'S REQUIREMENTS AND SORTING BY THE MOST LIKES)",
        "(RETURN RECOMMENDED WEBSITES IN JSON ARRAY FORMAT, WITH THE SAME JSON OBJECT FORMAT I GAVE YOU THESE WEBSITES)",
        "(IF YOU ARE NOT SURE OR DON'T FIND BEST MATCHES, THEN JUST RETURN AN EMPTY ARRAY, DO NOT WRITE ANY COMMENTS, JUST RETURN PLAIN JSON ARRAY, DON'T EVEN TYPE MARKDOWN FORMAT, RETURN PLAIN JSON)",
        "(IF YOU CAN'T FIND 3 BEST MATCHES YOU CAN RETURN FEWER)",
        "(FOR PICKING THE BEST 3 WEBSITES, USE THE DESCRIPTION, TAGS AND GENERAL KNOWLEDGE ABOUT SPECIFIC URL)",
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

    const extractedJson = response.text?.replaceAll("```json", "").replaceAll("```", "") ?? "[]"
    return JSON.parse(extractedJson ?? [])
}