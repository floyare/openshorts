import { PrismaClient } from "@prisma/client/edge"
import { Redis } from "@upstash/redis";

let prismaInstance: any;

export const getPrismaInstance = () => {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient({
            //log: ['query', 'info', 'warn', 'error']
        })
    }
    return prismaInstance;
};

export const redis = new Redis({
    url: import.meta.env.KV_REST_API_URL,
    token: import.meta.env.KV_REST_API_TOKEN,
})

export default getPrismaInstance