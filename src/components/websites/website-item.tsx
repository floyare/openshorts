import { ExternalLink, Heart, LoaderCircle, LoaderIcon } from "lucide-react";
import type { WebsiteType } from "@/types/website";
import WebsiteIcon from "./website-icon";
import WebsitePreview from "./website-preview";
import { Button } from "../ui/button";
import { actions } from "astro:actions";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { debugLog } from "@/lib/log";

type WebsiteItemProps = {
    website: WebsiteType
}

const MAX_TAGS_TO_DISPLAY = 4;

function WebsiteItem({ website }: WebsiteItemProps) {
    const [likeActionPending, likeActionPendingSet] = useTransition()
    const [isWebsiteLiked, isWebsiteLikedSet] = useState(website.isLiked)
    const [likes, likesSet] = useState(website.likesCount ?? 0)
    const { name, url, description, image, isLiked } = website;

    useEffect(() => {
        isWebsiteLikedSet(isLiked)
    }, [isLiked])

    const handleLike = async () => {
        const likeResult = await actions.toggleLikeWebsite({ websiteId: website.id })
        if (likeResult.error) throw new Error("Failed while toggling like")

        likeResult.data.liked ? likesSet(p => p + 1) : likesSet(p => p - 1)

        isWebsiteLikedSet(likeResult.data.liked)
    }

    return (
        <div className="px-6 py-4 max-w-lg rounded-sm border-[1px] border-background-800 bg-background-950 w-full flex flex-col gap-2 grow relative">
            <div className="grid grid-cols-[1fr_auto] gap-1 bg-accent-700 !w-full">
                <div className="flex flex-col gap-2 bg-yellow-200 w-full">
                    <a href={website.url} target="_blank" className="flex items-center gap-4 cursor-pointer hover:bg-primary-700/20 transition-colors rounded-sm w-full">
                        <WebsiteIcon src={`https://s2.googleusercontent.com/s2/favicons?domain=${url}&sz=128`} alt={`${name} favicon`} size={48} />
                        <h2 className="font-bold text-2xl flex items-center gap-1 relative bg-green-300 w-full">
                            <span className="truncate inline-block !max-w-[160px] bg-red-400">{name}</span>
                            <ExternalLink className="text-text-600" size={18} />
                        </h2>
                    </a>
                    <p className="w-full overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:6] [-webkit-box-orient:vertical] bg-blue-300 break-words text-balance">
                        {description}
                        <p>{JSON.stringify(website.isLiked)}</p>
                    </p>
                    <div className="mt-auto flex flex-col gap-2 bg-purple-400">
                        <div className="flex items-center gap-1">
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
                    {/* <Button variant="primary">
                        Visit website <ExternalLink />
                    </Button> */}
                </div>
                <div className="flex flex-col items-end gap-2 bg-orange-300 w-max">
                    {/* <img src={image} width={150} height={350} className="rounded-sm w-[80%] shrink" alt={`${name} screenshot`} /> */}
                    <WebsitePreview src={image} className="rounded-sm w-full grow" size={{ width: 150, height: 250 }} />
                    <Button variant={"secondary"} disabled={likeActionPending} onClick={() => likeActionPendingSet(handleLike)} className="flex items-center justify-center cursor-pointer group gap-2">
                        {
                            likeActionPending ? <LoaderCircle className="animate-spin" /> :
                                <Heart className={cn("text-text-600 cursor-pointer shrink-0 group-hover:fill-text-700/80", isWebsiteLiked ? "fill-text-500 group-hover:fill-text-900" : "")} size={34} />
                        }
                        <p className="font-semibold text-xl">{likes}</p>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default WebsiteItem;
