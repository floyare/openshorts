import { auth } from "@/lib/auth";
import getPrismaInstance from "@/lib/prisma";
import type { BannedDetailsType } from "@/types/user";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

export const admin = {
    websiteVisibleToggle: defineAction({
        input: z.object({
            url: z.string().url(),
            hidden: z.boolean(),
        }),
        handler: async (input, ctx) => {
            const currentUser = await auth.api.getSession({
                headers: ctx.request.headers,
            });

            if (currentUser?.user.role !== "OWNER") throw new Error("You are not allowed to perform this action");

            return await getPrismaInstance().websites.update({
                where: {
                    url: input.url,
                },
                data: {
                    hidden: input.hidden
                }
            })
        }
    }),
    banUser: defineAction({
        input: z.object({
            id: z.string(),
            description: z.string().optional(),
            unban_date: z.string()
        }),
        handler: async (input, ctx) => {
            const currentUser = await auth.api.getSession({
                headers: ctx.request.headers,
            });

            if (currentUser?.user.role !== "OWNER") throw new Error("You are not allowed to perform this action");

            const user = await getPrismaInstance().user.findUnique({
                where: {
                    id: input.id,
                },
            })

            if (!user) throw new Error("User does not exists")

            return await getPrismaInstance().user.update({
                where: {
                    id: input.id,
                },
                data: {
                    banned_details: [
                        ...(user.banned_details as unknown as BannedDetailsType[] || []),
                        {
                            banned_at: new Date(),
                            banned_by: currentUser.user.name,
                            reason: input.description || "No reason provided",
                            unban_date: input.unban_date
                        }
                    ]
                }
            })
        }
    })
}