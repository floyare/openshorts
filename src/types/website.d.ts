import type { categories } from "@prisma/client"


export type WebsiteType = {
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
