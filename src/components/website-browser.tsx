import type { WebsiteType } from "@/types/website";
import WebsiteItem from "./websites/website-item";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { PAGE_SIZE } from "@/lib/websites.core";
import { debugLog } from "@/lib/log";
import { actions } from "astro:actions";
import { cn } from "@/lib/utils";

type BrowserProps = {
    entryWebsites: WebsiteType[],
    totalWebsites: number
}

const WebsiteBrowser = ({ entryWebsites, totalWebsites }: BrowserProps) => {
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(totalWebsites / PAGE_SIZE);

    const [currentWebsites, currentWebsitesSet] = useState<WebsiteType[]>(entryWebsites);
    const filteredWebsites = currentWebsites.filter((website) => true)

    const [websitesLoading, startWebsitesLoading] = useTransition()

    useEffect(() => {
        const fetchWebsites = async () => {
            try {
                const data = await actions.searchWebsites({ page });
                debugLog("DEBUG", "page: ", page, " - websites: ", data.data?.websites);
                if (data.error || !data.data) {
                    debugLog("ERROR", "Failed to fetch websites: ", data.error);
                    return;
                }
                currentWebsitesSet(data.data.websites);
            } catch (err) {
                debugLog("ERROR", "Exception while fetching websites: ", err);
            }
        };

        startWebsitesLoading(() => fetchWebsites())
    }, [page]);

    return (
        <section>
            <p>total: {totalWebsites}</p>
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