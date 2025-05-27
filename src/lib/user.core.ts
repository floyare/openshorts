import type { BannedDetailsType } from "@/types/user"
import getPrismaInstance from "./prisma"
import { isBefore } from "date-fns"
import type { User } from "better-auth"

export const isUserBanned = async ({ currentUser }: { currentUser: User }) => {
    if (!currentUser) throw new Error("User not logged in")

    const result = await getPrismaInstance().user.findFirst({
        where: {
            id: currentUser.id
        }
    })

    if (!result) throw new Error("User not found")

    const bannedDetails = result.banned_details as unknown as BannedDetailsType[]
    const isBanActive = bannedDetails.find((ban) => isBefore(new Date(), ban.unban_date))

    return isBanActive ?? null
}