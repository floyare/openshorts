import type { SearchContentType, WebsiteTag, WebsiteType } from "@/types/website";
import WebsiteItem from "./websites/website-item";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { PAGE_SIZE } from "@/lib/websites.core";
import { debugLog } from "@/lib/log";
import { actions } from "astro:actions";
import { cn } from "@/lib/utils";

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

    const [websitesLoading, startWebsitesLoading] = useTransition()

    const [searchContent, searchContentSet] = useState<SearchContentType>({
        search: "",
        tags: []
    })

    useEffect(() => {
        const fetchWebsites = async () => {
            try {
                debugLog("DEBUG", "Fetching websites with page: ", page, " and search content: ", searchContent);
                const data = await actions.searchWebsites({ page, search: searchContent.search, tags: searchContent.tags });
                debugLog("DEBUG", "page: ", page, " - websites: ", data.data?.websites);
                if (data.error || !data.data) {
                    debugLog("ERROR", "Failed to fetch websites: ", data.error);
                    return;
                }

                totalPagesSet(Math.floor(data.data.total / PAGE_SIZE));
                currentWebsitesSet(data.data.websites);
            } catch (err) {
                debugLog("ERROR", "Exception while fetching websites: ", err);
            }
        };

        startWebsitesLoading(() => fetchWebsites())
    }, [page, searchContent]);

    return (
        <section>
            <p>total: {totalPages}</p>
            <input
                type="text"
                placeholder="Search..."
                className="bg-purple-300 mb-4"
                value={searchContent.search}
                onChange={(e) =>
                    searchContentSet((p) => ({
                        ...p,
                        search: e.target.value,
                    }))
                }
            />
            <ul>
                {
                    tags.map((tag) => (
                        <li>
                            <input type="checkbox" id={tag.name} onChange={(e) => {
                                if (e.target.checked) {
                                    searchContentSet((p) => ({
                                        ...p,
                                        tags: [...p.tags, tag.name],
                                    }))
                                } else {
                                    searchContentSet((p) => ({
                                        ...p,
                                        tags: p.tags.filter((t) => t !== tag.name),
                                    }))
                                }
                            }} />
                            <label htmlFor={tag.name} className="ml-2">{tag.name}</label>
                        </li>
                    ))
                }
            </ul>
            {filteredWebsites.map((website) => (
                <WebsiteItem website={website} key={website.id} />
            ))}
            <Pagination className={cn("transition-all", websitesLoading ? "opacity-70 pointer-events-none grayscale" : "")}>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            isDisabled={page === 1 || websitesLoading}
                        />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i + 1}>
                            <PaginationLink
                                isActive={page === i + 1}
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            isDisabled={page === totalPages || websitesLoading}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </section>
    );
}

export default WebsiteBrowser;