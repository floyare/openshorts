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
import { FileQuestion, Search, Tags } from "lucide-react";
import { Input } from "./ui/input";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

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
    const noEntries = useMemo(() => tagsList.length <= 0, [tagsList])

    const [websitesLoading, startWebsitesLoading] = useTransition()

    const [searchContent, searchContentSet] = useState<SearchContentType>({
        search: "",
        tags: []
    })

    const debouncedSearch = useDebounce(searchContent.search, 600)
    const debouncedTags = useDebounce(searchContent.tags, 300)

    useEffect(() => {
        const fetchWebsites = async () => {
            try {
                debugLog("DEBUG", "Fetching websites with page: ", page, " and search content: ", searchContent);
                const data = await actions.searchWebsites({ page, search: debouncedSearch, tags: debouncedTags });
                debugLog("DEBUG", "page: ", page, " - websites: ", data.data?.websites);
                if (data.error || !data.data) {
                    debugLog("ERROR", "Failed to fetch websites: ", data.error);
                    return;
                }

                //await new Promise((resolve) => setTimeout(resolve, 5000));

                totalPagesSet(Math.floor(data.data.total / PAGE_SIZE));
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
    }, [page, debouncedSearch, debouncedTags]);

    return (
        <section className="flex items-start justify-between gap-6 w-full">
            <aside className="bg-neutral-50 p-4 rounded-lg border-[1px] border-background-800 flex flex-col space-y-3 !w-max">
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
                                <ToggleGroupItem value={tag.name} key={tag.name} className={cn("flex items-center p-4")} disabled={tag.count <= 0}>
                                    <p className="flex items-center gap-2">{tag.name} <span className="text-xs text-secondary-800">({tag.count})</span></p>
                                </ToggleGroupItem>
                            ))
                        }
                    </ToggleGroup>
                </div>
            </aside>
            <Container
                className={cn("min-w-3xl flex items-center justify-center gap-4 flex-wrap", websitesLoading ? "opacity-70 pointer-events-none animate-pulse" : "")}
            >
                {filteredWebsites.map((website) => (
                    <WebsiteItem website={website} key={website.id} />
                ))}


                {!noEntries ? <Pagination className={cn("transition-all", websitesLoading ? "opacity-70 pointer-events-none grayscale" : "")}>
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
                </Pagination> : (
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