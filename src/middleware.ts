import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";
import { debugLog } from "./lib/log";

export const onRequest = defineMiddleware(async (context, next) => {
    const isAuthed = await auth.api
        .getSession({
            headers: context.request.headers,
        })

    //debugLog("DEBUG", "isAuthed", isAuthed);

    if (isAuthed) {
        context.locals.user = isAuthed.user;
        context.locals.session = isAuthed.session;
    } else {
        context.locals.user = null;
        context.locals.session = null;
    }

    return next();
});