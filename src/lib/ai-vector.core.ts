/*
    * ai-vector.core - prototype of revamped ai.core that uses only vector search enhanced by openrouter and google embedding models to improve search results.
*/

import { GoogleGenAI } from "@google/genai";
import { debugLog } from "./log";
import type { ActionAPIContext } from "astro:actions";
import { prisma } from "./prisma";

const apiKey = import.meta.env?.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;

export async function generateEmbedding(input: string): Promise<number[]> {
    const cleanedInput = input.replace(/\n/g, " ").trim();

    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: [
            { role: "user", parts: [{ text: cleanedInput }] }
        ]
    })

    const vectors = response.embeddings ? response.embeddings[0].values : (() => { throw new Error("Embeddings are empty") })()
    return vectors ?? []
}

export const getVectorBasedRecommendations = async ({ headers, input, context }: { headers?: Headers, input: string, context?: ActionAPIContext }) => {
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

    debugLog("DEBUG", 'VECTORS', vectorMatches)

    if (vectorMatches.length === 0) return [];

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

    // const userLikes = (currentUser) ? await prisma.user_likes.findMany({
    //     where: {
    //         user_id: currentUser.user.id,
    //         website_id: { in: matchIds }
    //     },
    //     select: { website_id: true }
    // }) : [];

    // const likedIds = new Set(userLikes.map(l => l.website_id));

    // return sortedWebsites.map((web: any) => ({
    //     ...web,
    //     commentsCount: web._count.comment,
    //     likesCount: web._count.user_likes,
    //     isLiked: likedIds.has(web.id)
    // }));
}