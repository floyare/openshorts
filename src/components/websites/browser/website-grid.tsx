import { Fragment } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { LoaderCircle, FileQuestion } from "lucide-react";
import WebsiteItem from "../website-item";
import AdElement from "../../ads/ad-element";
import type { WebsiteType } from "@/types/website";
import { PAGE_SIZE } from "@/helpers/websites.helper";

interface WebsiteGridProps {
    websites: WebsiteType[];
    page: number;
    setPage: (updater: (p: number) => number) => void;
    totalPages: number;
    isLoading: boolean;
    debouncedSearch: string;
    noEntries: boolean;
}

export const WebsiteGrid = ({
    websites,
    page,
    setPage,
    totalPages,
    isLoading,
    debouncedSearch,
    noEntries
}: WebsiteGridProps) => {
    return (
        <>
            <InfiniteScroll
                dataLength={websites.length}
                next={() => {
                    setPage((p) => p + 1)
                }}
                hasMore={totalPages >= page}
                loader={<div className="w-full text-center py-4 flex items-center justify-center">
                    <p className="flex items-center gap-2"><LoaderCircle className="animate-spin" /> Loading...</p>
                </div>}
                endMessage={websites.length > 0 ? <p className="text-center my-4 text-text-200 dark:text-text-900">Wow! You've reached the end. Good Job! 😊</p> : null}
                scrollThreshold={0.95}
                className="!overflow-visible"
            >
                <div className="grid 3xl:grid-cols-3 2xl:grid-cols-2 grid-cols-1 gap-1.5">
                    {
                        isLoading ? (
                            [...Array(PAGE_SIZE).keys()].map((_, idx) => (
                                <div className="w-full h-72 bg-gray-200 dark:bg-neutral-700 !animate-pulse corner-squircle rounded-md pointer-events-none" key={idx} />
                            ))
                        ) : (
                            websites.map((website, idx) => {
                                const shouldShowAd = (idx + 1) % 10 === 0;
                                return (
                                    <Fragment key={website.id}>
                                        <WebsiteItem website={website} highlightedText={debouncedSearch.toLowerCase().split(/\s+/)} />
                                        {shouldShowAd && <AdElement />}
                                    </Fragment>
                                );
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
        </>
    );
};
