
import { actions } from "astro:actions";
import useSWR from "swr";

const MyUploads = () => {
    const fetcher = () =>
        actions.getMyUploads().then(({ data, error }) => {
            if (error) throw error;
            return data;
        });

    const { data: uploads, error, isLoading } = useSWR("my-uploads-fetch", () => fetcher(), {
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

    return (
        <div className="flex flex-col gap-2">
            {isLoading ? <>
                <div className="w-sm h-56 bg-gray-400 animate-pulse" />
                <div className="w-sm h-56 bg-gray-400 animate-pulse" />
                <div className="w-sm h-56 bg-gray-400 animate-pulse" />
            </> : uploads?.map((website, idx) => (
                <p>{website.url}</p>
            ))}
        </div>
    );
}

export default MyUploads;