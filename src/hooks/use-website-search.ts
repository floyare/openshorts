import { useState, useEffect, useMemo, useRef, useTransition } from "react";
import { actions } from "astro:actions";
import useSWR from "swr";
import useDebounce from "@/hooks/use-debounce";
import { useSearchParamState } from "@/hooks/use-search-param-state";
import { toast } from "sonner";
import { debugLog } from "@/lib/log";
import { PAGE_SIZE } from "@/helpers/websites.helper";
import type { WebsiteType, SearchContentType, WebsiteTag } from "@/types/website";
import type { SORTING_TYPE } from "@/helpers/websites.helper";
import { useAnalytics } from "shibuitracker-client/client";
import useIsMobile from "@/hooks/use-is-mobile";

export const useWebsiteSearch = () => {
    const [page, setPage] = useState(1);
    const { sendEvent } = useAnalytics();
    const { isMobile } = useIsMobile();

    const fetcher = () =>
        actions.searchWebsites({
            sorting: "new"
        }).then(({ data, error }) => {
            if (error) throw error;
            return data;
        });

    const { data: entryFetchData, isLoading } = useSWR("websites", async () => fetcher(), {
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        refreshWhenOffline: false,
        refreshWhenHidden: false,
        refreshInterval: 0,
    });

    const entryWebsites = useMemo(() => entryFetchData?.websites || [], [entryFetchData?.websites]);
    const totalWebsites = useMemo(() => entryFetchData?.total || 0, [entryFetchData?.total]);
    const tags = useMemo(() => entryFetchData?.tags || [], [entryFetchData?.tags]);

    const [currentWebsites, currentWebsitesSet] = useState<WebsiteType[]>(entryWebsites);
    const [totalPages, totalPagesSet] = useState(Math.ceil(totalWebsites / PAGE_SIZE));
    const [tagsList, tagsListSet] = useState(tags);
    const [searchContentPhrase, searchContentPhraseSet] = useSearchParamState<string>("search", "");
    const [websitesLoading, startWebsitesLoading] = useTransition();

    const [searchContent, searchContentSet] = useState<SearchContentType>({
        search: searchContentPhrase,
        tags: []
    });

    const [showOnlyLiked, showOnlyLikedSet] = useSearchParamState<boolean>("liked", false);
    const [sortingSelected, sortingSelectedSet] = useState<SORTING_TYPE>("new");
    const debouncedSearch = useDebounce(searchContent.search, 600);

    const previousSearch = useRef<{
        searchContent: SearchContentType | null,
        showOnlyLiked: boolean
    }>({
        searchContent: searchContentPhrase.length > 0 ? { search: searchContentPhrase, tags: [] } : null,
        showOnlyLiked
    });

    const previousFilters = useRef({
        tags: [] as string[],
        showOnlyLiked: false,
        sorting: "new" as SORTING_TYPE,
        search: ""
    });

    const didMount = useRef(false);

    useEffect(() => {
        currentWebsitesSet(entryWebsites);
        totalPagesSet(Math.ceil(totalWebsites / PAGE_SIZE));
        tagsListSet(tags);
    }, [entryFetchData]);

    useEffect(() => {
        searchContentPhraseSet(debouncedSearch);
    }, [debouncedSearch]);

    useEffect(() => {
        const isSearchTheSame = JSON.stringify(previousSearch.current) === JSON.stringify({ searchContent, showOnlyLiked });
        const filtersChanged = JSON.stringify(previousFilters.current) !== JSON.stringify({
            tags: searchContent.tags,
            showOnlyLiked,
            sorting: sortingSelected,
            search: debouncedSearch
        });

        if (!isSearchTheSame && !didMount.current) {
            previousSearch.current = { searchContent, showOnlyLiked };
            didMount.current = true;
            return;
        }

        const currentPage = !isSearchTheSame ? 1 : page;

        const fetchWebsites = async ({ overridePage }: { overridePage?: number }) => {
            try {
                const data = await actions.searchWebsites({
                    page: overridePage ?? currentPage,
                    search: debouncedSearch,
                    tags: searchContent.tags,
                    sorting: sortingSelected,
                    showOnlyLiked: showOnlyLiked
                });

                if (data.error || !data.data) {
                    toast.error("Failed to get websites: " + (data.error?.message ?? "Unknown error"));
                    await sendEvent("error", {
                        message: "Failed to fetch websites",
                        details: {
                            error: { ...data.error },
                            searchContent,
                            currentPage,
                            overridePage,
                            debouncedSearch,
                            sortingSelected,
                            showOnlyLiked,
                        },
                        caller: "useWebsiteSearch fetchWebsites()"
                    });
                    return;
                }

                totalPagesSet(Math.ceil(data.data.total / PAGE_SIZE));
                tagsListSet((prevTags) =>
                    prevTags.map((tag) => {
                        const updatedTag = data.data?.tags.find((t: WebsiteTag) => t.name === tag.name);
                        return updatedTag ? { ...tag, count: updatedTag.count } : { ...tag, count: 0 };
                    })
                );

                if (filtersChanged) {
                    currentWebsitesSet(data.data.websites);
                } else {
                    currentWebsitesSet((p) => {
                        const newWebsites = [...p];
                        data.data?.websites.forEach((website) => {
                            if (!newWebsites.find((w) => w.id === website.id)) {
                                newWebsites.push(website);
                            }
                        });
                        return newWebsites;
                    });
                }

                previousSearch.current = { searchContent, showOnlyLiked };
                previousFilters.current = { tags: searchContent.tags, showOnlyLiked, sorting: sortingSelected, search: debouncedSearch };
            } catch (err) {
                debugLog("ERROR", "Exception while fetching websites: ", err);
            }
        };

        if ((!isSearchTheSame || filtersChanged) && page !== 1) {
            setPage(1);
            return;
        }

        startWebsitesLoading(() => {
            fetchWebsites({ overridePage: filtersChanged ? 1 : undefined }).then(() => {
                sendEvent("custom_event", { source: "Basic search invocation" });
            });
        });
    }, [page, debouncedSearch, searchContent.tags, sortingSelected, showOnlyLiked]);

    return {
        page,
        setPage,
        currentWebsites,
        isLoading,
        websitesLoading,
        tagsList,
        noEntries: tagsList.every((p) => p.count === 0) && !isLoading,
        totalPages,
        searchContent,
        searchContentSet,
        showOnlyLiked,
        showOnlyLikedSet,
        sortingSelected,
        sortingSelectedSet,
        debouncedSearch
    };
};
