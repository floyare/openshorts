import { lazy, memo, useMemo, useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { cn } from "@/lib/utils";
import Alert from "../ui/alert";
import { actions } from "astro:actions";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, MAX_COMMENT_LENGTH, MIN_COMMENT_LENGTH } from "@/helpers/websites.helper";
import useSWR from "swr";
import type { websites } from "@prisma/client";
import Container from "../container";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import { LoaderCircle, Lock, MessageSquareText } from "lucide-react";
import type { User } from "better-auth/types";
import { authClient } from "@/lib/auth-client";

const Textarea = lazy(() => import("../ui/textarea"));

type CommentsProps = {
    website: websites,
    currentUser: User | null
}

type CommentFormInputs = {
    content: string,
    url: string
}

const WebsiteComments = (props: CommentsProps) => {
    const fetcher = (url: string) =>
        actions.fetchWebsiteComments({ url }).then(({ data, error }) => {
            if (error) throw error;
            return data;
        });

    const { data: user, isPending } = authClient.useSession()
    const userLoggedIn = useMemo(() => user, [user])

    const { data: comments, error, isLoading, mutate } = useSWR(`comments-fetch-"${props.website.id}"`, () => fetcher(props.website.url), {
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
            url: props.website.url
        },
        resolver: zodResolver(commentSchema),
        mode: "onSubmit"
    })

    const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful }, setError, reset } = methods

    const onSubmit: SubmitHandler<CommentFormInputs> = async (data) => {
        const { url, content } = data;

        if (!userLoggedIn) {
            postResultSet({ type: "error", content: "You must be logged in to post a comment." });
            return;
        }

        if (!content) return

        const result = await actions.postWebsiteComment({
            url: props.website.url,
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
            created_by: props.currentUser?.name ?? "Unknown",
            created_at: new Date(),
            website_url: props.website.url,
            user: {
                id: props.currentUser?.id ?? "",
                image: props.currentUser?.image ?? "/favicon.png",
                name: props.currentUser?.name ?? "Unknown"
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
            <Pagination className={cn("transition-all bg-white text-text-50 dark:bg-neutral-800 dark:text-text-950 px-4 py-1 sm:w-fit w-full rounded-md")}>
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
        <Container className="!bg-background-950 dark:!bg-neutral-900 dark:!border-neutral-700 overflow-hidden px-6 relative space-y-4 grow h-full max-w-md">
            <p className="flex items-center gap-1"><MessageSquareText /> Comments ({comments?.length ?? 0})</p>
            <div className="flex flex-col gap-4">
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className={cn(
                        "flex flex-col items-center gap-2 relative min-w-3xs max-w-2xs",
                    )}>
                        <Textarea disabled={!userLoggedIn} placeholder="Write a comment..." className="w-full max-h-38 max-w-2xs bg-white" maxLength={MAX_COMMENT_LENGTH} minLength={MIN_COMMENT_LENGTH} {...register("content", { required: true })} />
                        {errors.content && <span className="text-red-500">{errors.content.message}</span>}
                        <Button variant={"default"} disabled={isSubmitting || !userLoggedIn} type="submit" className="w-full">{
                            !userLoggedIn ? <><Lock /> You must be logged in</> : isSubmitting ? <><LoaderCircle className="animate-spin" /> Posting...</> : <><MessageSquareText /> Post comment</>
                        }</Button>
                    </form>
                </FormProvider>

                {postResult && <Alert className="!max-w-2xs" variant={postResult.type === "success" ? "success" : "error"}>{postResult.content}</Alert>}
                <div className="w-full h-[1px] bg-neutral-600" />
                {isLoading ? (<div className="space-y-2 max-h-84 overflow-y-auto">
                    <div className="w-full h-18 bg-background-800 dark:bg-neutral-700 animate-pulse rounded-md" />
                    <div className="w-full h-18 bg-background-800 dark:bg-neutral-700 animate-pulse rounded-md" />
                    <div className="w-full h-18 bg-background-800 dark:bg-neutral-700 animate-pulse rounded-md" />
                    <div className="w-full h-18 bg-background-800 dark:bg-neutral-700 animate-pulse rounded-md" />
                </div>) : (
                    error ? (<p className="text-red-500 max-w-3xs break-words text-balance">
                        Failed to obtain comments: {error.message}
                    </p>) : (
                        !comments || comments?.length <= 0 ? <p className="text-text-500">No comments yet</p> : (
                            <>
                                <div className="space-y-2 max-h-84 overflow-y-auto px-2" ref={animationParent}>
                                    {
                                        slicedComments?.map((comment, index) => {

                                            // TODO: fix users avatar on error / not found no fallback
                                            return (
                                                <div key={index} className="flex items-start gap-2 bg-white dark:!bg-neutral-800 dark:!border-neutral-700 py-3 px-4 rounded-md">
                                                    <img src={comment.user.image ?? "/favicon.png"} alt={comment.created_by + "'s avatar"} className="w-12 h-12 rounded-full border-[2px] border-primary-400" />
                                                    <div>
                                                        <p className="text-black dark:!text-text-950 max-w-[12rem] overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:6] [-webkit-box-orient:vertical] break-words text-balance">{comment.content}</p>
                                                        <p className="text-text-400 dark:text-text-600 text-sm"><a href={"/profile/" + comment.created_by}>{comment.created_by}</a> <span className="text-neutral-600 text-xs" title={comment.created_at.toString()}>• {formatDistanceToNow(comment.created_at, { includeSeconds: true, addSuffix: true })}</span></p>
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
    )
}

export default WebsiteComments;