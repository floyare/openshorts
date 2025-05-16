import { LoaderCircle, Sparkles, X } from "lucide-react"
import Container from "../container"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useEffect, useState, useTransition } from "react"
import useDebounce from "@/hooks/useDebounce"
import type { WebsiteType } from "@/types/website"
import { actions } from "astro:actions"
import { cn } from "@/lib/utils"
import WebsiteItem from "../websites/website-item"

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

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black/80 z-[1001] grid place-items-center-safe transition-all">
            <Container className="!bg-background-950 min-w-2xs overflow-hidden px-6">
                <div className="flex flex-col gap-4 items-center bg-gradient-to-tr from-primary-500 to-primary-300 -mx-6 -mt-4.5 py-6 px-12 relative">
                    <Button variant={"ghost"} className="absolute top-2 right-2 text-white" onClick={() => onClose(false)}><X /></Button>
                    <div>
                        <h2 className="text-3xl text-white font-bold mt-2 flex flex-col items-center gap-1"><Sparkles size={42} className="relative text-accent-500" /> Try searching with AI</h2>
                        <p className="text-neutral-200">Describe anything you want to search for...</p>
                    </div>

                    <Input disabled={isSearching} className={cn(isSearching ? "animate-pulse" : "", "max-w-lg")} placeholder="Find website with free image assets..." value={searchInput} onChange={(e) => searchInputSet(e.target.value)} />
                </div>
                <div className={cn("flex flex-col gap-2 mt-4 py-6 relative", isSearching ? "animate-pulse opacity-75" : "")}>
                    {isSearching && <div className="bg-white absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 z-20 rounded-md shadow-2xl shadow-black border-[1px] border-primary-300">
                        <LoaderCircle size={48} className="text-primary-500 animate-spin" />
                    </div>}
                    {!isSearching && websitesResult.length <= 0 ? debouncedSearch.length > 0 ? (
                        <div className="flex justify-center">
                            <p className="text-sm text-neutral-500">No results! Try changing you requirements.</p>
                        </div>
                    ) : <div className="flex justify-center">
                        <p className="text-sm text-neutral-500">Try searching anything that you want!</p>
                    </div>
                        :
                        <div className="flex flex-col gap-2 items-center justify-center">
                            <h3 className="text-xl font-semibold">Here it is what I found!</h3>
                            <div className="flex flex-wrap gap-2 items-center justify-center">
                                {
                                    websitesResult.map((website) => (
                                        <WebsiteItem website={website} />
                                    ))
                                }
                            </div>
                        </div>}
                </div>
            </Container>
        </div>
    );
}

export default AISearchDialog;