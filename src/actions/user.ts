import { MAX_PROFILE_NAME_LENGTH, MIN_PROFILE_NAME_LENGTH } from "@/helpers/user.helper";
import { auth } from "@/lib/auth";
import getPrismaInstance from "@/lib/prisma";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

export const user = {
    updateUsername: defineAction({
        input: z.object({
            username: z.string().min(MIN_PROFILE_NAME_LENGTH).max(MAX_PROFILE_NAME_LENGTH).optional(),
        }),
        handler: async (input, ctx) => {
            const currentUser = await auth.api.getSession({
                headers: ctx.request.headers,
            });

            if (!currentUser?.user) throw new Error("User not logged in");

            if (!currentUser.user.name_change_available) {
                throw new Error("You can't change your username");
            }

            const isTaken = input.username ? await getPrismaInstance().user.findUnique({
                where: {
                    name: input.username,
                },
            }) : false;

            if (isTaken) {
                throw new Error("Username is already taken");
            }

            return await getPrismaInstance().user.update({
                where: {
                    id: currentUser.user.id,
                },
                data: {
                    name: input.username ?? currentUser.user.name,
                    name_change_available: false,
                },
            });
        },
    })
}