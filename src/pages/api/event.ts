export const prerender = false;
import { createAstroForwarder } from "shibuitracker-client/server";

export const POST = createAstroForwarder({ url: import.meta.env.SHIBUITRACKER_URL });