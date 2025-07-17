export const prerender = false
import type { APIRoute } from "astro";
import { prisma } from "../../lib/prisma"

export const GET: APIRoute = async (ctx) => {
    const key = ctx.request.headers.get("x-key")
    if (key !== import.meta.env.PROFILE_FETCH_KEY) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profiles = await prisma?.user.findMany({})

    return Response.json([
        (profiles ? profiles.map((profile) => {
            return `${import.meta.env.SITE}/profile/${profile.name}`;
        }) : [])
    ])
};