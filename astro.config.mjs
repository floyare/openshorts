// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import node from '@astrojs/node';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()],

  adapter: node({mode: "standalone"}),
  experimental: {
    fonts: [{
        provider: fontProviders.google(),
        name: "Lexend",
        cssVariable: "--font"
    }]
  }
});