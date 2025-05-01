import type { Browser } from "puppeteer-core";
import puppeteer from "puppeteer-core";

export const getWebsiteScreen = async (url: string) => {
    const BROWSERLESS_API_KEY = import.meta.env.BROWSERLESS_API_KEY;
    if (!BROWSERLESS_API_KEY) {
        throw new Error("No browserless api key")
    }

    const browserWSEndpoint = `wss://production-sfo.browserless.io/chromium?token=${BROWSERLESS_API_KEY}`;
    let browser: Browser | null = null;
    try {
        browser = await puppeteer.connect({ browserWSEndpoint });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.setViewport({ width: 475, height: 812, isMobile: true });
        const screenshot = await page.screenshot({ type: 'webp', encoding: 'binary' });
        await page.close();

        const file = new File(
            [screenshot as Buffer],
            `${new URL(url).hostname}.webp`,
            { type: 'image/webp' }
        );
        return file;
    } catch (error) {
        return null;
    }
}