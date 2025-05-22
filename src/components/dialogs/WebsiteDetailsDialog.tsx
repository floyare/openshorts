import type { WebsiteComment, WebsiteType } from "@/types/website"
import Container from "../container"
import { Dialog, DialogContent } from "../ui/dialog"
import WebsiteItem from "../websites/website-item"
import { Button } from "../ui/button"
import { LoaderCircle, MessageSquareText, X } from "lucide-react"
import { useState } from "react"
import type { User } from "@prisma/client"
import { Input } from "../ui/input"
import { formatDistanceToNow } from "date-fns"
import useSWR from "swr"
import { actions } from "astro:actions"
import { useAutoAnimate } from "@formkit/auto-animate/react"

type WebsiteDetailsDialogProps = {
    onClose: (val: boolean) => void
    additionalProps: {
        website: WebsiteType,
        currentUser?: User
    }
}

async function simulate() {
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });

    return [
        {
            id: "1",
            content: "Ullamco eiusmod incididunt mollit enim reprehenderit aute Lorem officia labore nostrud. Occaecat sit et voluptate ut tempor excepteur eiusmod eu laborum duis nulla qui. Culpa dolore qui quis laboris non occaecat. Id minim sint labore magna fugiat dolore ex laboris elit excepteur Lorem voluptate. Mollit minim Lorem pariatur adipisicing aliqua dolor ullamco commodo labore ut pariatur ut ea labore. Consectetur et sunt ea sit. Non anim sunt cupidatat aute ullamco sint Lorem deserunt.",
            created_by: "testuser",
            created_at: new Date(),
            website_url: "test.com",
        }, {
            id: "2",
            content: "fajna strona 123 Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.",
            created_by: "testuser123",
            created_at: new Date(),
            website_url: "test.com",
        }
    ]
}

export const WebsiteDetailsDialog = ({ onClose, additionalProps }: WebsiteDetailsDialogProps) => {
    const fetcher = (url: string) =>
        actions.fetchWebsiteComments({ url }).then(({ data, error }) => {
            if (error) throw error;
            return data;
        });

    const { data: comments, error, isLoading, mutate } = useSWR(`comments-fetch-"${additionalProps.website.id}"`, () => simulate()/*fetcher(additionalProps.website.url)*/, {
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        refreshWhenOffline: false,
        refreshWhenHidden: true,
        refreshInterval: 0
    });

    const [animationParent] = useAutoAnimate()

    if (error) {
        return (
            <p className="text-red-500 max-w-3xs break-words text-balance">
                Failed to obtain comments: {error.message}
            </p>
        );
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="flex flex-wrap items-start gap-2">
                {/* <div className="flex gap-2 items-center">
                    <Button variant={"ghost"} className="ml-auto" onClick={() => onClose(false)}><X /></Button>
                </div> */}
                <WebsiteItem website={additionalProps.website} className="w-fit" />
                <Container className="!bg-background-950 overflow-hidden px-6 relative space-y-4 grow h-full">
                    <p className="flex items-center gap-1"><MessageSquareText /> Comments ({comments?.length ?? 0})</p>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Input placeholder="Write a comment..." className="w-fit bg-white" />
                            <Button variant={"default"} className="w-fit">Comment</Button>
                        </div>
                        {isLoading ? (<div>
                            <LoaderCircle className="animate-spin" />
                        </div>) : (
                            error ? (<p className="text-red-500 max-w-3xs break-words text-balance">
                                Failed to obtain comments: {error.message}
                            </p>) : (
                                !comments ? <p className="text-text-500">No comments yet</p> : (
                                    <div className="space-y-2 max-h-52 overflow-y-auto" ref={animationParent}>
                                        {
                                            comments?.map((comment, index) => {
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
                                        }
                                    </div>
                                )
                            )
                        )}
                    </div>
                </Container>
            </DialogContent >
        </Dialog >
    )
}