// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import lottie from "astro-integration-lottie";
//import node from '@astrojs/node';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';
//import partytown from '@astrojs/partytown';
import mdx from '@astrojs/mdx';
//import getPrismaInstance from '@/lib/prisma';

//const customPages = await fetch("https://example.com").then(users => { return ["https://openshorts.dev/XD"] });
import { loadEnv } from "vite";

//@ts-ignore
const { PROFILE_FETCH_KEY } = loadEnv(process.env.NODE_ENV, process.cwd(), "");

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
            customPages: await fetch("https://www.openshorts.dev/api/get-profiles", {headers: {
                'x-key': PROFILE_FETCH_KEY
            }}).then(async(users) => { 
                const j = await users.json(); 
                console.log("Custom pages fetched:", j[0], [...(j[0])] );
                return [...(j[0])] 
            }).catch((err) => {
                console.error("Error fetching custom pages:", err);
                return [];
            }),
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
                } else if (item.url.startsWith("https://www.openshorts.dev/profile/")) {
                    priority = 0.6;
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
        mdx(),
        lottie()
    ],
    trailingSlash: 'never',
    output: 'static',
    adapter: vercel(),//node({mode: "standalone"}),
    experimental: {
        fonts: [{
            provider: fontProviders.google(),
            name: "Poppins",
            cssVariable: "--font",
            weights: [200, 400, 500, 700],
        }]
    }
});