import WebsiteItem from "@/components/websites/website-item";
import { actions } from "astro:actions";
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
            <p>Loading...</p>
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