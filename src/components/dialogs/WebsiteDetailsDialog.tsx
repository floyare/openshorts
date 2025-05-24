import type { WebsiteComment, WebsiteType } from "@/types/website"
import Container from "../container"
import { Dialog, DialogContent } from "../ui/dialog"
import WebsiteItem from "../websites/website-item"
import { Button } from "../ui/button"
import { LoaderCircle, MessageSquareText, X } from "lucide-react"
import type { User } from "@prisma/client"
import { Input } from "../ui/input"
import { formatDistanceToNow } from "date-fns"
import useSWR from "swr"
import { actions } from "astro:actions"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { memo, useState, type FormEvent } from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "../ui/textarea"
import { commentSchema, MAX_COMMENT_LENGTH, MIN_COMMENT_LENGTH } from "@/helpers/websites.helper"
import Alert from "../ui/alert"
import { useFormState, useFormStatus } from "react-dom"
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination"

type WebsiteDetailsDialogProps = {
    onClose: (val: boolean) => void
    additionalProps: {
        website: WebsiteType,
        currentUser?: User
    }
}

type CommentFormInputs = {
    content: string,
    url: string
}

export const WebsiteDetailsDialog = ({ onClose, additionalProps, ...rest }: WebsiteDetailsDialogProps) => {
    const fetcher = (url: string) =>
        actions.fetchWebsiteComments({ url }).then(({ data, error }) => {
            if (error) throw error;
            return data;
        });

    const { data: comments, error, isLoading, mutate } = useSWR(`comments-fetch-"${additionalProps.website.id}"`, () => fetcher(additionalProps.website.url), {
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        refreshWhenOffline: false,
        refreshWhenHidden: true,
        refreshInterval: 0
    });

    const [animationParent] = useAutoAnimate()
    const [postResult, postResultSet] = useState<{ type: "success" | "error", content: string } | null>(null)
    const methods = useForm<CommentFormInputs>({
        defaultValues: {
            content: "",
            url: additionalProps.website.url
        },
        resolver: zodResolver(commentSchema),
        mode: "onBlur"
    })

    const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful }, setError, reset } = methods

    const onSubmit: SubmitHandler<CommentFormInputs> = async (data) => {
        const { url, content } = data;

        if (!content) return

        const result = await actions.postWebsiteComment({
            url: additionalProps.website.url,
            content: content
        })

        if (result.error) {
            postResultSet({ type: "error", content: result.error.message })
            return
        }

        postResultSet({ type: "success", content: "Comment posted!" })

        mutate((com) => [...(com ?? []), {
            id: result.data.id,
            content: content,
            created_by: additionalProps.currentUser?.name ?? "Unknown",
            created_at: new Date(),
            website_url: additionalProps.website.url,
            user: {
                id: additionalProps.currentUser?.id ?? "",
                image: additionalProps.currentUser?.image ?? "/favicon.png",
                name: additionalProps.currentUser?.name ?? "Unknown"
            }
        }])

        reset()
    }

    if (error) {
        return (
            <Alert variant="error" className="max-w-3xs">
                <p className="break-words text-balance">
                    Failed to obtain comments: {error.message}
                </p>
            </Alert>
        );
    }

    const [page, setPage] = useState(1)
    const MAX_COMMENTS_VIEW = 6
    const totalComments = comments?.length ? Math.ceil(comments?.length / MAX_COMMENTS_VIEW) : 0
    const slicedComments = comments?.slice((page * MAX_COMMENTS_VIEW) - MAX_COMMENTS_VIEW, page * MAX_COMMENTS_VIEW)

    const PaginationControls = memo(() => {
        if (totalComments <= MAX_COMMENTS_VIEW) return null
        return (
            <Pagination className={cn("transition-all bg-white text-text-50 px-4 py-1 sm:w-fit w-full rounded-md")}>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            isDisabled={page <= 1}
                            aria-label="Previous page"
                            title="Previous page"
                        />
                    </PaginationItem>
                    {Array.from({ length: totalComments }, (_, i) => (
                        <PaginationItem key={i + 1}>
                            <PaginationLink
                                isActive={page === i + 1}
                                onClick={() => setPage(i + 1)}
                                isDisabled={false}
                                className="!text-xl"
                            >
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setPage((p) => Math.min(totalComments, p + 1))}
                            isDisabled={page >= totalComments}
                            aria-label="Next page"
                            title="Next page"
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )
    })
    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="flex flex-col gap-2 overflow-y-auto !max-h-full py-6 !z-[1001] data-[state=closed]:!animate-fadeout animate-fadein" {...rest}>
                <div className="flex gap-2 items-center">
                    <Button variant={"outline"} className="ml-auto" onClick={() => onClose(false)}><X /></Button>
                </div>
                <div className="flex flex-wrap gap-2 items-start justify-center">
                    <WebsiteItem website={additionalProps.website} className="w-fit" />
                    <Container className="!bg-background-950 overflow-hidden px-6 relative space-y-4 grow h-full max-w-md">
                        <p className="flex items-center gap-1"><MessageSquareText /> Comments ({comments?.length ?? 0})</p>
                        <div className="flex flex-col gap-4">
                            <FormProvider {...methods}>
                                <form onSubmit={handleSubmit(onSubmit)} className={cn(
                                    "flex flex-col items-center gap-2 relative min-w-3xs max-w-2xs",
                                )}>
                                    <Textarea placeholder="Write a comment..." className="w-full max-h-38 max-w-2xs bg-white" maxLength={MAX_COMMENT_LENGTH} minLength={MIN_COMMENT_LENGTH} {...register("content", { required: true })} />
                                    {errors.content && <span className="text-red-500">{errors.content.message}</span>}
                                    <Button variant={"default"} disabled={isSubmitting} type="submit" className="w-full">{
                                        isSubmitting ? <><LoaderCircle className="animate-spin" /> Posting...</> : <><MessageSquareText /> Post comment</>
                                    }</Button>
                                </form>
                            </FormProvider>

                            {postResult && <Alert className="!max-w-2xs" variant={postResult.type === "success" ? "success" : "error"}>{postResult.content}</Alert>}
                            <div className="w-full h-[1px] bg-neutral-600" />
                            {isLoading ? (<div className="space-y-2 max-h-84 overflow-y-auto">
                                <div className="w-full h-18 bg-background-800 animate-pulse rounded-md" />
                                <div className="w-full h-18 bg-background-800 animate-pulse rounded-md" />
                                <div className="w-full h-18 bg-background-800 animate-pulse rounded-md" />
                                <div className="w-full h-18 bg-background-800 animate-pulse rounded-md" />
                            </div>) : (
                                error ? (<p className="text-red-500 max-w-3xs break-words text-balance">
                                    Failed to obtain comments: {error.message}
                                </p>) : (
                                    !comments || comments?.length <= 0 ? <p className="text-text-500">No comments yet</p> : (
                                        <>
                                            <div className="space-y-2 max-h-84 overflow-y-auto px-2" ref={animationParent}>
                                                {
                                                    slicedComments?.map((comment, index) => {
                                                        return (
                                                            <div key={index} className="flex items-start gap-2 bg-white py-3 px-4 rounded-md">
                                                                <img src={comment.user.image ?? "/favicon.png"} alt={comment.created_by + "'s avatar"} className="w-12 h-12 rounded-full border-[2px] border-primary-400" />
                                                                <div>
                                                                    <p className="text-black max-w-[12rem] overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:6] [-webkit-box-orient:vertical] break-words text-balance">{comment.content}</p>
                                                                    <p className="text-text-400 text-sm"><a href={"/profile/" + comment.created_by}>{comment.created_by}</a> <span className="text-neutral-600 text-xs" title={comment.created_at.toString()}>• {formatDistanceToNow(comment.created_at, { includeSeconds: true, addSuffix: true })}</span></p>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                            <PaginationControls />
                                        </>
                                    )
                                )
                            )}
                        </div>
                    </Container>
                </div>
            </DialogContent >
        </Dialog >
    )
}