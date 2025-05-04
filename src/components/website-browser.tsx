import type { SearchContentType, WebsiteTag, WebsiteType } from "@/types/website";
import WebsiteItem from "./websites/website-item";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { PAGE_SIZE } from "@/lib/websites.core";
import { debugLog } from "@/lib/log";
import { actions } from "astro:actions";
import { cn } from "@/lib/utils";
import useDebounce from "@/hooks/useDebounce";
import Container from "./container";
import { ArrowDown01, ArrowDownAZ, CalendarArrowDown, CalendarArrowUp, FileQuestion, Heart, Search, SortAsc, SortDesc, Tags } from "lucide-react";
import { Input } from "./ui/input";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { memo } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { SORTING_TYPE } from "@/helpers/websites.helper";

type BrowserProps = {
    entryWebsites: WebsiteType[],
    totalWebsites: number,
    tags: WebsiteTag[]
}

const WebsiteBrowser = ({ entryWebsites, totalWebsites, tags }: BrowserProps) => {
    const [page, setPage] = useState(1);

    const [currentWebsites, currentWebsitesSet] = useState<WebsiteType[]>(entryWebsites);
    const filteredWebsites = currentWebsites.filter((website) => true)

    const [totalPages, totalPagesSet] = useState(Math.ceil(totalWebsites / PAGE_SIZE))
    const [tagsList, tagsListSet] = useState(tags)
    const noEntries = useMemo(() => tagsList.every((p) => p.count === 0), [tagsList])

    const [websitesLoading, startWebsitesLoading] = useTransition()

    const [searchContent, searchContentSet] = useState<SearchContentType>({
        search: "",
        tags: []
    })

    const [sortingSelected, sortingSelectedSet] = useState<SORTING_TYPE>("new")

    const debouncedSearch = useDebounce(searchContent.search, 600)
    //const debouncedTags = useDebounce(searchContent.tags, 300)

    // BUG: searchWebsites() uruchamia sie po zaladowaniu komponentu mimo, że juz wczesniej serwer go uruchamia i wstawia dane
    useEffect(() => {
        const fetchWebsites = async () => {
            try {
                debugLog("DEBUG", "Fetching websites with page: ", page, " and search content: ", searchContent);
                const data = await actions.searchWebsites({ page, search: debouncedSearch, tags: searchContent.tags, sorting: sortingSelected });
                debugLog("DEBUG", "page: ", page, " - websites: ", data.data?.websites);
                if (data.error || !data.data) {
                    debugLog("ERROR", "Failed to fetch websites: ", data.error);
                    return;
                }

                //await new Promise((resolve) => setTimeout(resolve, 5000));

                totalPagesSet(Math.ceil(data.data.total / PAGE_SIZE));
                tagsListSet((prevTags) =>
                    prevTags.map((tag) => {
                        const updatedTag = data.data.tags.find((t: WebsiteTag) => t.name === tag.name);
                        return updatedTag ? { ...tag, count: updatedTag.count } : { ...tag, count: 0 };
                    })
                );
                currentWebsitesSet(data.data.websites);
            } catch (err) {
                debugLog("ERROR", "Exception while fetching websites: ", err);
            }
        };

        startWebsitesLoading(() => fetchWebsites())
    }, [page, debouncedSearch, searchContent.tags, sortingSelected]);

    const PaginationControls = memo(() => {
        if (noEntries) return null
        return (
            <Pagination className={cn("transition-all bg-white text-text-50 px-4 py-1 w-fit rounded-md", websitesLoading ? "opacity-70 pointer-events-none grayscale" : "")}>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            isDisabled={page <= 1 || websitesLoading}
                        />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i + 1}>
                            <PaginationLink
                                isActive={page === i + 1}
                                onClick={() => setPage(i + 1)}
                                isDisabled={websitesLoading}
                            >
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            isDisabled={page >= totalPages || websitesLoading}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )
    })

    return (
        <section className="grid lg:grid-cols-5 gap-6 w-full grid-cols-1">
            <aside className="bg-neutral-50 p-4 rounded-lg border-[1px] border-background-800 flex flex-col space-y-3 col-span-1 h-fit lg:sticky lg:top-4 relative lg:w-fit w-full">
                <h3 className="flex items-center gap-2 font-bold text-lg"><Search /> Search websites</h3>
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
                    <ToggleGroup className="ml-2 gap-3" type="multiple" variant={"outline"} onValueChange={(value) => searchContentSet((p) => ({
                        ...p,
                        tags: value
                    }))} value={searchContent.tags}>
                        {
                            tagsList.map((tag) => (
                                <ToggleGroupItem value={tag.name} key={tag.name} className={cn("flex items-center p-4 !flex-0")} disabled={tag.count <= 0}>
                                    <p className="flex items-center gap-2">{tag.name} <span className="text-xs text-secondary-800">({tag.count})</span></p>
                                </ToggleGroupItem>
                            ))
                        }
                    </ToggleGroup>
                </div>
            </aside>
            <Container
                className={cn("min-w-3xl col-span-4 space-y-4 relative", websitesLoading ? "opacity-70 pointer-events-none animate-pulse" : "")}
            >
                <div className="bg-white border-background-900 border-[1px] rounded-sm absolute top-4 right-4">
                    <Select disabled={websitesLoading || noEntries} onValueChange={(v) => sortingSelectedSet(v as any)} defaultValue={sortingSelected}>
                        <SelectTrigger size="default" className="text-lg">
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
                <div className="grid 2xl:grid-cols-3 xl:grid-cols-2 grid-cols-1 gap-4">
                    {filteredWebsites.map((website) => (
                        <WebsiteItem website={website} key={website.id} />
                    ))}
                </div>
                <PaginationControls />

                {noEntries && (
                    <div className="flex flex-col items-center space-y-1.5">
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