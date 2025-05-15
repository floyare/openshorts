
import { actions } from "astro:actions";
import useSWR from "swr";
import { Button } from "../ui/button";
import { Edit, Heart } from "lucide-react";
import { memo, useState } from "react";
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
        <p className="text-text-500">
            {
                `${name} has not uploaded any files yet.`
            }
        </p>
    );

    const MAX_UPLOADS_VIEW = 6
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
                        />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i + 1}>
                            <PaginationLink
                                isActive={page === i + 1}
                                onClick={() => setPage(i + 1)}
                                isDisabled={false}
                                className="!text-xl"
                            >
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            isDisabled={page >= totalPages}
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
                                <p className="flex items-center gap-1"><Heart size={14} className="text-red-400" /> {website.likes ?? 0}</p>
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