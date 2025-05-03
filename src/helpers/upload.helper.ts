import { z } from "astro/zod";

export const uploadSchema = z.object({
    url: z.string().url({ message: "Invalid URL" })
        .refine(async (url) => {
            // TODO: website exists check
            return true
        }, { message: "Website already exists" }),
    description: z.string().min(10).max(200),
    tags: z.string(),
})