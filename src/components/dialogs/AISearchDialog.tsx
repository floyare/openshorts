import { LoaderCircle, Search, Sparkles, X } from "lucide-react"
import Container from "../container"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useEffect, useState, useTransition } from "react"
import useDebounce from "@/hooks/useDebounce"
import type { WebsiteType } from "@/types/website"
import { actions } from "astro:actions"
import { cn } from "@/lib/utils"
import WebsiteItem from "../websites/website-item"
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Dialog, DialogContent } from "../ui/dialog"

type AISearchDialogProps = {
    onClose: (val: boolean) => void
    additionalProps: {
        url: string
    }
}

const AISearchDialog = ({ onClose, additionalProps }: AISearchDialogProps) => {
    const [searchInput, searchInputSet] = useState("")
    const debouncedSearch = useDebounce(searchInput, 1000)

    const [websitesResult, websitesResultSet] = useState<WebsiteType[]>([])
    const [isSearching, searchingTransitionSet] = useTransition()

    useEffect(() => {
        if (debouncedSearch.length <= 0) return

        searchingTransitionSet(async () => {
            const result = await actions.getWebsitesRecommendation({ content: debouncedSearch })
            websitesResultSet(result.data ?? [])
        })
    }, [debouncedSearch])

    const [animationParent] = useAutoAnimate()

    return (
        <Dialog open onOpenChange={onClose}>
            {/* // <div className="fixed top-0 left-0 w-full h-full bg-black/80 z-[1001] grid place-items-center-safe transition-all"> */}
            <DialogContent>
                <Container className="!bg-background-950 overflow-hidden px-6 m-4 h-fit">
                    <div className="flex flex-col gap-4 items-center bg-gradient-to-tr from-primary-500 to-primary-300 -mx-6 -mt-4.5 py-6 px-12 relative">
                        <Button variant={"ghost"} className="absolute top-2 right-2 text-white" onClick={() => onClose(false)}><X /></Button>
                        <div>
                            <h2 className="text-3xl text-white font-bold mt-2 flex flex-col items-center gap-1"><Sparkles size={42} className="relative text-accent-500" /> Try searching with AI</h2>
                            <p className="text-neutral-200">Describe anything you want to search for...</p>
                        </div>

                        <Input disabled={isSearching} className={cn(isSearching ? "animate-pulse" : "", "max-w-lg drop-shadow-xl drop-shadow-black/20")} placeholder="Find website with free image assets..." value={searchInput} onChange={(e) => searchInputSet(e.target.value)} />
                    </div>
                    <div className={cn("flex flex-col gap-2 mt-4 py-2 relative overflow-y-auto max-h-[70vh]")}>
                        {isSearching && <div className="bg-white p-4 z-20 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-fit rounded-md flex flex-col justify-center items-center gap-2 border-[1px] border-primary-300" ref={animationParent}>
                            <LoaderCircle size={48} className="text-primary-500 animate-spin" />
                            <h2 className="text-xl">Thinking...</h2>
                        </div>}

                        {isSearching && <div className="absolute top-0 left-0 -my-4 -mx-6 z-10 w-[120%] h-[120%] bg-background-700/60 animate-pulse" ref={animationParent} />}

                        {!isSearching && websitesResult.length <= 0 ? (
                            debouncedSearch.length > 0 ? (
                                <div className="flex justify-center">
                                    <p className="text-sm text-neutral-500">No results! Try changing your requirements.</p>
                                </div>
                            ) : (
                                <div className="flex justify-center">
                                    <p className="text-sm text-neutral-500 flex items-center gap-1"><Search /> Try searching anything that you want!</p>
                                </div>)
                        ) : (
                            <div className="flex flex-col gap-2 ">
                                {/* {websitesResult.length > 0 && <h3 className="text-xl font-semibold">Here it is what I found!</h3>} */}
                                <div className="grid lg:grid-cols-2 grid-cols-1 gap-2" ref={animationParent}>
                                    {
                                        websitesResult.map((website) => (
                                            <WebsiteItem website={website} />
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* {!isSearching && websitesResult.length <= 0 ? debouncedSearch.length > 0 ? (
                        <div className="flex justify-center">
                            <p className="text-sm text-neutral-500">No results! Try changing your requirements.</p>
                        </div>
                    ) : <div className="flex justify-center">
                        <p className="text-sm text-neutral-500">Try searching anything that you want!</p>
                    </div>
                        :
                        <div className="flex flex-col gap-2 items-center justify-center">
                            <h3 className="text-xl font-semibold">Here it is what I found!</h3>
                            <div className="flex flex-wrap gap-2 items-center justify-center" ref={animationParent}>
                                {
                                    websitesResult.map((website) => (
                                        <WebsiteItem website={website} />
                                    ))
                                }
                            </div>
                        </div>} */}
                    </div>
                </Container>
            </DialogContent>
        </Dialog>
        // </div>
    );
}

export default AISearchDialog;