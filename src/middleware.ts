import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";
import { debugLog } from "./lib/log";

export const config = { runtime: 'nodejs' };

// TODO: zmienic to zeby nie brac autha z middleware tylko tam gdzie potrzebne i to async
export const onRequest = defineMiddleware(async (context, next) => {
    const authPaths = ['/', '/profile', '/website'];
    if (!authPaths.some(p => new URL(context.request.url).pathname.startsWith(p))) {
        return next();
    }

    const isAuthed = await auth.api
        .getSession({
            headers: context.request.headers,
        })

    debugLog("SUCCESS", "Requested session", !!isAuthed?.user)

    if (isAuthed) {
        context.locals.user = isAuthed.user;
        context.locals.session = isAuthed.session;
    } else {
        context.locals.user = null;
        context.locals.session = null;
    }

    return next();
});