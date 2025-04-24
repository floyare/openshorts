import type { WebsiteType } from "@/types/website";
import WebsiteItem from "./websites/website-item";
import { useMemo, useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { PAGE_SIZE } from "@/lib/websites.core";

type BrowserProps = {
    entryWebsites: WebsiteType[],
    totalWebsites: number
}

const WebsiteBrowser = ({ entryWebsites, totalWebsites }: BrowserProps) => {
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(totalWebsites / PAGE_SIZE);

    const [currentWebsites, currentWebsitesSet] = useState<WebsiteType[]>(entryWebsites);
    const filteredWebsites = currentWebsites.filter((website) => true)

    const pagedWebsites = useMemo(() => filteredWebsites.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [page, totalPages]);

    return (
        <section>
            <p>total: {totalWebsites}</p>
            {pagedWebsites.map((website) => (
                <WebsiteItem website={website} key={website.id} />
            ))}
            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            isDisabled={page === 1}
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
                            isDisabled={page === totalPages}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </section>
    );
}

export default WebsiteBrowser;