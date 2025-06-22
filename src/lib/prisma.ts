import { PrismaClient } from "@prisma/client"
import { Redis } from "@upstash/redis";

declare global {
    var prisma: PrismaClient | undefined;
}

export const prisma =
    globalThis.prisma ??
    new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export const redis = new Redis({
    url: import.meta.env.KV_REST_API_URL,
    token: import.meta.env.KV_REST_API_TOKEN,
})