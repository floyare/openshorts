import { debugLog } from "@/lib/log";
//import { doesWebsiteExists } from "@/lib/websites.core";
import { z } from "astro/zod";
import { actions } from "astro:actions";

// TODO: it might not work on serverless
let currentUploadUrl = { url: "", available: true }

export const uploadSchema = z.object({
    url: z.string().url({ message: "Invalid URL" })
        .refine(async (url: string): Promise<boolean> => {
            if (!url) return false;
            if (url === currentUploadUrl.url) {
                debugLog("INFO", "Used cached result from URL")
                return currentUploadUrl.available === false
            }

            const isServer = typeof window === "undefined";
            debugLog("ACTION", "Checking if website exists", `(${isServer ? "SERVER" : "CLIENT"})`, url);
            const exists: boolean | undefined = await (await actions.doesWebsiteExists({ url })).data
            //isServer ? await doesWebsiteExists(url) : (await actions.doesWebsiteExists({ url })).data;

            currentUploadUrl = { url: url, available: exists === false }
            return exists === false
        }, { message: "Website already exists" }),
    description: z.string().min(10).max(200),
    tags: z.string({ message: "Minimum 1 tag is required!" }).array().max(4).min(1),
})