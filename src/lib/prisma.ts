import { PrismaClient } from "@prisma/client"

let prismaInstance: PrismaClient;

export const getPrismaInstance = () => {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient();
    }
    return prismaInstance;
};

export default getPrismaInstance