// src/pages/sitemap.xml.ts
import { prisma } from '@/lib/prisma';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
    const websites = await prisma.websites.findMany({
        select: { name: true, created_at: true },
    });

    const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://www.openshorts.dev/browse/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      
        ${websites.map((site) => `
        <url>
          <loc>https://www.openshorts.dev/browse/${site.name.toLowerCase()}</loc>
          <lastmod>${site.created_at.toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
        </url>
      `).join('')}
    </urlset>
  `.trim();

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
};