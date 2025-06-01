// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
//import node from '@astrojs/node';

import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';
//import getPrismaInstance from '@/lib/prisma';

//const customPages = await fetch("https://example.com").then(users => { return ["https://openshorts.dev/XD"] });

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  site: "https://openshorts.dev",
  integrations: [react(), sitemap({
    filter: (page) => !page.includes('/admin') && !page.includes('/layout') && !page.includes('/signout') && !page.endsWith("/profile/"),
    //customPages: customPages
  })],

  adapter: vercel(),//node({mode: "standalone"}),
  experimental: {
    fonts: [{
        provider: fontProviders.google(),
        name: "Lexend",
        cssVariable: "--font"
    }]
  }
});