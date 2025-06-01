
import { actions } from "astro:actions";
import useSWR from "swr";
import { Button } from "../ui/button";
import { Edit, Heart } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { cn } from "@/lib/utils";
import { useDialogManager } from "easy-dialogs"
import { dialogs } from "@/lib/dialogs";

const MyUploads = ({ name }: { name: string }) => {
    const fetcher = () =>
        actions.getMyUploads().then(({ data, error }) => {
            if (error) throw error;
            return data;
        });

    const [page, setPage] = useState(1)
    const { callDialog } = useDialogManager(dialogs)

    const { data: uploads, error, isLoading, mutate } = useSWR("my-uploads-fetch", () => fetcher(), {
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        refreshWhenOffline: false,
        refreshWhenHidden: false,
        refreshInterval: 0
    });

    if (error) {
        return (
            <p className="text-red-500 max-w-3xs break-words text-balance">
                Failed to obtain uploads: {error.message}
            </p>
        );
    }

    if (!uploads?.length && !isLoading) return (
        <p className="text-text-500 max-w-sm break-words text-balance">
            {
                `You haven't uploaded any websites yet.`
            }
        </p>
    );

    const MAX_UPLOADS_VIEW = 4
    const totalPages = uploads?.length ? Math.ceil(uploads?.length / MAX_UPLOADS_VIEW) : 0
    const slicedUploads = uploads?.slice((page * MAX_UPLOADS_VIEW) - MAX_UPLOADS_VIEW, page * MAX_UPLOADS_VIEW)

    const PaginationControls = memo(() => {
        return (
            <Pagination className={cn("transition-all bg-white text-text-50 px-4 py-1 sm:w-fit w-full rounded-md")}>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            isDisabled={page <= 1}
                            aria-label="Previous page"
                            title="Previous page"
                        />
                    </PaginationItem>
                    {(() => {
                        const MAX_PAGES_TO_LOAD = 5;
                        const totalGroups = Math.ceil(totalPages / MAX_PAGES_TO_LOAD);
                        const [currentGroup, setCurrentGroup] = useState(0);

                        useEffect(() => {
                            const newGroup = Math.floor((page - 1) / MAX_PAGES_TO_LOAD);
                            setCurrentGroup(newGroup);
                        }, [page, MAX_PAGES_TO_LOAD]);

                        const startPage = currentGroup * MAX_PAGES_TO_LOAD + 1;
                        const endPage = Math.min(startPage + MAX_PAGES_TO_LOAD - 1, totalPages);

                        const items = [];

                        if (currentGroup > 0) {
                            items.push(
                                <>
                                    <PaginationItem key={1}>
                                        <PaginationLink
                                            isActive={page === 1}
                                            onClick={() => setPage(1)}
                                            className="!text-xl"
                                            isDisabled={false}
                                        >
                                            {1}
                                        </PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem key="ellipsis-prev">
                                        <PaginationLink
                                            isActive={false}
                                            onClick={() => setPage((p) => (currentGroup) * MAX_PAGES_TO_LOAD)}
                                            isDisabled={false}
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
                                        isDisabled={false}
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
                                            onClick={() => setPage((p) => (currentGroup + 1) * MAX_PAGES_TO_LOAD + 1)}
                                            isDisabled={false}
                                        >
                                            ...
                                        </PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem key={totalPages}>
                                        <PaginationLink
                                            isActive={page === totalPages}
                                            onClick={() => setPage(totalPages)}
                                            className="!text-xl"
                                            isDisabled={false}
                                        >
                                            {totalPages}
                                        </PaginationLink>
                                    </PaginationItem>
                                </>
                            );
                        }

                        return items;
                    })()}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            isDisabled={page >= totalPages}
                            aria-label="Next page"
                            title="Next page"
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )
    })

    return (
        <ul className="flex flex-col gap-2">
            {isLoading ? <>
                <div className="w-xs h-16 bg-gray-400 animate-pulse" />
                <div className="w-xs h-16 bg-gray-400 animate-pulse" />
                <div className="w-xs h-16 bg-gray-400 animate-pulse" />
            </> :
                <>
                    {slicedUploads?.map((website, idx) => (
                        <li className="hover:!bg-primary-950 nth-[even]:bg-primary-950/60 px-4 py-1.5 rounded-md flex items-center gap-2 w-full">
                            <div className="flex flex-col gap-0">
                                <p className="inline-block truncate max-w-3xs">{website.url}</p>
                                <p className="flex items-center gap-1"><Heart size={14} className="text-primary-400 fill-primary-500" /> {website.likes ?? 0}</p>
                            </div>
                            <Button variant={"secondary"} className="ml-auto" onClick={async () => {
                                const result = await callDialog("edit-website", { url: website.url })
                                if (result) {
                                    mutate((up) => up?.filter((p) => p.id !== website.url))
                                }
                            }}><Edit /></Button>
                        </li>
                    ))}
                    <PaginationControls />
                </>
            }
        </ul>
    );
}

export default MyUploads;