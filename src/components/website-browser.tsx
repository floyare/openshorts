import type { SearchContentType, WebsiteTag, WebsiteType } from "@/types/website";
import WebsiteItem from "./websites/website-item";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { debugLog } from "@/lib/log";
import { actions } from "astro:actions";
import { cn } from "@/lib/utils";
import useDebounce from "@/hooks/useDebounce";
import Container from "./container";
import { ArrowDownAZ, CalendarArrowDown, CalendarArrowUp, Coffee, Compass, FileQuestion, Github, Heart, LoaderCircle, Search, Sparkles, Tags, Youtube } from "lucide-react";
import { Input } from "./ui/input";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { memo } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MAX_PAGES_TO_LOAD, PAGE_SIZE, type SORTING_TYPE } from "@/helpers/websites.helper";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import type { User } from "better-auth";
import { toast } from "sonner";
import SkewedHighlight from "./skewed-highlight";
import { Button } from "./ui/button";
import { useDialogManager } from "easy-dialogs";
import { dialogs } from "@/lib/dialogs";
import { useSearchParamState } from "@/hooks/useSearchParamState";
import AdElement from "./ads/ad-element";
import { Fragment } from "react";
import useSWR from "swr";

type BrowserProps = {
    //entryWebsites: WebsiteType[],
    //totalWebsites: number,
    //tags: WebsiteTag[],
    currentUser?: User
}

