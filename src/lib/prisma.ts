import { PrismaClient } from "@prisma/client"

let prismaInstance: PrismaClient;

export const getPrismaInstance = () => {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient({
            //log: ['query', 'info', 'warn', 'error']
        });
    }
    return prismaInstance;
};

export default getPrismaInstance