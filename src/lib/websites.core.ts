import type { JsonValue } from "@prisma/client/runtime/library";
import { debugLog } from "./log";
import getPrismaInstance from "./prisma"
import { tryCatch } from "./utils"
import type { Prisma } from "@prisma/client";
import type { SearchWebsitesResult } from "@/types/website";
import type { SORTING_TYPE } from "@/helpers/websites.helper";

export const fetchWebsiteTags = async () => {
    const prisma = getPrismaInstance();
    return await tryCatch(
        prisma.websites.findMany({
            select: { tags: true }
        })
    );
};

export const formatTagsWithCount = (data: { tags: JsonValue }[]) => {
    const tagCounts: Record<string, number> = {};
    data.forEach(site => {
        if (Array.isArray(site.tags)) {
            site.tags.forEach((tag) => {
                if (typeof tag === "string") {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                }
            });
        }
    });
    return Object.entries(tagCounts).map(([name, count]) => ({ name, count }));
};

export const PAGE_SIZE = 9
export const searchWebsites = async ({
    search,
    tags,
    page = 1,
    pageSize = PAGE_SIZE,
    sorting
}: { search?: string, tags?: string[], page?: number, pageSize?: number, sorting: SORTING_TYPE }): Promise<SearchWebsitesResult> => {
    debugLog("ACTION", 'searchWebsites()', { search, tags, page, pageSize, sorting });
    const prisma = getPrismaInstance();
    //debugLog("SUCCESS", ...(tags && Array.isArray(tags) && tags.length > 0 ? [{ tags: { array_contains: tags } }] : []))
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
        // TODO: add likes sorting
        // case "likes":
        //     orderBy = { likes: "desc" };
        //     break;
        default:
            orderBy = undefined;
    }

    const websites = await tryCatch(
        prisma.websites.findMany({
            where: ((conditions: Prisma.websitesWhereInput[]) =>
                conditions.length > 0 ? { AND: conditions } : {}
            )([
                ...(search ? [{ name: { contains: search, mode: "insensitive" as Prisma.QueryMode } }] : []),
                ...(search ? [{ description: { contains: search, mode: "insensitive" as Prisma.QueryMode } }] : []),
                ...(tags && Array.isArray(tags) && tags.length > 0 ? [{ tags: { hasEvery: tags } }] : [])
            ]),
            take: pageSize,
            skip: (page - 1) * pageSize,
            orderBy
        })
    );

    const allTags = await tryCatch(
        prisma.websites.findMany({
            where: ((conditions: Prisma.websitesWhereInput[]) =>
                conditions.length > 0 ? { AND: conditions } : {}
            )([
                ...(search ? [{ name: { contains: search, mode: "insensitive" as Prisma.QueryMode } }] : []),
                ...(search ? [{ description: { contains: search, mode: "insensitive" as Prisma.QueryMode } }] : []),
                ...(tags && Array.isArray(tags) && tags.length > 0 ? [{ tags: { hasEvery: tags } }] : [])
            ]),
            select: { tags: true },
            orderBy
        })
    );

    if (websites.error || !websites.data || allTags.error || !allTags.data) {
        debugLog("ERROR", "Failed to fetch websites: ", websites.error || allTags.error);
        return { websites: [], total: 0, tags: [] };
    };

    return {
        websites: websites.data,
        total: allTags.data.length,
        tags: formatTagsWithCount(allTags.data)
    };
}