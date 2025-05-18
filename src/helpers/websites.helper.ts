import type { JsonValue } from "@prisma/client/runtime/library";

export const PAGE_SIZE = 12
export const DEBUG_ALLOW_LIKE_OWN_WEBSITES = false

export const DEFINED_TAGS = [
    "AI",
    "ASSETS",
    "UI/UX",
    "FRONTEND",
    "BACKEND",
    "GRAPHICS",
    "TOOLS",
    "PLATFORMS",
    "LIBRARIES",
    "FRAMEWORKS",
    "INSPIRATION",
    "COMMUNITY",
    "LEARNING",
    "DOCUMENTATION",
    "TEMPLATES",
    "ICONS",
    "FONTS",
    "HOSTING",
    "CMS",
    "API",
    "AUDIO",
    "VIDEO"
];

export type SORTING_TYPE = "new" | "old" | "alphabet" | "likes"

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