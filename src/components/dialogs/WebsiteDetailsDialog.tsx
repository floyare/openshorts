import type { WebsiteType } from "@/types/website"
import { Dialog, DialogContent } from "../ui/dialog"
import WebsiteItem from "../websites/website-item"
import { Button } from "../ui/button"
import { X } from "lucide-react"
import type { User } from "@prisma/client"
import WebsiteComments from "../websites/website-comments"

type WebsiteDetailsDialogProps = {
    onClose: (val: boolean) => void
    additionalProps: {
        website: WebsiteType,
        currentUser?: User
    }
}

export const WebsiteDetailsDialog = ({ onClose, additionalProps, ...rest }: WebsiteDetailsDialogProps) => {
    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="flex flex-col gap-2 overflow-y-auto !max-h-full py-6 !z-[1001] data-[state=closed]:!animate-fadeout animate-fadein" {...rest}>
                <div className="flex gap-2 items-center">
                    <Button variant={"outline"} className="ml-auto" onClick={() => onClose(false)}><X /></Button>
                </div>
                <div className="flex flex-wrap gap-2 items-start justify-center">
                    <WebsiteItem website={additionalProps.website} className="w-fit" />
                    <WebsiteComments website={additionalProps.website} currentUser={additionalProps.currentUser as User} />
                </div>
            </DialogContent >
        </Dialog >
    )
}