// TODO: dodac skeleton placeholdery loading
const WebsiteBrowser = ({ /*entryWebsites, totalWebsites, tags,*/ currentUser }: BrowserProps) => {
    const [page, setPage] = useState(1);

    const fetcher = () =>
        actions.searchWebsites({
            sorting: "new"
        }).then(({ data, error }) => {
            if (error) throw error;
            return data;
        });

    const { data: entryFetchData, error, isLoading } = useSWR("websites", async () => fetcher(), {
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        refreshWhenOffline: false,
        refreshWhenHidden: false,
        refreshInterval: 0,
    })

    const entryWebsites = useMemo(
        () => entryFetchData?.websites || [],
        [entryFetchData?.websites]
    );

    const totalWebsites = useMemo(
        () => entryFetchData?.total || 0,
        [entryFetchData?.total]
    );

    const tags = useMemo(
        () => entryFetchData?.tags || [],
        [entryFetchData?.tags]
    );

    const [currentWebsites, currentWebsitesSet] = useState<WebsiteType[]>(entryWebsites);
    const filteredWebsites = currentWebsites.filter((website) => true)

    const [totalPages, totalPagesSet] = useState(Math.ceil(totalWebsites / PAGE_SIZE))
    const [tagsList, tagsListSet] = useState(tags)
    const noEntries = useMemo(() => tagsList.every((p) => p.count === 0), [tagsList])

    useEffect(() => {
        currentWebsitesSet(entryWebsites)
        totalPagesSet(Math.ceil(totalWebsites / PAGE_SIZE))
        tagsListSet(tags)
    }, [entryFetchData])

    const [searchContentPhrase, searchContentPhraseSet] = useSearchParamState<string>("search", "");

    const [websitesLoading, startWebsitesLoading] = useTransition()

    const [searchContent, searchContentSet] = useState<SearchContentType>({
        search: searchContentPhrase,
        tags: []
    })

    const [showOnlyLiked, showOnlyLikedSet] = useSearchParamState<boolean>("liked", false);
    //const [showOnlyLiked, showOnlyLikedSet] = useState(false)

    const [sortingSelected, sortingSelectedSet] = useState<SORTING_TYPE>("new")

    const debouncedSearch = useDebounce(searchContent.search, 600)
    //const debouncedTags = useDebounce(searchContent.tags, 300)

    const previousSearch = useRef<{ searchContent: SearchContentType | null, showOnlyLiked: boolean }>({
        searchContent: searchContentPhrase.length > 0 ? {
            search: searchContentPhrase, tags: []
        } : null,
        showOnlyLiked
    })
    const didMount = useRef(false);

    const { callDialog } = useDialogManager(dialogs)

    const adPositionIndex = useMemo(() => Math.floor(Math.random() * 10), [page])

    useEffect(() => {
        debugLog("WARN", "ad", adPositionIndex)
    }, [adPositionIndex])

    useEffect(() => {
        debugLog("ACTION", 'Setting phrase content', debouncedSearch)
        searchContentPhraseSet(debouncedSearch)
    }, [debouncedSearch])

    useEffect(() => {
        const isSearchTheSame = JSON.stringify(previousSearch.current) === JSON.stringify({ searchContent, showOnlyLiked })
        debugLog("WARN", 'thesame', isSearchTheSame, JSON.stringify(previousSearch.current), JSON.stringify({ searchContent, showOnlyLiked }))

        // * check if filters are empty and browser was not mounted
        if (!isSearchTheSame && !didMount.current) {
            previousSearch.current = { searchContent, showOnlyLiked }
            didMount.current = true
            return;
        }

        // * if user changed filters then set page to first
        const currentPage = !isSearchTheSame ? 1 : page

        const fetchWebsites = async ({ overridePage }: { overridePage?: number }) => {
            try {
                debugLog("DEBUG", "Fetching websites with page: ", overridePage ?? currentPage, " and search content: ", searchContent);
                const data = await actions.searchWebsites({
                    page: overridePage ?? currentPage,
                    search: debouncedSearch,
                    tags: searchContent.tags,
                    sorting: sortingSelected,
                    showOnlyLiked: showOnlyLiked
                });

                debugLog("DEBUG", "page: ", overridePage ?? currentPage, " - websites: ", data.data?.websites);
                if (data.error || !data.data) {
                    // TODO: somehow on error cancel every filter change
                    debugLog("ERROR", "Failed to fetch websites: ", data.error);
                    toast.error("Failed to get websites: " + (data.error.message ?? "Unknown error"))
                    return;
                }

                totalPagesSet(Math.ceil(data.data.total / PAGE_SIZE));
                tagsListSet((prevTags) =>
                    prevTags.map((tag) => {
                        const updatedTag = data.data.tags.find((t: WebsiteTag) => t.name === tag.name);
                        return updatedTag ? { ...tag, count: updatedTag.count } : { ...tag, count: 0 };
                    })
                );
                currentWebsitesSet(data.data.websites);

                previousSearch.current = { searchContent, showOnlyLiked }
            } catch (err) {
                debugLog("ERROR", "Exception while fetching websites: ", err);
            }
        };

        if (!isSearchTheSame && page !== 1) {
            debugLog("WARN", "search not the same setting page to 1")
            setPage(1)
            //startWebsitesLoading(() => fetchWebsites({ overridePage: 1 }))
            return
        }

        startWebsitesLoading(() => fetchWebsites({}))
    }, [page, debouncedSearch, searchContent.tags, sortingSelected, showOnlyLiked]);

    const PaginationControls = memo(() => {
        if (noEntries) return null
        return (
            <Pagination className={cn("transition-all bg-white text-text-50 dark:bg-neutral-800 dark:text-text-950 px-4 py-1 sm:w-fit w-full rounded-md", websitesLoading ? "opacity-70 pointer-events-none grayscale" : "")}>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            isDisabled={page <= 1 || websitesLoading}
                            aria-label="Previous page"
                            title="Previous page"
                        />
                    </PaginationItem>
                    {(() => {
                        const [maxItems, setMaxItems] = useState(MAX_PAGES_TO_LOAD);
                        const totalGroups = Math.ceil(totalPages / maxItems);
                        const [currentGroup, setCurrentGroup] = useState(0);

                        useEffect(() => {
                            const newGroup = Math.floor((page - 1) / maxItems);
                            setCurrentGroup(newGroup);
                        }, [page, maxItems]);

                        useEffect(() => {
                            const handleResize = () => {
                                if (window.innerWidth < 640) {
                                    setMaxItems(3);
                                } else if (window.innerWidth < 1024) {
                                    setMaxItems(5);
                                } else {
                                    setMaxItems(MAX_PAGES_TO_LOAD);
                                }
                            };
                            handleResize();
                            window.addEventListener("resize", handleResize);
                            return () => window.removeEventListener("resize", handleResize);
                        }, []);

                        const startPage = currentGroup * maxItems + 1;
                        const endPage = Math.min(startPage + maxItems - 1, totalPages);

                        const items = [];

                        if (currentGroup > 0) {
                            items.push(
                                <>
                                    {maxItems > 3 && <PaginationItem key={1}>
                                        <PaginationLink
                                            isActive={page === 1}
                                            onClick={() => setPage(1)}
                                            isDisabled={websitesLoading}
                                            className="!text-xl"
                                        >
                                            {1}
                                        </PaginationLink>
                                    </PaginationItem>}
                                    <PaginationItem key="ellipsis-prev">
                                        <PaginationLink
                                            isActive={false}
                                            onClick={() => setPage((p) => (currentGroup) * maxItems)}
                                            isDisabled={websitesLoading}
                                        >
                                            ...
                                        </PaginationLink>
                                    </PaginationItem>
                                </>
                            );
                        }

                        for (let i = startPage; i <= endPage; i++) {
                            items.push(
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={page === i}
                                        onClick={() => setPage(i)}
                                        isDisabled={websitesLoading}
                                        className="!text-xl"
                                    >
                                        {i}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        }

                        if (currentGroup < totalGroups - 1) {
                            items.push(
                                <>
                                    <PaginationItem key="ellipsis-next">
                                        <PaginationLink
                                            isActive={false}
                                            onClick={() => setPage((p) => (currentGroup + 1) * maxItems + 1)}
                                            isDisabled={websitesLoading}
                                        >
                                            ...
                                        </PaginationLink>
                                    </PaginationItem>
                                    {maxItems > 3 && <PaginationItem key={totalPages}>
                                        <PaginationLink
                                            isActive={page === totalPages}
                                            onClick={() => setPage(totalPages)}
                                            isDisabled={websitesLoading}
                                            className="!text-xl"
                                        >
                                            {totalPages}
                                        </PaginationLink>
                                    </PaginationItem>}
                                </>
                            );
                        }

                        return items;
                    })().map((item, idx) => (
                        <Fragment key={idx}>
                            {item}
                        </Fragment>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            isDisabled={page >= totalPages || websitesLoading}
                            aria-label="Next page"
                            title="Next page"
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )
    })

    return (
        <section className="grid lg:grid-cols-5 gap-6 w-full grid-cols-1 relative">
            <aside className="flex flex-col gap-2 h-fit lg:sticky lg:top-4 relative lg:w-fit w-full lg:col-span-1 col-span-4">
                <div className="bg-white dark:bg-neutral-800 dark:text-text-950 p-4 rounded-lg border-[1px] border-background-800 dark:border-neutral-700 flex flex-col space-y-5">
                    <h2 className="flex items-center gap-2 font-bold text-lg"><Search /> Search websites</h2>
                    <Button variant={"primary"} className="shadow-xl shadow-primary-500/30 !py-7 xl:!text-xl lg:!text-sm sm:!text-xl !text-base font-semibold shimmer-background xl:w-full lg:w-fit w-full" onClick={() => callDialog("ai-search")}>
                        <Sparkles className="text-accent-500 drop-shadow-lg drop-shadow-secondary-700/40 shrink" /> Try the <b className="text-accent-600 font-extrabold drop-shadow-lg drop-shadow-accent-500/40">AI Search</b>
                    </Button>
                    <div className="flex flex-col space-y-1">
                        <Input
                            type="text"
                            placeholder="Includes phrase..."
                            value={searchContent.search}
                            className=""
                            onChange={(e) =>
                                searchContentSet((p) => ({
                                    ...p,
                                    search: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <p className="flex items-center gap-1"><Tags size={18} /> Tags:</p>
                        <ToggleGroup className="ml-2 gap-3" type="multiple" variant={"outline"} disabled={websitesLoading} onValueChange={(value) => searchContentSet((p) => ({
                            ...p,
                            tags: value
                        }))} value={searchContent.tags}>
                            {
                                tagsList.map((tag, idx) => (
                                    <ToggleGroupItem value={tag.name} key={idx} tabIndex={0} className={cn("group/toggle flex items-center p-4 !flex-0 dark:text-text-950")} disabled={tag.count <= 0}>
                                        <p className="flex items-center gap-2">{tag.name} <span className="group-data-[state=on]/toggle:!text-white text-xs dark:text-secondary-700 text-secondary-500">({tag.count})</span></p>
                                    </ToggleGroupItem>
                                ))
                            }
                        </ToggleGroup>
                    </div>
                    {currentUser && <Label htmlFor="only-liked" className="cursor-pointer hover:bg-background-900 dark:hover:bg-neutral-700 transition-colors p-2 rounded-md">
                        <Checkbox id="only-liked" checked={showOnlyLiked} disabled={websitesLoading} onCheckedChange={(e: boolean) => showOnlyLikedSet(e)} /> Show only liked <Heart size={18} />
                    </Label>}
                </div>
                <Container className="bg-gradient-to-tr overflow-hidden relative z-10 to-primary-200/80 from-primary-500 border-[1px] border-primary-400 text-white grid place-items-center-safe gap-3">
                    <div>
                        <Heart className="fill-accent-500 absolute bottom-16 right-8 opacity-60 -z-10 -rotate-6" size={32} />
                        <Heart className="fill-accent-500 absolute bottom-18 -right-2 opacity-60 -z-10 rotate-12" size={42} />
                        <Heart className="fill-accent-500 absolute -bottom-6 -right-6 opacity-60 -z-10 -rotate-12" size={96} />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <h2 className="font-semibold text-xl text-center">Help <u>openshorts</u> Go Global!</h2>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-center relative z-10">
                        <a href="https://www.youtube.com/@floyare" target="_blank" title="floyare's Youtube channel"><Button variant={"secondary"} className="bg-red-600 hover:bg-red-500 !text-white"><Youtube size={20} /> Youtube Channel</Button></a>
                        <a href="https://github.com/floyare" target="_blank" title="floyare's Github profile"><Button variant={"secondary"}><Github size={20} /> Github profile</Button></a>
                        <a href="https://buymeacoffee.com/floyare" target="_blank" title="floyare's buymeacoffee.com"><Button variant={"secondary"} className="bg-amber-600 hover:bg-amber-600 !text-white"><Coffee size={20} /> Buy me a coffee!</Button></a>
                    </div>
                </Container>
            </aside>
            <Container
                className={cn("lg:min-w-3xl min-w-auto col-span-4 space-y-4 relative sm:mt-0 mt-14 dark:bg-neutral-900 dark:border-neutral-700", websitesLoading ? "opacity-70 pointer-events-none animate-pulse" : "")}
            >
                <SkewedHighlight className="absolute sm:-top-12 sm:-left-8 z-[1000] -top-20 left-[50%] sm:translate-x-0 translate-x-[-50%] text-center w-max">
                    <h2
                        className="text-xl font-semibold text-text-950 flex items-center justify-center gap-1 w-full"
                    >
                        <Compass /> Explore websites
                    </h2>
                </SkewedHighlight>
                {websitesLoading && <div className="bg-white absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 z-20 rounded-md shadow-2xl shadow-black border-[1px] border-primary-300">
                    <LoaderCircle size={48} className="text-primary-500 animate-spin" />
                </div>}
                <div className="bg-white dark:bg-neutral-800 border-background-900 border-[1px] rounded-sm md:absolute md:top-4 md:right-4 relative">
                    <Select disabled={websitesLoading || noEntries} onValueChange={(v) => sortingSelectedSet(v as any)} defaultValue={sortingSelected}>
                        <SelectTrigger size="default" className="text-lg w-full dark:text-text-950 dark:border-neutral-700" type="button" name="Sort by" aria-label="Sort by" title="Sort by">
                            <SelectValue placeholder="Sort by..." defaultValue={sortingSelected} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="new"><CalendarArrowDown /> Newest</SelectItem>
                                <SelectItem value="old"><CalendarArrowUp /> Oldest</SelectItem>
                                <SelectItem value="alphabet"><ArrowDownAZ /> Alphabetically</SelectItem>
                                <SelectItem value="likes"><Heart /> Most likes</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full flex">
                    <PaginationControls />
                </div>
                <div className="grid 2xl:grid-cols-3 xl:grid-cols-2 grid-cols-1 gap-1.5">
                    {filteredWebsites.map((website, idx) => {
                        if (adPositionIndex === idx) {
                            return (
                                <Fragment key={idx}>
                                    <AdElement />
                                    <WebsiteItem website={website} key={website.id} highlightedText={debouncedSearch.toLowerCase().split(/\s+/)} />
                                </Fragment>
                            )
                        }

                        return (
                            <WebsiteItem website={website} key={website.id} highlightedText={debouncedSearch.toLowerCase().split(/\s+/)} />
                        )
                    })}
                </div>
                <PaginationControls />

                {noEntries && (
                    <div className="flex flex-col items-center space-y-1.5 md:mb-0 mb-4">
                        <FileQuestion className="text-primary-500" size={48} />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold">No websites found!</h3>
                            <p>Try adjusting your search preferences</p>
                        </div>
                    </div>
                )}
            </Container>
        </section>
    );
}

export default WebsiteBrowser;