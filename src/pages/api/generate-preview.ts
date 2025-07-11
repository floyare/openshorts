import { debugLog } from "@/lib/log";
import type { APIRoute } from "astro";
import type { Browser } from "puppeteer-core";

export const GET: APIRoute = async ({ url }) => {
    const urlToCapture = url.searchParams.get('url') ? decodeURIComponent(url.searchParams.get('url')!) : null;
    debugLog("WARN", "Using url", urlToCapture)
    if (!urlToCapture) {
        return new Response('Brakuje parametru "url"', { status: 400 });
    }

    const BROWSERLESS_API_KEY = import.meta.env.BROWSERLESS_API_KEY;
    if (!BROWSERLESS_API_KEY) {
        throw new Error("No browserless api key");
    }

    debugLog("DEBUG", "(getWebsiteScreen) Fetching - ", url)

    const browserWSEndpoint = `wss://production-sfo.browserless.io/chromium?token=${BROWSERLESS_API_KEY}`;
    let browser: Browser | null = null;
    try {
        debugLog("DEBUG", "(getWebsiteScreen) Connecting")
        const chromium = (await import('@sparticuz/chromium-min')).default;
        const puppeteer = (await import('puppeteer-core')).default;
        if (import.meta.env.PROD) {
            const executablePath = await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar")
            browser = await puppeteer.launch({
                executablePath,
                args: chromium.args,
                headless: chromium.headless,
                defaultViewport: chromium.defaultViewport
            })
        } else {
            browser = await puppeteer.connect({ browserWSEndpoint });
        }

        //await puppeteer.connect({ browserWSEndpoint });
        const page = await browser.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) " +
            "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
        );

        await page.setExtraHTTPHeaders({
            "Accept-Language": "en-US,en;q=0.9",
            "Upgrade-Insecure-Requests": "1",
        });

        await page.setJavaScriptEnabled(true)

        await page.setViewport({ width: 475, height: 812, isMobile: true });

        debugLog("DEBUG", "(getWebsiteScreen) Navigating into url...")

        await page.goto(urlToCapture, { waitUntil: 'domcontentloaded' });

        const delay = 1000 + Math.floor(Math.random() * 1000)
        debugLog("DEBUG", "(getWebsiteScreen) Waiting for " + delay + "ms")
        await new Promise(resolve => setTimeout(resolve, delay));

        debugLog("DEBUG", "(getWebsiteScreen) Screenshoting...")
        const screenshot = await page.screenshot({ type: 'webp', encoding: 'binary' });
        await page.close();

        const file = new File(
            [screenshot as unknown as Buffer],
            `${new URL(url).hostname}.webp`,
            { type: 'image/webp' }
        );

        return new Response(file, {
            status: 200,
            headers: { 'Content-Type': 'image/webp' },
        });
    } catch (error) {
        debugLog("ERROR", "(getWebsiteScreen) failed due to: ", error)
        return new Response('Wystąpił błąd serwera', { status: 500 });
    }
};