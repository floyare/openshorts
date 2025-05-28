export const prerender = false;
import { type APIContext } from 'astro';
import { createAstroForwarder } from "shibuitracker-client/server";

export const POST = (context: APIContext) => createAstroForwarder({ url: import.meta.env.SHIBUITRACKER_URL, ip: context.clientAddress })(context);