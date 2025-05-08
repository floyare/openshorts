import { uploadSchema } from '@/helpers/upload.helper';
import { debugLog } from '@/lib/log';
import { getBestUploads, getProfileStats } from '@/lib/profile.core';
import { validateLimit } from '@/lib/ratelimiter';
import { uploadWebsite } from '@/lib/upload.core';
import { doesWebsiteExists, searchWebsites, toggleLikeWebsite } from '@/lib/websites.core';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

type SearchWebsitesProps = Parameters<typeof searchWebsites>[0];

export const server = {
    searchWebsites: defineAction({
        input: z.object({
            search: z.string().optional(),
            tags: z.array(z.string()).optional(),
            page: z.number().optional(),
            pageSize: z.number().optional(),
            sorting: z.enum(["new", "old", "alphabet", "likes"]).optional(),
            showOnlyLiked: z.boolean().optional().default(false)
        }) as z.ZodType<SearchWebsitesProps>,
        handler: async (input, context) => {
            const limit = await validateLimit(context.clientAddress)
            if (!limit.success) throw new Error("Ratelimited!")
            debugLog("DEBUG", context.clientAddress)
            return await searchWebsites({ ...input, headers: context.request.headers });
        }
    }),
    uploadWebsite: defineAction({
        input: uploadSchema,
        handler: async (input, context) => {
            const limit = await validateLimit(context.clientAddress)
            if (!limit.success) throw new Error("Ratelimited!")

            return await uploadWebsite({
                url: input.url,
                description: input.description,
                tags: input.tags,
                context: context
            })
        }
    }),
    toggleLikeWebsite: defineAction({
        input: z.object({
            websiteId: z.string()
        }),
        handler: async (input, context) => {
            const limit = await validateLimit(context.clientAddress)
            if (!limit.success) throw new Error("Ratelimited!")

            return await toggleLikeWebsite({
                websiteId: input.websiteId,
                context: context
            })
        }
    }),
    doesWebsiteExists: defineAction({
        input: z.object({
            url: z.string().nonempty()
        }),
        handler: async (input, context) => {
            const limit = await validateLimit(context.clientAddress)
            if (!limit.success) throw new Error("Ratelimited!")
            return await doesWebsiteExists(input.url)
        }
    }),
    getProfileStats: defineAction({
        input: z.object({
            name: z.string()
        }),
        handler: async (input, context) => {
            const limit = await validateLimit(context.clientAddress)
            if (!limit.success) throw new Error("Ratelimited!")
            return await getProfileStats(input.name)
        }
    }),
    getBestUploads: defineAction({
        input: z.object({
            name: z.string()
        }),
        handler: async (input, ctx) => {
            const limit = await validateLimit(ctx.clientAddress)
            if (!limit.success) throw new Error("Ratelimited!")
            return await getBestUploads(input.name, ctx)
        }
    })
}