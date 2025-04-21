export const prerender = false;
import puppeteer from 'puppeteer';
const isValidUrl = (urlString: string) => {
    try {
        const url = new URL(urlString);
        return ['http:', 'https:'].includes(url.protocol);
    } catch (e) {
        return false;
    }
};

export async function POST({ request }: { request: Request }) {
    let urlParam: string | null = null;

    try {
        const body = await request.json();
        urlParam = body.body;
        console.log(body)
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (!urlParam) {
        return new Response(JSON.stringify({ error: 'URL field is required in JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (typeof urlParam !== 'string' || !isValidUrl(urlParam)) {
        return new Response(JSON.stringify({ error: 'Invalid URL provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const parsedUrl = new URL(urlParam);
        if (['localhost', '127.0.0.1'].includes(parsedUrl.hostname) || parsedUrl.protocol === 'file:') {
            return new Response(JSON.stringify({ error: 'Accessing local or file resources is forbidden' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid URL structure' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
            ],
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        await page.goto(urlParam, {
            waitUntil: 'networkidle0',
            timeout: 30000,
        });

        const screenshotBuffer = await page.screenshot({
            type: 'png',
        });

        return new Response(screenshotBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
            },
        });

    } catch (error) {
        let errorMessage = 'Failed to generate screenshot.';
        let errorDetails = '';
        if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
            errorDetails = (error as any).message;
            if (errorDetails.includes('net::ERR_NAME_NOT_RESOLVED')) {
                errorMessage = 'Could not resolve the hostname provided in the URL.';
            } else if (errorDetails.includes('Timeout')) {
                errorMessage = 'The page took too long to load or render.';
            } else if (errorDetails.includes('Target closed') || errorDetails.includes('Protocol error')) {
                errorMessage = 'The browser page crashed or closed unexpectedly.';
            }
        }

        return new Response(JSON.stringify({ error: errorMessage, details: errorDetails }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });

    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
