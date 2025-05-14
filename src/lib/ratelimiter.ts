import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./prisma";

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.tokenBucket(1, "3s", 5),
    prefix: "ops-ratelimit",
});

export const validateLimit = async (address: string) => await ratelimit.limit(address)