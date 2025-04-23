import { debugLog } from "./log";
import getPrismaInstance from "./prisma"
import { tryCatch } from "./utils"

export const getAvailableTags = async () => {
    const prisma = getPrismaInstance();
    const result = await tryCatch(
        prisma.websites.findMany({
            select: { tags: true }
        })
    );

    if (result.error || !result.data || !Array.isArray(result.data)) {
        debugLog("ERROR", "Failed to fetch available tags", result.error);
        return []
    };

    const tagCounts: Record<string, number> = {};
    result.data.forEach(site => {
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