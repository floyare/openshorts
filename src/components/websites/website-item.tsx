import { ExternalLink, Flag, Heart, LoaderCircle, MessageSquareText } from "lucide-react";
import type { WebsiteType } from "@/types/website";
import WebsiteIcon from "./website-icon";
import WebsitePreview from "./website-preview";
import { Button } from "../ui/button";
import { actions } from "astro:actions";
import { useEffect, useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { debugLog } from "@/lib/log";
import { authClient } from "@/lib/auth-client";
import { DEBUG_ALLOW_LIKE_OWN_WEBSITES } from "@/helpers/websites.helper";
import { useDialogManager, getActiveDialogs } from "easy-dialogs";
import { dialogs } from "@/lib/dialogs";
import { useAnalytics } from "shibuitracker-client/client";

interface WebsiteItemProps extends React.HTMLAttributes<HTMLDivElement> {
    website: WebsiteType,
    highlightedText?: string[],
    disableCommentsDialog?: boolean
}

const MAX_TAGS_TO_DISPLAY = 3;

function WebsiteItem({ website, highlightedText = [], className, ...props }: WebsiteItemProps) {
    const [likeActionPending, likeActionPendingSet] = useTransition()
    const [isWebsiteLiked, isWebsiteLikedSet] = useState(website.isLiked)
    const [likes, likesSet] = useState(website.likesCount ?? 0)
    const { name, url, description, image, isLiked } = website;
    const { data: currentUser } = authClient.useSession()
    const { sendEvent } = useAnalytics()

    const { callDialog } = useDialogManager(dialogs)

    const canBeLiked = useMemo(() => DEBUG_ALLOW_LIKE_OWN_WEBSITES || (currentUser?.user.name !== website.created_by), [currentUser?.user])

    useEffect(() => {
        isWebsiteLikedSet(isLiked)
    }, [isLiked])

    const highlight = (text: string): React.ReactNode => {
        if (!highlightedText.some(word => word.length > 0))
            return text;

        const parts = text.split(new RegExp(`(${highlightedText.join('|')})`, 'gi'));
        return parts.map((part, index) =>
            highlightedText.includes(part.toLowerCase()) ? (
                <span key={index} className="bg-secondary-400/50 font-bold">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    const handleLike = async () => {
        if (!canBeLiked) {
            toast.error("You can't like your own websites!")
            return
        }

        const likeResult = await actions.toggleLikeWebsite({ websiteId: website.id })
        if (likeResult.error) {
            toast.error("Failed while sending a like. Try again later!")
            debugLog("ERROR", likeResult.error)
            return
        }

        likeResult.data.liked ? likesSet(p => p + 1) : likesSet(p => p - 1)

        isWebsiteLikedSet(likeResult.data.liked)
        toast.success(`Successfully ${likeResult.data.liked ? "Liked" : "Disliked"}!`)
    }

    return (
        <div {...props} className={cn("px-6 py-4 2xl:max-w-lg max-w-full rounded-sm border-[1px] border-background-800 dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-text-950 w-full flex flex-col gap-2 grow relative", className)}>
            <div className="grid sm:grid-cols-[1fr_auto] grid-cols-1 gap-1 !w-full h-full">
                <div className="flex flex-col gap-2 w-full">
                    <a href={website.url} onMouseDown={(e) => {
                        if (e.button === 1) {
                            sendEvent("custom_event", { source: "navigate - " + website.url })
                        }
                    }} target="_blank" title={`Visit ${website.name}`} className="flex items-center gap-2 cursor-pointer hover:bg-primary-700/20 transition-colors rounded-sm w-full">
                        <WebsiteIcon src={
                            `https://s2.googleusercontent.com/s2/favicons?domain=${url}&sz=128`
                            //`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=128`
                        } alt={`${name} favicon`} size={48} />
                        <h3 className="font-bold text-2xl flex items-center gap-1 relative w-full">
                            <span className="truncate inline-block 2xl:!max-w-[6.3vw] xl:!max-w-[16.5vw] !max-w-[25vw]">{highlight(name)}</span>
                            <ExternalLink className="text-text-600" size={18} />
                        </h3>
                    </a>
                    <p className="w-full max-w-3xs overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:6] [-webkit-box-orient:vertical] break-words text-balance">
                        {description ? highlight(description) : "No description"}
                    </p>
                    <div className="mt-auto flex flex-col gap-2">
                        <div className="flex items-center gap-1 flex-wrap">
                            {
                                website.tags.slice(0, MAX_TAGS_TO_DISPLAY).map((tag, index) => (
                                    <div className="bg-secondary-600 text-white text-sm font-semibold px-2 py-1 rounded-sm" key={index}>
                                        {tag.toUpperCase()}
                                    </div>
                                ))
                            }
                            {website.tags.length > MAX_TAGS_TO_DISPLAY && <span className="text-secondary-600 text-sm font-semibold cursor-help" title={website.tags.slice(website.tags.length - (website.tags.length - MAX_TAGS_TO_DISPLAY), website.tags.length + 1).map((t) => t).toString()}>+{website.tags.length - MAX_TAGS_TO_DISPLAY}</span>}
                        </div>
                        <div className="flex md:items-end items-center gap-1">
                            <p className="text-neutral-500">Uploaded by: <a href={`/profile/${website.created_by}`} title={"Visit " + website.created_by + "'s profile"} className="text-text-600 font-bold hover:text-text-700 transition-colors truncate max-w-2xs">{website.created_by}</a></p>
                            <Button disabled={!(!!currentUser?.user)} className={cn("ml-auto", !(!!currentUser?.user) ? "cursor-not-allowed" : "cursor-pointer")} onClick={async () => {
                                await callDialog("report-dialog", { url: website.url })
                            }} size={"icon"} variant={"ghost"} title={!(!!currentUser?.user) ? "You must be logged in to report this website" : "Report a problem with this website"}><Flag className="text-red-400" size={24} /></Button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 sm:w-max w-full">
                    <WebsitePreview src={image ?? ""} className="rounded-sm grow w-full border-[1px] border-secondary-700" size={{ width: 120, height: 200 }} />
                    <div className="flex items-center gap-1">
                        {/* TODO:  zrobic lepsze te animacje i serio tylko onclick */}
                        <Button variant={isWebsiteLiked ? "primary" : "secondary"} disabled={likeActionPending || !canBeLiked || !currentUser?.user} title={!currentUser?.user ? "You must be logged in to like this website" : undefined} onClick={() => likeActionPendingSet(handleLike)} className={cn("relative flex items-center justify-center group gap-2 border-[1px] border-secondary-500", !currentUser?.user ? "cursor-not-allowed" : "cursor-pointer", isWebsiteLiked && (likes !== website.likesCount || website.isLiked) ? "liked__website" : "")}>
                            {
                                likeActionPending ? <LoaderCircle className="animate-spin" /> :
                                    <Heart className={cn("text-text-600 cursor-pointer shrink-0 group-hover:fill-text-700/80", isWebsiteLiked ? "fill-white group-hover:fill-text-900" : "", isWebsiteLiked && (likes !== website.likesCount || website.isLiked) ? "liked__website" : "")} />
                            }
                            <p className="font-semibold text-xl">{likes}</p>
                        </Button>
                        <Button
                            variant={"secondary"}
                            className="relative flex items-center justify-center cursor-pointer group gap-2 border-[1px] border-secondary-500"
                            onClick={async () => await callDialog("website-details", { website })}
                            disabled={
                                getActiveDialogs().some((p) => p.dialogKeyId === "website-details") || props.disableCommentsDialog
                            }
                        >
                            <MessageSquareText className="text-text-600 cursor-pointer shrink-0 group-hover:fill-text-700/80 transition-colors" />
                            <p className="font-semibold text-xl">{website.commentsCount}</p>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WebsiteItem;
