import type { SearchContentType, WebsiteTag, WebsiteType } from "@/types/website";
import WebsiteItem from "./websites/website-item";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { debugLog } from "@/lib/log";
import { actions } from "astro:actions";
import { cn } from "@/lib/utils";
import useDebounce from "@/hooks/useDebounce";
import Container from "./container";
import { ArrowDownAZ, CalendarArrowDown, CalendarArrowUp, ChevronDown, Coffee, Compass, FileQuestion, Filter, Github, Heart, LoaderCircle, Search, SortAsc, Sparkles, SquareChevronRight, Tags, TextCursorInput, Youtube } from "lucide-react";
import { Input } from "./ui/input";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
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

import InfiniteScroll from "react-infinite-scroll-component";
import useIsMobile from "@/hooks/useIsMobile";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import FooterContent from "./footer/footer-content";
import { useAnalytics } from "shibuitracker-client/client";

type BrowserProps = {
    //entryWebsites: WebsiteType[],
    //totalWebsites: number,
    //tags: WebsiteTag[],
    currentUser?: User
}

const WebsiteBrowser = ({ /*entryWebsites, totalWebsites, tags,*/ currentUser }: BrowserProps) => {
    const [page, setPage] = useState(1);

    const fetcher = () =>
        actions.searchWebsites({
            sorting: "new"
        }).then(({ data, error }) => {
            if (error) throw error;
            return data;
        });

    const { data: entryFetchData, error: entryFetchError, isLoading, isValidating } = useSWR("websites", async () => fetcher(), {
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
    const noEntries = useMemo(() => tagsList.every((p) => p.count === 0) && !isLoading, [tagsList])

    useEffect(() => {
        currentWebsitesSet(entryWebsites)
        totalPagesSet(Math.ceil(totalWebsites / PAGE_SIZE))
        tagsListSet(tags)
    }, [entryFetchData])

    const [searchContentPhrase, searchContentPhraseSet] = useSearchParamState<string>("search", "");

    const [websitesLoading, startWebsitesLoading] = useTransition()
    const { sendEvent } = useAnalytics()

    const [searchContent, searchContentSet] = useState<SearchContentType>({
        search: searchContentPhrase,
        tags: []
    })

    const [showOnlyLiked, showOnlyLikedSet] = useSearchParamState<boolean>("liked", false);
    //const [showOnlyLiked, showOnlyLikedSet] = useState(false)

    const [sortingSelected, sortingSelectedSet] = useState<SORTING_TYPE>("new")

    const debouncedSearch = useDebounce(searchContent.search, 600)
    //const debouncedTags = useDebounce(searchContent.tags, 300)

    const previousSearch = useRef<{
        searchContent: SearchContentType | null,
        showOnlyLiked: boolean
    }>({
        searchContent: searchContentPhrase.length > 0 ? {
            search: searchContentPhrase, tags: []
        } : null,
        showOnlyLiked
    })
    const didMount = useRef(false);

    const previousFilters = useRef<{
        tags: string[],
        showOnlyLiked: boolean,
        sorting: SORTING_TYPE,
        search: string
    }>({
        tags: [],
        showOnlyLiked: false,
        sorting: "new",
        search: ""
    })

    const { callDialog } = useDialogManager(dialogs)
    const { isMobile, isLoading: isMobleLoading } = useIsMobile()

    const adPositionIndex = useMemo(() => Math.floor(Math.random() * 10), [page])

    useEffect(() => {
        debugLog("ACTION", 'Setting phrase content', debouncedSearch)
        searchContentPhraseSet(debouncedSearch)
    }, [debouncedSearch])

    useEffect(() => {
        const isSearchTheSame = JSON.stringify(previousSearch.current) === JSON.stringify({ searchContent, showOnlyLiked })
        debugLog("WARN", 'thesame', isSearchTheSame, JSON.stringify(previousSearch.current), JSON.stringify({ searchContent, showOnlyLiked }))

        const filtersChanged = JSON.stringify(previousFilters.current) !== JSON.stringify({ tags: searchContent.tags, showOnlyLiked, sorting: sortingSelected, search: debouncedSearch })

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

                    await sendEvent("error", {
                        message: "Failed to fetch websites",
                        details: {
                            error: data.error,
                            searchContent,
                            currentPage,
                            overridePage,
                            debouncedSearch,
                            sortingSelected,
                            showOnlyLiked,
                            isMobile,
                            isSearchTheSame,
                        },
                        caller: "WebsiteBrowser fetchWebsites()"
                    })

                    return;
                }

                totalPagesSet(Math.ceil(data.data.total / PAGE_SIZE));
                tagsListSet((prevTags) =>
                    prevTags.map((tag) => {
                        const updatedTag = data.data.tags.find((t: WebsiteTag) => t.name === tag.name);
                        return updatedTag ? { ...tag, count: updatedTag.count } : { ...tag, count: 0 };
                    })
                );

                if (filtersChanged) currentWebsitesSet(data.data.websites); else currentWebsitesSet((p) => {
                    const newWebsites = [...p];
                    data.data?.websites.forEach((website) => {
                        if (!newWebsites.find((w) => w.id === website.id)) {
                            newWebsites.push(website);
                        }
                    });
                    return newWebsites;
                });

                previousSearch.current = { searchContent, showOnlyLiked }
                previousFilters.current = { tags: searchContent.tags, showOnlyLiked, sorting: sortingSelected, search: debouncedSearch }
            } catch (err) {
                debugLog("ERROR", "Exception while fetching websites: ", err);
            }
        };

        if ((!isSearchTheSame || filtersChanged) && page !== 1) {
            debugLog("WARN", "search not the same setting page to 1")
            setPage(1)
            //startWebsitesLoading(() => fetchWebsites({ overridePage: 1 }))
            return
        }

        startWebsitesLoading(() => {
            fetchWebsites({ overridePage: filtersChanged ? 1 : undefined }).then(() => {
                sendEvent("custom_event", { source: "Basic search invocation" })
            })
        })
    }, [page, debouncedSearch, searchContent.tags, sortingSelected, showOnlyLiked]);

    useEffect(() => {
        if (typeof window === "undefined") return

        const searchParams = window.location.search
        if (searchParams.includes("show_ai_dialog")) {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
            callDialog("ai-search")
        }
    }, [])

    return (
        <section className="grid 3xl:grid-cols-5 2xl:grid-cols-4 lg:grid-cols-3 lg:gap-2 gap-0 w-full grid-cols-1 relative">
            {(entryFetchError || (entryFetchData?.tags ? entryFetchData?.tags.length <= 0 && !isLoading : false)) && <div className="bg-red-600 text-white px-4 py-2 fixed top-0 left-0 w-full z-10">
                <p className="text-center">
                    Failed while connecting to the database, try again
                    later!
                </p>
            </div>}
            <aside className="flex flex-col gap-2 h-fit sticky lg:top-38 top-24 lg:bottom-12 lg:z-50 z-90 lg:w-fit w-full 3xl:col-span-1 2xl:col-span-1 lg:col-span-1 col-span-4" >
                <Container className="dark:bg-neutral-900 dark:text-text-950 backdrop-blur-2xl p-4 rounded-lg border-[1px] border-background-800 dark:border-neutral-700 flex lg:flex-col lg:gap-6 gap-3 flex-wrap flex-row space-y-5">
                    {/* <h2 className="flex items-center gap-2 font-bold text-lg">Browse websites</h2> */}
                    <Button variant={"primary"} className="shadow-xl shadow-primary-500/30 !py-7 lg:!text-2xl sm:!text-3xl sm:!py-8 lg:py-2 !text-base font-semibold shimmer-background lg:!w-full w-fit grow mb-0" onClick={async () => {
                        sendEvent("custom_event", { source: "AI Search - Modal open" })
                        callDialog("ai-search")
                    }}>
                        <Sparkles className="text-accent-500 drop-shadow-lg drop-shadow-secondary-700/40 shrink" /> Try the <b className="text-accent-600 font-extrabold drop-shadow-lg drop-shadow-accent-500/40">AI Search</b>
                    </Button>

                    {isMobile && (
                        <Drawer direction="left">
                            <DrawerTrigger asChild>
                                <Button variant={"outline"} className="!py-7 !m-0 lg:!text-2xl sm:!text-3xl sm:!py-8 lg:py-2 lg:!w-full w-fit grow"><Filter /> Filters</Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader>
                                    <DrawerTitle className="flex items-center gap-3"><Filter /> Filters</DrawerTitle>
                                    <DrawerDescription>Adjust your filters to result with more specific search</DrawerDescription>
                                </DrawerHeader>
                                <div className="flex flex-col gap-6 px-3 pt-6">
                                    <label className="space-y-2">
                                        <p className="flex items-center gap-1"><Search /> Search input</p>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                type="text"
                                                placeholder="Search by phrase..."
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
                                    </label>

                                    <label className="space-y-2">
                                        <p className="flex items-center gap-1"><SortAsc /> Sorting</p>
                                        <div className="flex items-center gap-3">
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
                                    </label>


                                    <label className="space-y-2">
                                        <p className="flex items-center gap-1"><Tags /> Tags</p>
                                        <ToggleGroup className="ml-2 gap-3 max-h-[35vh] overflow-hidden relative" type="multiple" variant={"outline"} disabled={websitesLoading} onValueChange={(value) => searchContentSet((p) => ({
                                            ...p,
                                            tags: value
                                        }))} value={searchContent.tags}>
                                            {
                                                isLoading ? (
                                                    [...Array(17).keys()].map((_, idx) => (
                                                        <ToggleGroupItem value={idx.toString()} style={{ minWidth: `${Math.round((Math.random() + 0.6) * idx) * 7}px !important` }} key={idx} tabIndex={0} className={"flex items-center p-4 !flex-0 dark:text-text-950 bg-gray-200 dark:bg-neutral-700 !animate-pulse pointer-events-none"}>

                                                        </ToggleGroupItem>
                                                    ))
                                                ) : (
                                                    tagsList.map((tag, idx) => (
                                                        <ToggleGroupItem value={tag.name} key={idx} tabIndex={0} className={cn("group/toggle border-1 border-primary-800 flex items-center p-4 !flex-0 dark:text-text-950")} disabled={tag.count <= 0}>
                                                            <p className="flex items-center gap-2">{tag.name} <span className="group-data-[state=on]/toggle:!text-white text-xs dark:text-secondary-700 text-secondary-500">({tag.count})</span></p>
                                                        </ToggleGroupItem>
                                                    ))
                                                )
                                            }
                                        </ToggleGroup>
                                    </label>
                                </div>
                            </DrawerContent>
                        </Drawer>
                    )}
                    {!isMobile && <div className="flex flex-col space-y-1">
                        <p className="flex items-center gap-1"><Tags size={18} /> Tags:</p>
                        <ToggleGroup className="ml-2 gap-3 max-h-[41vh] overflow-hidden relative" type="multiple" variant={"outline"} disabled={websitesLoading} onValueChange={(value) => searchContentSet((p) => ({
                            ...p,
                            tags: value
                        }))} value={searchContent.tags}>
                            {
                                isLoading ? (
                                    [...Array(17).keys()].map((_, idx) => (
                                        <ToggleGroupItem value={idx.toString()} style={{ minWidth: `${Math.round((Math.random() + 0.6) * idx) * 7}px !important` }} key={idx} tabIndex={0} className={"flex items-center p-4 !flex-0 dark:text-text-950 bg-gray-200 dark:bg-neutral-700 !animate-pulse pointer-events-none"}>

                                        </ToggleGroupItem>
                                    ))
                                ) : (
                                    tagsList.map((tag, idx) => (
                                        <ToggleGroupItem value={tag.name} key={idx} tabIndex={0} className={cn("group/toggle border-1 border-primary-800 flex items-center p-4 !flex-0 dark:text-text-950")} disabled={tag.count <= 0}>
                                            <p className="flex items-center gap-2">{tag.name} <span className="group-data-[state=on]/toggle:!text-white text-xs dark:text-secondary-700 text-secondary-500">({tag.count})</span></p>
                                        </ToggleGroupItem>
                                    ))
                                )
                            }
                        </ToggleGroup>
                    </div>}
                    {currentUser && !isMobile && <Label htmlFor="only-liked" className="cursor-pointer hover:bg-background-900 dark:hover:bg-neutral-700 transition-colors p-2 rounded-md">
                        <Checkbox id="only-liked" checked={showOnlyLiked} disabled={websitesLoading} onCheckedChange={(e: boolean) => showOnlyLikedSet(e)} /> Show only liked <Heart size={18} />
                    </Label>}
                </Container>
                {!isMobile && <Container className="bg-primary-500 overflow-hidden relative z-10 border-[1px] border-primary-400 text-white grid place-items-center-safe gap-3">
                    <div className="flex flex-col items-center justify-center text-center">
                        <h2 className="font-semibold text-xl tracking-tight">Help <b onDoubleClick={() => sendEvent("error", {
                            message: "Test debug error",
                            details: {
                                currentUser
                            },
                            caller: "Easter egg!"
                        })}>openshorts</b> go global!</h2>
                        <p className="">Share the website with your friends and followers to help us grow!</p>
                    </div>
                    <div className="flex items-center flex-wrap gap-2 justify-center relative z-10">
                        <a href="https://www.youtube.com/@floyare" target="_blank" title="floyare's Youtube channel"><Button variant={"secondary"} className="bg-red-600 hover:bg-red-500 !text-white flex flex-col !gap-0 !h-fit"><Youtube size={20} /> Youtube</Button></a>
                        <a href="https://github.com/floyare" target="_blank" title="floyare's Github profile"><Button variant={"secondary"} className="flex flex-col !gap-0 !h-fit"><Github size={20} /> Github</Button></a>
                        <a href="https://buymeacoffee.com/floyare" target="_blank" title="floyare's buymeacoffee.com"><Button variant={"secondary"} className="bg-amber-600 hover:bg-amber-500 !text-white flex flex-col !gap-0 !h-fit"><Coffee size={20} /> Buy me a coffee!</Button></a>
                    </div>
                </Container>}
                <footer className="fixed lg:relative lg:left-0 lg:translate-x-0 lg:bg-transparent lg:border-transparent bottom-0 left-[50%] translate-x-[-50%] w-full lg:w-auto lg:!mx-0 !mx-2 bg-background-900/30 py-4 border-1 border-background-800 lg:backdrop-blur-none backdrop-blur-lg rounded-md mt-2 lg:mt-0">
                    <FooterContent />
                </footer>
            </aside>
            <div className="3xl:min-w-3xl 2xl:min-w-3xl xl:min-w-2xl lg:min-w-lg 3xl:col-span-4 2xl:col-span-3 lg:col-span-2 min-w-auto space-y-2 relative">
                {!isMobile && <Container className="dark:bg-neutral-900 dark:border-neutral-700 sticky lg:top-38 top-4 z-10 flex items-center justify-between backdrop-blur-3xl">
                    <div className="flex items-center gap-3">
                        <Search />
                        <Input
                            type="text"
                            placeholder="Search by phrase..."
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
                    <div className="bg-white dark:bg-neutral-900 border-background-800 border-[1px] rounded-sm w-fit ml-auto relative">
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
                </Container>}
                <Container
                    className={cn("dark:bg-neutral-900 dark:border-neutral-700 lg:mt-0 mt-2"/*, websitesLoading ? "opacity-70 pointer-events-none animate-pulse" : ""*/)}
                >
                    <InfiniteScroll
                        // TODO: add if loading is infinite then retry
                        dataLength={filteredWebsites.length}
                        next={() => {
                            setPage((p) => p + 1)
                        }}
                        hasMore={totalWebsites > filteredWebsites.length}
                        loader={<div className="w-full text-center py-4 flex items-center justify-center">
                            <p className="flex items-center gap-2"><LoaderCircle className="animate-spin" /> Loading...</p>
                        </div>}
                        endMessage={<p className="text-center my-4 text-text-200 dark:text-text-900">Wow! You've reached the end. Good Job! 😊</p>}
                        scrollThreshold={0.95}
                        className="!overflow-visible"
                    >
                        <div className="grid 3xl:grid-cols-3 2xl:grid-cols-2 grid-cols-1 gap-1.5">
                            {
                                isLoading ? (
                                    [...Array(PAGE_SIZE).keys()].map((_, idx) => (
                                        <div className="w-full h-72 bg-gray-200 dark:bg-neutral-700 !animate-pulse rounded-md pointer-events-none" key={idx}>

                                        </div>
                                    ))
                                ) : (
                                    filteredWebsites.map((website, idx) => {
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
                                    })
                                )
                            }
                        </div>
                    </InfiniteScroll>

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
            </div>
        </section>
    );
}

export default WebsiteBrowser;