import { MAX_PROMPT_LENGTH } from '@/helpers/ai.helper';
import { uploadSchema } from '@/helpers/upload.helper';
import { commentSchema } from '@/helpers/websites.helper';
import { getWebsitesRecommendation } from '@/lib/ai.core';
import { debugLog } from '@/lib/log';
import { getBestUploads, getProfileStats } from '@/lib/profile.core';
import { validateLimit } from '@/lib/ratelimiter';
import { uploadWebsite } from '@/lib/upload.core';
import { doesWebsiteExists, fetchWebsiteComments, getMyUploads, postWebsiteComment, removeWebsite, searchWebsites, toggleLikeWebsite, updateWebsitePreview } from '@/lib/websites.core';
import type { AIUsageType } from '@/types/user';
import type { WebsiteType } from '@/types/website';
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { admin } from './admin';
import { user } from './user';

type SearchWebsitesProps = Parameters<typeof searchWebsites>[0];

export const server = {
    admin,
    user,
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
                captcha: input.captcha,
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
    }),
    getMyUploads: defineAction({
        handler: async (input, ctx) => {
            const limit = await validateLimit(ctx.clientAddress)
            if (!limit.success) throw new Error("Ratelimited!")
            return await getMyUploads({ headers: ctx.request.headers })
        }
    }),
    removeWebsite: defineAction({
        input: z.object({
            url: z.string().url()
        }),
        handler: async (Input, ctx) => {
            const limit = await validateLimit(ctx.clientAddress)
            if (!limit.success) throw new Error("Ratelimited!")
            return await removeWebsite({ headers: ctx.request.headers, url: Input.url })
        }
    }),
    updateWebsitePreview: defineAction({
        input: z.object({
            url: z.string().url()
        }),
        handler: async (input, ctx) => {
            const limit = await validateLimit(ctx.clientAddress)
            if (!limit.success) throw new Error("Ratelimited!")
            return await updateWebsitePreview({ headers: ctx.request.headers, url: input.url })
        }
    }),
    getWebsitesRecommendation: defineAction({
        input: z.object({
            content: z.string().max(MAX_PROMPT_LENGTH)
        }),
        handler: async (input, ctx) => {
            const limit = await validateLimit(ctx.clientAddress, 3)
            if (!limit.success) throw new Error("Ratelimited!")
            return await getWebsitesRecommendation({ content: input.content, headers: ctx.request.headers }) as { response: WebsiteType[], usage: AIUsageType }
        }
    }),
    fetchWebsiteComments: defineAction({
        input: z.object({
            url: z.string()
        }),
        handler: async (input, ctx) => {
            const limit = await validateLimit(ctx.clientAddress)
            if (!limit.success) throw new Error("Ratelimited!")
            return await fetchWebsiteComments({ url: input.url })
        }
    }),
    postWebsiteComment: defineAction({
        input: commentSchema,
        handler: async (input, ctx) => {
            const limit = await validateLimit(ctx.clientAddress)
            if (!limit.success) throw new Error("Ratelimited!")
            return await postWebsiteComment({ url: input.url, comment: input.content, headers: ctx.request.headers })
        }
    })
}