import { debugLog } from "./log";
import getPrismaInstance from "./prisma"
import { tryCatch } from "./utils"
import type { Prisma } from "@prisma/client";
import type { SearchWebsitesResult } from "@/types/website";
import { formatTagsWithCount, PAGE_SIZE, type SORTING_TYPE } from "@/helpers/websites.helper";
import { auth } from "./auth";
import type { ActionAPIContext } from "astro:actions";

export const toggleLikeWebsite = async ({ websiteId, context }: { websiteId: string, context: ActionAPIContext }) => {
    debugLog("ACTION", 'Executing like action', websiteId)
    const currentUser = await auth.api.getSession({
        headers: context.request.headers
    })

    if (!currentUser?.user) throw new Error("User not logged in")

    const prisma = getPrismaInstance();

    const existingLike = await prisma.user_likes.findUnique({
        where: {
            user_id_website_id: {
                user_id: currentUser.user.id,
                website_id: websiteId
            }
        }
    });

    if (existingLike) {
        await prisma.user_likes.delete({
            where: {
                user_id_website_id: {
                    user_id: currentUser.user.id,
                    website_id: websiteId
                }
            }
        });
        return { liked: false };
    } else {
        await prisma.user_likes.create({
            data: {
                user_id: currentUser.user.id,
                website_id: websiteId
            }
        });
        return { liked: true };
    }
}

export const getMyUploads = async ({ headers }: { headers: Headers }) => {
    const currentUser = await auth.api.getSession({
        headers: headers
    })

    if (!currentUser) return []

    //await new Promise(resolve => setTimeout(resolve, 3500));

    const result = await getPrismaInstance().websites.findMany({
        where: {
            created_by: currentUser.user.name
        }
    })

    const likes = await getLikeCountsForWebsites(getPrismaInstance(), result.map((w) => w.id))

    debugLog("DEBUG", 'likes', likes)

    return result.map((web) => {
        return {
            ...web,
            likes: likes[web.id]
        }
    })
}

export const doesWebsiteExists = async (url: string) => {
    const prisma = getPrismaInstance();
    return !!(
        (await prisma.websites.findFirst({
            where: { url },
            select: { id: true }
        }))
    ) as boolean
}

export const fetchWebsiteTags = async () => {
    const prisma = getPrismaInstance();
    return await tryCatch(
        prisma.websites.findMany({
            select: { tags: true }
        })
    );
};

export async function getLikeCountsForWebsites(prisma: ReturnType<typeof getPrismaInstance>, websiteIds: string[]) {
    if (websiteIds.length === 0) return {};
    const likes = await prisma.user_likes.groupBy({
        by: ['website_id'],
        where: { website_id: { in: websiteIds } },
        _count: { website_id: true }
    });
    return likes.reduce((acc, curr) => {
        acc[curr.website_id] = curr._count.website_id;
        return acc;
    }, {} as Record<string, number>);
}

export const searchWebsites = async ({
    search,
    tags,
    page = 1,
    pageSize = PAGE_SIZE,
    sorting,
    headers,
    showOnlyLiked = false
}: { search?: string, tags?: string[], page?: number, pageSize?: number, sorting: SORTING_TYPE, headers?: Headers, showOnlyLiked?: boolean }): Promise<SearchWebsitesResult> => {
    debugLog("ACTION", 'searchWebsites()', { search, tags, page, pageSize, sorting, showOnlyLiked });
    const prisma = getPrismaInstance();

    let orderBy: Prisma.websitesOrderByWithRelationInput | undefined;

    switch (sorting) {
        case "new":
            orderBy = { created_at: "desc" };
            break;
        case "old":
            orderBy = { created_at: "asc" };
            break;
        case "alphabet":
            orderBy = { name: "asc" };
            break;
        case "likes":
            orderBy = { user_likes: { _count: "desc" } };
            break;
        default:
            orderBy = undefined;
    }

    const currentUser = headers ? await auth.api.getSession({
        headers: headers
    }) : null;

    const whereConditions: Prisma.websitesWhereInput[] = [
        ...(search ? [
            {
                OR: [
                    { name: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
                    { description: { contains: search, mode: "insensitive" as Prisma.QueryMode } }
                ]
            }
        ] : []),
        ...(tags && Array.isArray(tags) && tags.length > 0 ? [{ tags: { hasEvery: tags } }] : []),
        ...(showOnlyLiked && currentUser?.user?.id ? [{
            user_likes: {
                some: {
                    user_id: currentUser.user.id
                }
            }
        }] : [])
    ];

    const where: Prisma.websitesWhereInput = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const websites = await tryCatch(
        prisma.websites.findMany({
            where,
            take: pageSize,
            skip: (page - 1) * pageSize,
            orderBy
        })
    );

    const allTags = await tryCatch(
        prisma.websites.findMany({
            where,
            select: { tags: true },
            orderBy
        })
    );

    if (websites.error || !websites.data || allTags.error || !allTags.data) {
        debugLog("ERROR", "Failed to fetch websites: ", websites.error || allTags.error);
        return { websites: [], total: 0, tags: [] };
    };

    let likedWebsiteIds: string[] = [];
    const websiteIds = websites.data.map(w => w.id);

    if (headers) {
        debugLog("DEBUG", "(searchWebsites) headers detected")

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
    }

    const likeCounts = await getLikeCountsForWebsites(prisma, websiteIds);

    const websitesWithIsLiked = websites.data.map(w => ({
        ...w,
        isLiked: likedWebsiteIds.includes(w.id),
        likesCount: likeCounts[w.id]
    }))

    return {
        websites: websitesWithIsLiked,
        total: allTags.data.length,
        tags: formatTagsWithCount(allTags.data)
    };
}