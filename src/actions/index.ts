import { uploadSchema } from '@/helpers/upload.helper';
import { uploadWebsite } from '@/lib/upload.core';
import { doesWebsiteExists, searchWebsites } from '@/lib/websites.core';
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
            sorting: z.enum(["new", "old", "alphabet", "likes"]).optional()
        }) as z.ZodType<SearchWebsitesProps>,
        handler: async (input) => {
            return await searchWebsites(input);
        }
    }),
    uploadWebsite: defineAction({
        input: uploadSchema,
        handler: async (input) => {
            return await uploadWebsite({
                url: input.url,
                description: input.description,
                tags: input.tags
            })
        }
    }),
    doesWebsiteExists: defineAction({
        input: z.object({
            url: z.string().nonempty()
        }),
        handler: async (input) => await doesWebsiteExists(input.url)
    })
}