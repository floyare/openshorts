import { PrismaClient } from "@prisma/client"
import { Redis } from "@upstash/redis";

export let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient };
    const globalWithPrisma = globalThis as GlobalWithPrisma;
    if (!globalWithPrisma.prisma) {
        globalWithPrisma.prisma = new PrismaClient();
    }
    prisma = globalWithPrisma.prisma;
}


export const redis = new Redis({
    url: import.meta.env.KV_REST_API_URL,
    token: import.meta.env.KV_REST_API_TOKEN,
})