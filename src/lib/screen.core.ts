import type { Browser } from "puppeteer-core";
import puppeteer from "puppeteer-core";
import { debugLog } from "./log";

export const getWebsiteScreen = async (url: string) => {
    const BROWSERLESS_API_KEY = import.meta.env.BROWSERLESS_API_KEY;
    if (!BROWSERLESS_API_KEY) {
        throw new Error("No browserless api key");
    }

    debugLog("DEBUG", "(getWebsiteScreen) Fetching - ", url)

    const browserWSEndpoint = `wss://production-sfo.browserless.io/chromium?token=${BROWSERLESS_API_KEY}`;
    let browser: Browser | null = null;
    try {
        debugLog("DEBUG", "(getWebsiteScreen) Connecting")
        browser = await puppeteer.connect({ browserWSEndpoint });
        const page = await browser.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) " +
            "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
        );

        await page.setExtraHTTPHeaders({
            "Accept-Language": "en-US,en;q=0.9",
            "Upgrade-Insecure-Requests": "1",
        });

        await page.setViewport({ width: 475, height: 812, isMobile: true });

        debugLog("DEBUG", "(getWebsiteScreen) Navigating into url...")

        await page.goto(url, { waitUntil: 'networkidle2' });

        const delay = 1000 + Math.floor(Math.random() * 1000)
        debugLog("DEBUG", "(getWebsiteScreen) Waiting for " + delay + "ms")
        await new Promise(resolve => setTimeout(resolve, delay));

        debugLog("DEBUG", "(getWebsiteScreen) Screenshoting...")
        const screenshot = await page.screenshot({ type: 'webp', encoding: 'binary' });
        await page.close();

        const file = new File(
            [screenshot as Buffer],
            `${new URL(url).hostname}.webp`,
            { type: 'image/webp' }
        );
        return file;
    } catch (error) {
        debugLog("ERROR", "(getWebsiteScreen) failed due to: ", error)
        return null;
    }
};