import type { categories, comment, websites } from "@prisma/client"
import type { string } from "astro:schema"

export interface WebsiteComment extends comment {

}

export interface WebsiteType extends websites {
    id: string,
    name: string,
    url: string,
    description: string | null,
    image: string | null,
    category: categories,
    tags: string[],
    commentsCount?: number,
    isLiked?: boolean,
    likesCount?: number
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
