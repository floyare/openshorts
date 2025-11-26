//import { PrismaClient } from "@prisma/client"
import { Redis } from "@upstash/redis";

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "@/generated/client";
export let prisma: PrismaClient;

const adapter = new PrismaPg({
    connectionString: import.meta.env.DATABASE_URL
});

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({ adapter });
} else {
    type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient };
    const globalWithPrisma = globalThis as GlobalWithPrisma;
    if (!globalWithPrisma.prisma) {
        globalWithPrisma.prisma = new PrismaClient({ adapter });
    }
    prisma = globalWithPrisma.prisma;
}


export const redis = new Redis({
    url: import.meta.env.KV_REST_API_URL,
    token: import.meta.env.KV_REST_API_TOKEN,
})