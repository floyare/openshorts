import { uploadSchema } from '@/helpers/upload.helper';
import { getBestUploads, getProfileStats } from '@/lib/profile.core';
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
            return await searchWebsites({ ...input, context: context });
        }
    }),
    uploadWebsite: defineAction({
        input: uploadSchema,
        handler: async (input, context) => {
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
        handler: async (input) => await doesWebsiteExists(input.url)
    }),
    getProfileStats: defineAction({
        input: z.object({
            name: z.string()
        }),
        handler: async (input) => {
            return await getProfileStats(input.name)
        }
    }),
    getBestUploads: defineAction({
        input: z.object({
            name: z.string()
        }),
        handler: async (input, ctx) => {
            return await getBestUploads(input.name, ctx)
        }
    })
}