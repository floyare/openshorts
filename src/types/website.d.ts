import type { categories, websites } from "@prisma/client"


export interface WebsiteType extends websites {
    id: string,
    name: string,
    url: string,
    description: string | null,
    image: string,
    category: categories,
    tags: string[]
}

export type WebsiteTag = {
    name: string,
    count: number
}

export type SearchWebsitesResult = {
    websites: WebsiteType[],
    total: number,
    tags: WebsiteTag[]
}

export type SearchContentType = {
    search: string,
    tags: string[]
}
