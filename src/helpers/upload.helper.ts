import { debugLog } from "@/lib/log";
import { z } from "astro/zod";
import { actions } from "astro:actions";

export const uploadSchema = z.object({
    url: z.string().url({ message: "Invalid URL" })
        .refine(async (url: string): Promise<boolean> => {
            if (!url) return false;
            debugLog("ACTION", "Checking if website exists", url);
            const exists: boolean | undefined = (await actions.doesWebsiteExists({ url })).data;
            return exists === false
        }, { message: "Website already exists" }),
    description: z.string().min(10).max(200),
    tags: z.string({ message: "Minimum 1 tag is required!" }).array().max(4).min(1),
})