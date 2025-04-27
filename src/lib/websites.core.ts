import type { JsonValue } from "@prisma/client/runtime/library";
import { debugLog } from "./log";
import getPrismaInstance from "./prisma"
import { tryCatch } from "./utils"
import type { Prisma } from "@prisma/client";
import type { SearchWebsitesResult } from "@/types/website";
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

export const PAGE_SIZE = 1
export const searchWebsites = async ({
    search,
    tags,
    page = 1,
    pageSize = PAGE_SIZE
}: { search?: string, tags?: string[], page?: number, pageSize?: number }): Promise<SearchWebsitesResult> => {
    const prisma = getPrismaInstance();
    //debugLog("SUCCESS", ...(tags && Array.isArray(tags) && tags.length > 0 ? [{ tags: { array_contains: tags } }] : []))
    const websites = await tryCatch(
        prisma.websites.findMany({
            where: ((conditions: Prisma.websitesWhereInput[]) =>
                conditions.length > 0 ? { OR: conditions } : {}
            )([
                ...(search ? [{ name: { contains: search, mode: "insensitive" as Prisma.QueryMode } }] : []),
                ...(search ? [{ description: { contains: search, mode: "insensitive" as Prisma.QueryMode } }] : []),
                ...(tags && Array.isArray(tags) && tags.length > 0 ? [{ tags: { hasSome: tags } }] : [])
            ]),
            take: pageSize,
            skip: (page - 1) * pageSize
        })
    );

    const allTags = await tryCatch(
        prisma.websites.findMany({
            where: ((conditions: Prisma.websitesWhereInput[]) =>
                conditions.length > 0 ? { OR: conditions } : {}
            )([
                ...(search ? [{ name: { contains: search, mode: "insensitive" as Prisma.QueryMode } }] : []),
                ...(search ? [{ description: { contains: search, mode: "insensitive" as Prisma.QueryMode } }] : []),
                ...(tags && Array.isArray(tags) && tags.length > 0 ? [{ tags: { hasSome: tags } }] : [])
            ]),
            select: { tags: true }
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