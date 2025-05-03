export const prerender = false;

/* 
    This API endpoint will return an Website screenshot when adding website to the db and store it.
*/

import puppeteer, { Browser } from 'puppeteer-core';
import type { APIRoute } from 'astro';
import sharp from 'sharp';

export const GET: APIRoute = async ({ params, request }) => {
    const BROWSERLESS_API_KEY = import.meta.env.BROWSERLESS_API_KEY;
    if (!BROWSERLESS_API_KEY) {
        return new Response('Missing BROWSERLESS_API_KEY environment variable', { status: 500 });
    }

    let urlParam = new URL(request.url).searchParams.get('url')
    if (!urlParam) {
        return new Response('Missing url in request body', { status: 400 });
    }

    const browserWSEndpoint = `wss://production-sfo.browserless.io/chromium?token=${BROWSERLESS_API_KEY}`;
    let browser: Browser | null = null;

    try {
        browser = await puppeteer.connect({ browserWSEndpoint });
        const page = await browser.newPage();
        await page.goto(urlParam, { waitUntil: 'networkidle2' });
        await page.setViewport({ width: 475, height: 812, isMobile: true });
        const screenshot = await page.screenshot({ type: 'png' });
        await page.close();

        const buffer = await screenshot.buffer

        const optimizedBuffer = await sharp(Buffer.from(buffer))
            .webp({ quality: 30, effort: 6 })
            .resize({ width: 300, height: 350 })
            .toFormat("webp")
            .toBuffer();

        return new Response(optimizedBuffer, {
            headers: { 'Content-Type': 'image/webp' }
        });
    } catch (error) {
        return new Response('Error connecting or taking screenshot', { status: 500 });
    }
};
