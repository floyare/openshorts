import type { WebsiteType } from "@/types/website";
import getPrismaInstance from "./prisma";
import { getLikeCountsForWebsites } from "./websites.core";

export async function getProfileStats(name: string) {
    const prisma = getPrismaInstance();
    const websitesUploaded = await prisma.websites.count({
        where: {
            created_by: name
        }
    });

    const likesCount = await prisma.user_likes.count({
        where: {
            websites: {
                created_by: name
            }
        }
    });

    return { uploaded: websitesUploaded, likes: likesCount }
}

// TODO: create one function for fetching websites with isLiked and likesCount wtih any modifier
export async function getBestUploads(name: string) {
    const prisma = getPrismaInstance();

    const websites = await prisma.websites.findMany({
        where: {
            created_by: name
        },
        take: 3,
        orderBy: { user_likes: { _count: "desc" } },
    });


    const likeCounts = await getLikeCountsForWebsites(prisma, websites.map((p) => p.id));
    return websites.map((w) => {
        return {
            ...w,
            likesCount: likeCounts[w.id]
        }
    }) as WebsiteType[]
}