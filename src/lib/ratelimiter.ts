import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./prisma";

// TODO: w razie problemu zamienić ratelimit na arcjet
// https://github.com/arcjet/arcjet-js/blob/main/examples/astro-integration/src/actions/index.ts

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.fixedWindow(5, "5s"),//Ratelimit.tokenBucket(1, "3s", 5),
    prefix: "ops-ratelimit",
});

export const validateLimit = async (address: string, rate: number = 1) => await ratelimit.limit(address, { rate: rate })