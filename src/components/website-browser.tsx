import { useEffect } from "react";
import { cn } from "@/lib/utils";
import Container from "./container";
import { LoaderCircle } from "lucide-react";
import type { User } from "better-auth";
import { useDialogManager } from "easy-dialogs";
import { dialogs } from "@/lib/dialogs";
import FooterContent from "./footer/footer-content";
import { useAnalytics } from "shibuitracker-client/client";
import useIsMobile from "@/hooks/useIsMobile";

import { useWebsiteSearch } from "@/hooks/use-website-search";
import { AISearchButton } from "./websites/browser/ai-search-button";
import { MobileFilters } from "./websites/browser/mobile-filters";
import { SidebarFilters } from "./websites/browser/sidebar-filters";
import { SupportSection } from "./websites/browser/support-section";
import { TopSearchBar } from "./websites/browser/top-search-bar";
import { WebsiteGrid } from "./websites/browser/website-grid";

type BrowserProps = {
    currentUser?: User
}

const WebsiteBrowser = ({ currentUser }: BrowserProps) => {
    const {
        page,
        setPage,
        currentWebsites,
        isLoading,
        websitesLoading,
        tagsList,
        noEntries,
        totalPages,
        searchContent,
        searchContentSet,
        showOnlyLiked,
        showOnlyLikedSet,
        sortingSelected,
        sortingSelectedSet,
        debouncedSearch
    } = useWebsiteSearch();

    const { sendEvent } = useAnalytics();
    const { callDialog } = useDialogManager(dialogs);
    const { isMobile } = useIsMobile();

    useEffect(() => {
        if (typeof window === "undefined") return

        const searchParams = window.location.search
        if (searchParams.includes("show_ai_dialog")) {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
            callDialog("ai-search")
        }
    }, []);

    return (
        <section className="grid 3xl:grid-cols-5 2xl:grid-cols-4 lg:grid-cols-3 lg:gap-2 gap-0 w-full grid-cols-1 relative">
            {isLoading && tagsList.length === 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
                </div>
            )}
            
            <aside className="flex flex-col gap-2 h-fit sticky lg:top-38 top-24 lg:bottom-12 lg:z-50 z-90 lg:w-fit w-full 3xl:col-span-1 2xl:col-span-1 lg:col-span-1 col-span-4" >
                <Container className="dark:bg-neutral-900 dark:text-text-950 backdrop-blur-2xl p-4 corner-squircle rounded-lg border-[1px] border-background-800 dark:border-neutral-700 flex lg:flex-col lg:gap-6 gap-3 flex-wrap flex-row space-y-5">
                    <AISearchButton onClick={async () => {
                        sendEvent("custom_event", { source: "AI Search - Modal open" })
                        callDialog("ai-search")
                    }} />

                    {isMobile && (
                        <MobileFilters 
                            searchContent={searchContent}
                            onSearchChange={(val) => searchContentSet(p => ({ ...p, search: val }))}
                            sortingSelected={sortingSelected}
                            onSortingChange={sortingSelectedSet}
                            tagsList={tagsList}
                            onTagsChange={(tags) => searchContentSet(p => ({ ...p, tags }))}
                            isLoading={isLoading}
                            websitesLoading={websitesLoading}
                            noEntries={noEntries}
                        />
                    )}

                    {!isMobile && (
                        <SidebarFilters 
                            searchContent={searchContent}
                            onTagsChange={(tags) => searchContentSet(p => ({ ...p, tags }))}
                            tagsList={tagsList}
                            isLoading={isLoading}
                            websitesLoading={websitesLoading}
                            currentUser={currentUser}
                            showOnlyLiked={showOnlyLiked}
                            onShowOnlyLikedChange={showOnlyLikedSet}
                        />
                    )}
                </Container>
                
                {!isMobile && <SupportSection currentUser={currentUser} />}
                
                <footer className="fixed lg:relative lg:left-0 lg:translate-x-0 lg:bg-transparent lg:border-transparent bottom-0 left-[50%] translate-x-[-50%] w-full lg:w-auto lg:!mx-0 !mx-2 bg-background-900/30 py-4 border-1 border-background-800 lg:backdrop-blur-none backdrop-blur-lg corner-squircle rounded-md mt-2 lg:mt-0">
                    <FooterContent />
                </footer>
            </aside>

            <div className="3xl:min-w-3xl 2xl:min-w-3xl xl:min-w-2xl lg:min-w-lg 3xl:col-span-4 2xl:col-span-3 lg:col-span-2 min-w-auto space-y-2 relative">
                {!isMobile && (
                    <TopSearchBar 
                        searchValue={searchContent.search}
                        onSearchChange={(val) => searchContentSet(p => ({ ...p, search: val }))}
                        sortingValue={sortingSelected}
                        onSortingChange={sortingSelectedSet}
                        isLoading={websitesLoading}
                        noEntries={noEntries}
                    />
                )}

                <Container className={cn("dark:bg-neutral-900 dark:border-neutral-700 lg:mt-0 mt-2")}>
                    <WebsiteGrid 
                        websites={currentWebsites}
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                        isLoading={isLoading}
                        debouncedSearch={debouncedSearch}
                        noEntries={noEntries}
                    />
                </Container>
            </div>
        </section>
    );
}

export default WebsiteBrowser;