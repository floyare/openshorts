import { Bug, CircleHelp, LoaderCircle, Lock, LogIn, Search, ShieldMinus, Sparkles, X } from "lucide-react"
import Container from "../container"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useEffect, useMemo, useState, useTransition } from "react"
import useDebounce from "@/hooks/useDebounce"
import type { WebsiteType } from "@/types/website"
import { actions } from "astro:actions"
import { cn } from "@/lib/utils"
import WebsiteItem from "../websites/website-item"
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Dialog, DialogContent } from "../ui/dialog"
import { debugLog } from "@/lib/log"
import { CLIENT_AI_USAGE_STORAGE_KEY, MAX_AI_USAGES_PER_DAY, MAX_PROMPT_LENGTH } from "@/helpers/ai.helper"
import { authClient } from "@/lib/auth-client"
import { useLocalStorage } from "@uidotdev/usehooks";
import type { AIUsageType } from "@/types/user"
import { toast } from "sonner"
import { isToday } from "date-fns"
import { useAnalytics } from "shibuitracker-client/client"

type AISearchDialogProps = {
    onClose: (val: boolean) => void
    additionalProps: {
        url: string
    }
}

const AISearchDialog = ({ onClose, additionalProps, ...rest }: AISearchDialogProps) => {
    const [searchInput, searchInputSet] = useState("")
    const debouncedSearch = useDebounce(searchInput, 1300)
    const [aiUsage, aiUsageSet] = useLocalStorage<AIUsageType | null>(CLIENT_AI_USAGE_STORAGE_KEY, null)

    const [websitesResult, websitesResultSet] = useState<WebsiteType[]>([
        // { "id": "f1822ee9-ee6b-4fb6-ae0f-9a7b25c0b040", "name": "Cleanup", "description": "Use cleanup.pictures to remove unwanted objects, people, or defects. ", "url": "https://cleanup.pictures/", "image": null, "tags": ["AI", "TOOLS"], "created_by": "floyare", "isLiked": true, "likesCount": 1 },
        // { "id": "ef3cfd64-96f0-4cd3-aac9-19e517ef6667", "name": "Wp", "description": "wupekczek2", "url": "https://wp.pl", "image": null, "tags": ["ASSETS"], "created_by": "floyare", "isLiked": true, "likesCount": 1 },
        // { "id": "874baa09-ab85-4f36-a19b-a4c56e4402c8", "name": "Devshorts.vercel", "description": "devshorts21203", "url": "https://devshorts.vercel.app", "image": "https://0gua24aj2l.ufs.sh/f/a4haveHUkL0rrmhkeqR16NyhMJbBcmZFYvs8nOekIxERXVQt", "tags": ["ASSETS"], "created_by": "floyare", "isLiked": true, "likesCount": 1 },
        // { "id": "43838e9e-8077-4c8a-b3f3-a16c8fc5bc16", "name": "Videezy", "description": "Free HD Stock Video Footage", "url": "https://videezy.com/", "image": "https://0gua24aj2l.ufs.sh/f/a4haveHUkL0rtSoOI4vuQrnwoTbgE9GLR5MvWdXNePClpVk0", "tags": ["LIBRARIES", "ASSETS", "VIDEO"], "created_by": "floyare", "isLiked": false, "likesCount": 0 }
    ])
    const [isSearching, searchingTransitionSet] = useTransition()
    const [searchError, searchErrorSet] = useState<string | null>(null)
    const { data: user, isPending } = authClient.useSession()

    const userLoggedIn = useMemo(() => user, [user])
    const aiNoUsagesLeft = useMemo(() => (aiUsage && isToday(aiUsage.date) && aiUsage?.used >= MAX_AI_USAGES_PER_DAY) ?? false, [aiUsage])

    const { sendEvent } = useAnalytics()

    useEffect(() => {
        if (debouncedSearch.length <= 0) return
        searchErrorSet(null)

        searchingTransitionSet(async () => {
            const result = await actions.getWebsitesRecommendation({ content: debouncedSearch })
            debugLog("ACTION", result)

            await sendEvent("custom_event", { source: "ai search invocation" })

            if (result.error) {
                // not cool of making this but idk how for now
                // TODO: make this check better
                if (result.error.message === "You've reached maximum daily usage of Search AI. Try again tommorow.") {
                    aiUsageSet({ date: new Date, used: MAX_AI_USAGES_PER_DAY })
                }

                debugLog("ERROR", result)
                searchErrorSet(result.error.message)
                websitesResultSet([])
                return
            }

            aiUsageSet(result.data.usage)
            if (result.data.usage.used >= MAX_AI_USAGES_PER_DAY) {
                toast.info("You've reached maximum AI Search for today. See you again tommorow!")
            }

            websitesResultSet(result.data.response ?? [])
        })
    }, [debouncedSearch])

    const [animationParent] = useAutoAnimate()

    return (
        <Dialog open onOpenChange={onClose}>
            {/* // <div className="fixed top-0 left-0 w-full h-full bg-black/80 z-[1001] grid place-items-center-safe transition-all"> */}
            <DialogContent className="data-[state=closed]:!animate-fadeout animate-fadein !z-[1005]" {...rest}>
                <Container className="!bg-background-950 overflow-hidden md:px-6 px-4 h-fit relative dark:!bg-neutral-900 dark:!border-neutral-700">
                    <div className="flex flex-col gap-4 items-center bg-gradient-to-tr from-primary-500 to-primary-300 -mx-6 -mt-4.5 py-6 px-12 relative">
                        <Button variant={"ghost"} className="absolute top-2 right-2 text-white" onClick={() => onClose(false)}><X /></Button>
                        <div className="text-center">
                            <h2 className="md:text-3xl text-2xl  text-white font-bold mt-2 flex flex-col items-center gap-1"><Sparkles size={42} className="relative text-accent-500 animate-levitate" /> Try searching with AI</h2>
                            <p className="text-neutral-200">Describe anything you want to search for...</p>
                        </div>

                        <div className="max-w-lg w-full relative overflow-hidden rounded-md">
                            {(!userLoggedIn || aiNoUsagesLeft) && (
                                <div className="absolute top-0 left-0 w-full h-full grid place-items-center bg-background-200/10 z-10">
                                    <Lock size={28} className="text-primary-600 bg-white border-[1px] border-primary-400 p-1 rounded-sm" />
                                </div>
                            )
                            }
                            <Input
                                disabled={isSearching || !userLoggedIn || aiNoUsagesLeft}
                                className={cn(isSearching ? "animate-pulse" : "", "w-full drop-shadow-xl drop-shadow-black/20 dark:bg-neutral-800")}
                                placeholder="Find website with free image assets..."
                                value={searchInput}
                                onChange={(e) => searchInputSet(e.target.value)}
                                maxLength={MAX_PROMPT_LENGTH}
                            />
                        </div>
                    </div>
                    <div className={cn("flex flex-col md:items-center gap-2 -mb-4 -mx-6 py-6 px-4 relative overflow-y-auto md:max-h-[70vh] items-center max-h-[50vh]")}>
                        {isSearching && <div className={cn("bg-white dark:bg-neutral-700 p-4 z-20 w-fit rounded-md flex flex-col justify-center items-center gap-2 border-[1px] border-primary-300 animate-in", websitesResult.length <= 0 ? "relative" : "absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]")} ref={animationParent}>
                            <LoaderCircle size={48} className="text-primary-500 animate-spin" />
                            <h2 className="text-xl">Thinking...</h2>
                        </div>}

                        {isSearching && <div className="absolute inset-0 z-10 w-[100%] h-[100%] bg-background-700/60 animate-pulse" ref={animationParent} />}

                        {!isSearching && websitesResult.length <= 0 ? (
                            debouncedSearch.length > 0 && !searchError ? (
                                <div className="flex justify-center">
                                    <p className="text-sm text-neutral-500 flex items-center gap-1 flex-col"><CircleHelp /> No results! Try changing your prompt.</p>
                                </div>
                            ) : (
                                searchError ? (
                                    <div className="flex justify-center flex-col items-center gap-1">
                                        <p className="text-base text-red-500 flex items-center gap-1 flex-col"><Bug /> Failed while searching recommendations!</p>
                                        <p className="text-xs text-neutral-500 text-balance break-words max-w-xl text-center">{searchError}</p>
                                    </div>
                                ) : (
                                    userLoggedIn ? (
                                        aiNoUsagesLeft ? (
                                            <div className="flex justify-center">
                                                <div className="text-sm text-red-500 flex items-center gap-1 flex-col"><ShieldMinus /> <p className="max-w-xs text-center">You've reached maximum <b>AI Search</b> usage! Try again tommorow.</p></div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center">
                                                <p className="text-sm text-neutral-500 flex items-center gap-1 flex-col"><Search /> Try searching anything that you want!</p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex flex-col justify-center items-center gap-2">
                                            <div className="text-sm text-neutral-500 flex items-center gap-1 flex-col"><Lock /> <p>You must be logged in to use <b>AI Search</b> feature!</p></div>
                                            <a href="/signin"><Button variant={"primary"}><LogIn /> Sign in</Button></a>
                                        </div>
                                    )
                                )
                            )
                        ) : (
                            <div className="flex flex-col gap-2">
                                {websitesResult.length > 0 && <p className="text-sm text-neutral-500 flex items-center gap-1">Found {websitesResult.length} websites!</p>}
                                <div className="grid xl:grid-cols-2 grid-cols-1 gap-2" ref={animationParent}>
                                    {
                                        websitesResult.map((website, idx) => (
                                            <WebsiteItem website={website} key={idx} />
                                        ))
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                </Container>
            </DialogContent >
        </Dialog >
        // </div>
    );
}

export default AISearchDialog;