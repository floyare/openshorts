export const prerender = false;

/* 
    This API endpoint will return an Website screenshot when adding website to the db and store it.
*/

import puppeteer, { Browser } from 'puppeteer-core';
import type { APIRoute } from 'astro';

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
        await page.setViewport({ width: 1280, height: 720 });
        const screenshot = await page.screenshot({ type: 'png' });
        await page.close();
        return new Response(screenshot, {
            headers: { 'Content-Type': 'image/png' }
        });
    } catch (error) {
        return new Response('Error connecting or taking screenshot', { status: 500 });
    }
};
