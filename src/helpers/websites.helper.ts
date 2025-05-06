import type { JsonValue } from "@prisma/client/runtime/library";

export const PAGE_SIZE = 12
export const DEBUG_ALLOW_LIKE_OWN_WEBSITES = false

// TODO: może wlasnie kategoryzowac tagi do kategorii tak jak tu i potem je wyswietlac w takich kategoriach
export const DEFINED_TOPICS = {
    "Frontend Development": [
        "UI/UX",
        "SEO",
        "Fonts",
        "Templates",
        "Icons",
        "Images",
        "Performance",
        "Testing",
        "Accessibility",
        "Frameworks"
    ],
    "Backend Development": [
        "API",
        "Security",
        "Analytics",
        "E-commerce",
        "Open Source",
        "Documentation",
        "Databases",
        "Authentication"
    ],
    "Programming": [
        "Development",
        "Learning",
        "Productivity",
        "Collaboration",
        "Testing",
        "Version Control",
        "Code Review"
    ],
    "Graphics Design": [
        "Design",
        "Assets",
        "Icons",
        "Images",
        "Video",
        "Audio",
        "Templates",
        "Color Tools",
        "Mockups"
    ],
    "Marketing": [
        "Marketing",
        "Analytics",
        "SEO",
        "Email",
        "Social Media"
    ],
    "AI & Automation": [
        "AI",
        "Tool",
        "Automation",
        "Chatbots"
    ]
};

export const DEFINED_TAGS = [
    "AI", "ASSETS", "UI/UX"
]

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