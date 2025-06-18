
import { defineCollection, reference, z } from 'astro:content';

const blog = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        pubDate: z.coerce.date(),
        description: z.string(),
        tags: z.array(z.string()).optional(),
        relatedPosts: z.array(reference('blog')).optional(),
        author: z.string(),
        image: z.string().url()
    }),
});

export const collections = { blog };