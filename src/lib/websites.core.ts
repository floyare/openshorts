import { debugLog } from "./log";
import getPrismaInstance from "./prisma"
import { tryCatch } from "./utils"
import type { Prisma } from "@prisma/client";
import type { SearchWebsitesResult } from "@/types/website";
import { formatTagsWithCount, PAGE_SIZE, type ReportOption, type SORTING_TYPE } from "@/helpers/websites.helper";
import { auth } from "./auth";
import type { ActionAPIContext } from "astro:actions";
import { differenceInHours } from "date-fns"
import { getWebsiteScreen } from "./screen.core";
import { uploadFile } from "./upload.core";
import { UTApi } from "uploadthing/server";
import { isUserBanned } from "./user.core";

export const reportWebsite = async ({ url, content, context }: { url: string, content: ReportOption, context: ActionAPIContext }) => {
    const currentUser = await auth.api.getSession({
        headers: context.request.headers
    })

    if (!currentUser?.user) throw new Error("User not logged in")

    const prisma = getPrismaInstance();

    await prisma.report.create({
        data: {
            created_by: currentUser.user.name,
            type: content.type,
            content: content.text,
            url: url
        }
    })
}

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
            hidden: false,
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

export const updateWebsitePreview = async ({ headers, url }: { headers: Headers, url: string }) => {
    const currentUser = await auth.api.getSession({
        headers: headers
    })

    if (!currentUser) throw new Error("User not logged in")

    const isBanned = await isUserBanned({ currentUser: currentUser.user })
    if (!!isBanned) throw new Error("Your account is banned.")

    const result = await getPrismaInstance().websites.findFirst({
        where: {
            hidden: false,
            url: url,
            created_by: currentUser.user.name
        }
    })

    if (!(!!result)) throw new Error("You don't have access to this website.")

    if (differenceInHours(new Date(), result.last_preview_update) < 24) throw new Error("You can update this website's preview once a day.")

    debugLog("DEBUG", "(updateWebsitePreview) Getting website screen...")
    const websiteScreen = await tryCatch(getWebsiteScreen(url));
    if (!websiteScreen.data || websiteScreen.error) {
        debugLog("ERROR", 'Failed while getting website screen: ' + (websiteScreen.error?.message ?? "data empty"));
        throw new Error("Failed while getting website screen. Try again later")
    }

    debugLog("DEBUG", "(updateWebsitePreview) Uploading website screen...")
    const uploadResult = websiteScreen.error || !websiteScreen.data ? { data: { ufsUrl: null }, error: null } : await tryCatch(uploadFile({ fileObj: websiteScreen.data }));
    if (!uploadResult.data || uploadResult.error) throw new Error('Failed while uploading website screen: ' + (uploadResult.error?.message ?? "data empty"));

    await getPrismaInstance().websites.update({
        where: {
            hidden: false,
            url: url,
            created_by: currentUser.user.name
        },
        data: {
            image: uploadResult.data.ufsUrl,
            last_preview_update: new Date()
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
            where: { hidden: false },
            select: { tags: true }
        })
    );
};

export const fetchWebsiteComments = async ({ url }: { url: string }) => {
    const prisma = getPrismaInstance();
    return await prisma.comment.findMany({
        where: { website_url: url },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                }
            }
        },
        orderBy: { created_at: "desc" }
    });
}

export const postWebsiteComment = async ({ url, comment, headers }: { url: string, comment: string, headers: Headers }) => {
    const currentUser = await auth.api.getSession({
        headers: headers
    })

    if (!currentUser) throw new Error("User not logged in")

    const isBanned = await isUserBanned({ currentUser: currentUser.user })
    if (!!isBanned) throw new Error("Your account is banned.")

    const prisma = getPrismaInstance();
    const result = await tryCatch(prisma.comment.create({
        data: {
            content: comment,
            website_url: url,
            created_by: currentUser.user.name
        }
    }))

    if (result.error) {
        debugLog("ERROR", "Failed while posting comment: ", result.error)
        throw new Error("Failed while posting comment")
    }

    return result.data
}

export const removeWebsite = async ({ headers, url }: { headers: Headers, url: string }) => {
    const currentUser = await auth.api.getSession({
        headers: headers
    })

    if (!currentUser) return false

    const result = await tryCatch(getPrismaInstance().websites.delete({
        where: {
            url: url,
            created_by: currentUser.user.name
        }
    }))

    const utapi = new UTApi({
        token: import.meta.env.UPLOADTHING_TOKEN,
    });

    await utapi.deleteFiles(new URL(url).hostname, { keyType: "customId" });

    debugLog("SUCCESS", 'r', result)

    return !!result.data || !(!!result.error)
}

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
        ...[{ hidden: false }],
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
            orderBy,
            include: {
                comment: {
                    select: { id: true }
                }
            }
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
        commentsCount: w.comment.length,
        isLiked: likedWebsiteIds.includes(w.id),
        likesCount: likeCounts[w.id]
    }))

    return {
        websites: websitesWithIsLiked,
        total: allTags.data.length,
        tags: formatTagsWithCount(allTags.data)
    };
}