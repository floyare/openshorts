import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import getPrismaInstance from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(getPrismaInstance(), {
        provider: "postgresql"
    }),
    socialProviders: {
        github: {
            clientId: import.meta.env.GITHUB_CLIENT_ID as string,
            clientSecret: import.meta.env.GITHUB_CLIENT_SECRET as string,
        },
    },
})