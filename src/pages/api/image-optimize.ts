
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { default: sharp } = await import('sharp');

        const buffer = Buffer.from(await request.arrayBuffer());

        if (!buffer || buffer.length === 0) {
            return new Response(JSON.stringify({ error: 'No image buffer provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const optimizedBuffer = await sharp(buffer)
            .webp({ quality: 30 })
            .resize({ width: 300, height: 500 })
            .toBuffer();

        return new Response(optimizedBuffer, {
            status: 200,
            headers: { 'Content-Type': 'image/webp' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Image processing failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};