import { ExternalLink, Heart, LoaderCircle, LoaderIcon, MessageSquareText } from "lucide-react";
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

interface WebsiteItemProps extends React.HTMLAttributes<HTMLDivElement> {
    website: WebsiteType,
    highlightedText?: string[]
}

const MAX_TAGS_TO_DISPLAY = 3;

function WebsiteItem({ website, highlightedText = [], className, ...props }: WebsiteItemProps) {
    const [likeActionPending, likeActionPendingSet] = useTransition()
    const [isWebsiteLiked, isWebsiteLikedSet] = useState(website.isLiked)
    const [likes, likesSet] = useState(website.likesCount ?? 0)
    const { name, url, description, image, isLiked } = website;
    const { data } = authClient.useSession()

    const canBeLiked = useMemo(() => DEBUG_ALLOW_LIKE_OWN_WEBSITES ?? data?.user.image !== website.name, [data?.user])

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
        <div {...props} className={cn("px-6 py-4 2xl:max-w-lg max-w-full rounded-sm border-[1px] border-background-800 bg-white w-full flex flex-col gap-2 grow relative", className)}>
            <div className="grid sm:grid-cols-[1fr_auto] grid-cols-1 gap-1 !w-full">
                <div className="flex flex-col gap-2 w-full">
                    <a href={website.url} target="_blank" className="flex items-center gap-4 cursor-pointer hover:bg-primary-700/20 transition-colors rounded-sm w-full">
                        <WebsiteIcon src={`https://s2.googleusercontent.com/s2/favicons?domain=${url}&sz=128`} alt={`${name} favicon`} size={48} />
                        <h2 className="font-bold text-2xl flex items-center gap-1 relative w-full">
                            <span className="truncate inline-block 2xl:!max-w-[7.5vw] !max-w-[12rem]">{highlight(name)}</span>
                            <ExternalLink className="text-text-600" size={18} />
                        </h2>
                    </a>
                    <p className="w-full overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:6] [-webkit-box-orient:vertical] break-words text-balance">
                        {description ? highlight(description) : "No description"}
                    </p>
                    <div className="mt-auto flex flex-col gap-2">
                        <div className="flex items-center gap-1 flex-wrap">
                            {
                                website.tags.slice(0, MAX_TAGS_TO_DISPLAY).map((tag, index) => (
                                    <div className="bg-secondary-700 text-text-950 text-sm font-semibold px-2 py-1 rounded-sm" key={index}>
                                        {tag.toUpperCase()}
                                    </div>
                                ))
                            }
                            {website.tags.length > MAX_TAGS_TO_DISPLAY && <span className="text-secondary-700 text-sm font-semibold">+{website.tags.length - MAX_TAGS_TO_DISPLAY}</span>}
                        </div>
                        <div>
                            <p className="text-neutral-500">Uploaded by: <a href={`/profile/${website.created_by}`} className="text-text-600 font-bold hover:text-text-700 transition-colors truncate max-w-2xs">{website.created_by}</a></p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 sm:w-max w-full">
                    <WebsitePreview src={image ?? ""} className="rounded-sm grow w-full border-[1px] border-secondary-700" size={{ width: 120, height: 200 }} />
                    <div className="flex items-center gap-1">
                        <Button variant={"secondary"} disabled={likeActionPending || !canBeLiked} onClick={() => likeActionPendingSet(handleLike)} className="relative flex items-center justify-center cursor-pointer group gap-2 border-[1px] border-secondary-500">
                            {
                                likeActionPending ? <LoaderCircle className="animate-spin" /> :
                                    <Heart className={cn("text-text-600 cursor-pointer shrink-0 group-hover:fill-text-700/80", isWebsiteLiked ? "fill-text-500 group-hover:fill-text-900" : "")} size={34} />
                            }
                            <p className="font-semibold text-xl">{likes}</p>
                        </Button>
                        <Button variant={"secondary"} className="relative flex items-center justify-center cursor-pointer group gap-2 border-[1px] border-secondary-500">
                            <MessageSquareText className="text-text-600 cursor-pointer shrink-0 group-hover:fill-text-700/80 transition-colors" />
                            <p className="font-semibold text-xl">{0}</p>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WebsiteItem;
