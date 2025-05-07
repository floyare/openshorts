import { PrismaClient } from "@prisma/client"
import { Redis } from "@upstash/redis";

let prismaInstance: PrismaClient;

export const getPrismaInstance = () => {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient({
            //log: ['query', 'info', 'warn', 'error']
        });
    }
    return prismaInstance;
};

export const redis = new Redis({
    url: import.meta.env.KV_REST_API_URL,
    token: import.meta.env.KV_REST_API_TOKEN,
})

export default getPrismaInstance