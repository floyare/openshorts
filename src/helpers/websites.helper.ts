import type { JsonValue } from "@prisma/client/runtime/library";
import { z } from "astro/zod";
import { DISPLAY_AD_BANNERS } from "./user.helper";

export const PAGE_SIZE = DISPLAY_AD_BANNERS ? 11 : 12 // * changed to 11 due to adding ad element
export const MAX_PAGES_TO_LOAD = 6
export const DEBUG_ALLOW_LIKE_OWN_WEBSITES = false

export const MIN_COMMENT_LENGTH = 3
export const MAX_COMMENT_LENGTH = 100

export type ReportOption = z.infer<typeof reportSchema>

export const REPORT_TYPES = [
    { type: "INVALID_NAME_OR_DESCRIPTION", text: "Website has invalid name or description" },
    { type: "BROKEN_URL_OR_NOT_ACTIVE", text: "Website is not working or URL is invalid" },
    { type: "HARRASING_OR_MATURE_CONTENT", text: "Harrasing or mature content" },
    { type: "OTHER", text: "Other" }
]

export const REPORT_TEXT_MIN_LENGTH = 5
export const REPORT_TEXT_MAX_LENGTH = 200

export const reportSchema = z.object({
    type: z.enum([...REPORT_TYPES.map((p) => p.type)] as [string, ...string[]]),
    text: z.string().min(REPORT_TEXT_MIN_LENGTH).max(REPORT_TEXT_MAX_LENGTH)
})

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
    "VIDEO",
    "APPS"
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