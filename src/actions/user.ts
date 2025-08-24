import { MAX_PROFILE_NAME_LENGTH, MIN_PROFILE_NAME_LENGTH } from "@/helpers/user.helper";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUserBanned } from "@/lib/user.core";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";
import type { User } from "better-auth";

export const user = {
    getProfile: defineAction({
        input: z.object({
            profile: z.string(),
            isOwnProfile: z.boolean().optional(),
        }),
        handler: async (input) => {
            const { profile, isOwnProfile = false } = input;
            const profileData = await prisma.user.findFirst({
                where: {
                    name: profile,
                },
                select: {
                    image: true,
                    name: true,
                    role: true,
                    id: true,
                    banned_details: isOwnProfile,
                    name_change_available: isOwnProfile,
                },
            });
            return profileData;
        },
    }),
    isUserBanned: defineAction({
        input: z.object({
            currentUser: z.custom<User>((val) => true)
        }),
        handler: async (input, ctx) => {
            return await isUserBanned({ currentUser: input.currentUser });
        }
    }),
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

            const isTaken = input.username ? await prisma.user.findUnique({
                where: {
                    name: input.username,
                },
            }) : false;

            if (isTaken) {
                throw new Error("Username is already taken");
            }

            return await prisma.user.update({
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