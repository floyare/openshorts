import type { BannedDetailsType } from "@/types/user"
import { prisma } from "./prisma"
import { isBefore } from "date-fns"
import type { User } from "better-auth"

export const isUserBanned = async ({ currentUser }: { currentUser: User }) => {
    if (!currentUser) throw new Error("User not logged in")

    const result = await prisma.user.findFirst({
        where: {
            id: currentUser.id
        }
    })

    if (!result) throw new Error("User not found")

    const bannedDetails = (typeof result.banned_details === "string" ? JSON.parse(result.banned_details) : result.banned_details) as unknown as BannedDetailsType[]
    const isBanActive = bannedDetails.find((ban) => isBefore(new Date(), ban.unban_date))

    return isBanActive ?? null
}