import type { WebsiteComment, WebsiteType } from "@/types/website"
import Container from "../container"
import { Dialog, DialogContent } from "../ui/dialog"
import WebsiteItem from "../websites/website-item"
import { Button } from "../ui/button"
import { MessageSquareText, X } from "lucide-react"
import { useState } from "react"
import type { User } from "@prisma/client"
import { Input } from "../ui/input"
import { formatDistance, formatDistanceToNow } from "date-fns"

type WebsiteDetailsDialogProps = {
    onClose: (val: boolean) => void
    additionalProps: {
        website: WebsiteType,
        currentUser?: User
    }
}

export const WebsiteDetailsDialog = ({ onClose, additionalProps }: WebsiteDetailsDialogProps) => {
    const [websiteComments, websiteCommentsSet] = useState<WebsiteComment[]>([{
        id: "1",
        content: "Ullamco eiusmod incididunt mollit enim reprehenderit aute Lorem officia labore nostrud. Occaecat sit et voluptate ut tempor excepteur eiusmod eu laborum duis nulla qui. Culpa dolore qui quis laboris non occaecat. Id minim sint labore magna fugiat dolore ex laboris elit excepteur Lorem voluptate. Mollit minim Lorem pariatur adipisicing aliqua dolor ullamco commodo labore ut pariatur ut ea labore. Consectetur et sunt ea sit. Non anim sunt cupidatat aute ullamco sint Lorem deserunt.",
        created_by: "testuser",
        created_at: new Date(),
        website_url: "test.com",
    }])

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="flex flex-wrap items-start gap-2">
                {/* <div className="flex gap-2 items-center">
                    <Button variant={"ghost"} className="ml-auto" onClick={() => onClose(false)}><X /></Button>
                </div> */}
                <WebsiteItem website={additionalProps.website} className="w-fit" />
                <Container className="!bg-background-950 overflow-hidden px-6 relative space-y-4 grow h-full">
                    <p className="flex items-center gap-1"><MessageSquareText /> Comments (0)</p>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Input placeholder="Write a comment..." className="w-fit bg-white" />
                            <Button variant={"default"} className="w-fit">Comment</Button>
                        </div>
                        {websiteComments.length <= 0 ? <p className="text-text-500">No comments yet</p> : (
                            websiteComments.map((comment, index) => {
                                return (
                                    <div key={index} className="flex items-center gap-2 bg-white py-3 px-4 rounded-md">
                                        <img src="https://placehold.co/64" alt={comment.created_by + "'s avatar"} className="w-12 h-12 rounded-full border-[2px] border-primary-400" />
                                        <div>
                                            <p className="text-black max-w-2xs overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical] break-words text-balance" title={formatDistanceToNow(comment.created_at, { includeSeconds: true, addSuffix: true })}>{comment.content}</p>
                                            <p className="text-text-400 text-sm">{comment.created_by}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </Container>
            </DialogContent >
        </Dialog >
    )
}