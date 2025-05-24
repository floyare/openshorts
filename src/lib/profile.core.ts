import type { WebsiteType } from "@/types/website";
import getPrismaInstance from "./prisma";
import { getLikeCountsForWebsites } from "./websites.core";
import type { ActionAPIContext, AstroActionContext } from "astro:actions";
import { auth } from "./auth";
import { debugLog } from "./log";

export async function getProfileStats(name: string) {
    const prisma = getPrismaInstance();
    const websitesUploaded = await prisma.websites.count({
        where: {
            hidden: false,
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
export async function getBestUploads(name: string, ctx: ActionAPIContext) {
    const prisma = getPrismaInstance();

    const websites = await prisma.websites.findMany({
        where: {
            created_by: name,
            hidden: false
        },
        include: {
            comment: {
                select: { id: true }
            }
        },
        take: 3,
        orderBy: { user_likes: { _count: "desc" } },
    });

    const currentUser = await auth.api.getSession({
        headers: ctx.request.headers
    })

    let likedWebsiteIds: string[] = [];
    const websiteIds = websites.map(w => w.id);

    if (currentUser?.user) {
        debugLog("DEBUG", "(searchWebsites) user loged in")

        const prisma = getPrismaInstance();
        const userLikes = await prisma.user_likes.findMany({
            where: {
                user_id: currentUser.user.id,
                website_id: { in: websiteIds }
            },
            select: { website_id: true }
        });

        likedWebsiteIds = userLikes.map(like => like.website_id);
        debugLog("DEBUG", "(searchWebsites) user likes", likedWebsiteIds)
    }

    const likeCounts = await getLikeCountsForWebsites(prisma, websites.map((p) => p.id));
    return websites.map((w) => {
        return {
            ...w,
            isLiked: likedWebsiteIds.includes(w.id),
            commentsCount: w.comment.length,
            likesCount: likeCounts[w.id]
        }
    }) as WebsiteType[]
}