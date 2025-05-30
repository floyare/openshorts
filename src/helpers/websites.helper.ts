import type { JsonValue } from "@prisma/client/runtime/library";
import { z } from "astro/zod";

export const PAGE_SIZE = 12
export const MAX_PAGES_TO_LOAD = 10
export const DEBUG_ALLOW_LIKE_OWN_WEBSITES = false

export const MIN_COMMENT_LENGTH = 3
export const MAX_COMMENT_LENGTH = 100

export const commentSchema = z.object({
    url: z.string().url({ message: "Invalid URL" }),
    content: z.string()
        .min(MIN_COMMENT_LENGTH, { message: `Comment must be at least ${MIN_COMMENT_LENGTH} characters long` })
        .max(MAX_COMMENT_LENGTH, { message: `Comment must be at most ${MAX_COMMENT_LENGTH} characters long` })
})

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