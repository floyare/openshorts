import WebsiteItem from "@/components/websites/website-item";
import { actions } from "astro:actions";
import { LoaderCircle } from "lucide-react";
import useSWR from "swr";

const WebsiteItemRenderer = ({ id }: { id: string }) => {
    const fetcher = (id: string) =>
        actions.getWebsiteDetails({ id }).then(({ data, error }) => {
            if (error) throw error;
            return data;
        });

    const { data: website, error, isLoading } = useSWR("website-item-render-" + id, () => fetcher(id), {
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        refreshWhenOffline: false,
        refreshWhenHidden: false,
        refreshInterval: 0
    });

    if (isLoading) {
        return (
            <div className="px-6 py-4 justify-center items-center min-h-52 2xl:max-w-lg max-w-full rounded-sm border-[1px] border-background-800 dark:border-neutral-700 bg-secondary-900 animate-pulse dark:bg-neutral-800 dark:text-text-950 w-full flex flex-col gap-2 grow relative">
                <LoaderCircle className="text-text-500 animate-spin" size={48} />
            </div>
        )
    }

    if (error) {
        return (
            <p className="text-red-500 max-w-3xs break-words text-balance">
                Failed to fetch website: {error.message}
            </p>
        );
    }

    return (
        <div className="not-prose">
            {website && <WebsiteItem website={website} />}
        </div>
    );
}

export default WebsiteItemRenderer;