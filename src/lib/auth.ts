import { betterAuth, type User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    trustedOrigins: ["http://192.168.0.107:4321"],
    databaseHooks: {
        user: {
            create: {
                before: async (user: User) => {
                    let baseNickname = user.name;
                    let uniqueNickname = baseNickname;
                    let nameChange = false
                    while (await prisma.user.findUnique({ where: { name: uniqueNickname } })) {
                        const randomSuffix = (Math.random() + 1).toString(36).substring(7)
                        uniqueNickname = `${baseNickname}-${randomSuffix}`;
                        nameChange = true
                    }

                    return {
                        data: {
                            ...user,
                            name: uniqueNickname,
                            name_change_available: nameChange
                        },
                    };
                }
            }
        }
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "USER",
                input: false,
            },
            banned_details: {
                type: "string",
                required: false,
                defaultValue: "[]",
                input: false,
            },
            ai_usage: {
                type: "string",
                required: false,
                input: false,
            },
            name_change_available: {
                type: "boolean",
                required: false,
                input: false,
            }
        }
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    socialProviders: {
        github: {
            clientId: import.meta.env.GITHUB_CLIENT_ID as string,
            clientSecret: import.meta.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: import.meta.env.GOOGLE_CLIENT_ID as string,
            clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET as string,
        }
    },
})