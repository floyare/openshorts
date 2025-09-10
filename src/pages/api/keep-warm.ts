export const prerender = false
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
    return Response.json({}, { status: 200 })
};