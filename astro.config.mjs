// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
//import node from '@astrojs/node';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';
//import partytown from '@astrojs/partytown';
import mdx from '@astrojs/mdx';
//import getPrismaInstance from '@/lib/prisma';

//const customPages = await fetch("https://example.com").then(users => { return ["https://openshorts.dev/XD"] });

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
        build: {
            rollupOptions: {
                treeshake: 'smallest',
            },
        },
    },
    site: "https://www.openshorts.dev",
    integrations: [
        react(),
        sitemap({
            filter: (page) =>
                !page.includes('/admin') &&
                !page.includes('/layout') &&
                !page.includes('/signout') &&
                !page.endsWith("/profile/"),
            serialize(item) {
                if (!item.url) return item;
                let priority = 0.5;
                if (item.url === "https://www.openshorts.dev/") {
                    priority = 1.0;
                } else if (item.url.startsWith("https://www.openshorts.dev/website/")) {
                    priority = 0.7;
                } else if (item.url.startsWith("https://www.openshorts.dev/blog/")) {
                    priority = 0.8;
                } else if (item.url === "https://www.openshorts.dev/blog") {
                    priority = 0.9;
                }
                return { ...item, priority };
            }
        }),
        // partytown({
        //     config: {
        //             forward: ['dataLayer.push'],
        //     }
        // }),
        mdx()
    ],
    trailingSlash: 'never',
    adapter: vercel(),//node({mode: "standalone"}),
    experimental: {
        fonts: [{
            provider: fontProviders.google(),
            name: "Lexend",
            cssVariable: "--font"
        }]
    }
});