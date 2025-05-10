import { debugLog } from "@/lib/log";
//import { doesWebsiteExists } from "@/lib/websites.core";
import { z } from "astro/zod";
import { actions } from "astro:actions";

let currentUploadUrl = { url: "", available: true }

export const MAX_TAGS_PER_UPLOAD = 4

export const uploadSchema = z.object({
    url: z.string().url({ message: "Invalid URL" })
        .refine(async (url: string): Promise<boolean> => {
            if (!url) return false;
            if (url === currentUploadUrl.url) {
                debugLog("INFO", "Used cached result from URL")
                return currentUploadUrl.available
            }

            const isServer = typeof window === "undefined";
            debugLog("ACTION", "Checking if website exists", `(${isServer ? "SERVER" : "CLIENT"})`, url);
            const exists: boolean | undefined = await (await actions.doesWebsiteExists({ url })).data
            //isServer ? await doesWebsiteExists(url) : (await actions.doesWebsiteExists({ url })).data;

            currentUploadUrl = { url: url, available: exists === false }
            return exists === false
        }, { message: "Website already exists" }),
    description: z.string().min(10).max(200),
    tags: z.string({ message: "Minimum 1 tag is required!" }).array().max(MAX_TAGS_PER_UPLOAD).min(1),
})