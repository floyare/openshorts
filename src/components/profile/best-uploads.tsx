import WebsiteItem from "@/components/websites/website-item";
import { actions } from "astro:actions";
import useSWR from "swr";

type Props = {
    name: string;
};

export default function BestUploads({ name }: Props) {
    const fetcher = (name: string) =>
        actions.getBestUploads({ name }).then(({ data, error }) => {
            if (error) throw error;
            return data;
        });

    const { data: uploads, error, isLoading } = useSWR("uploads-fetch", () => fetcher(name), {
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
                `${name} has not uploaded any websites yet.`
            }
        </p>
    );

    return (
        <div className="flex flex-col gap-2">
            {isLoading ? <>
                <div className="md:w-xs w-3xs h-56 bg-background-800 dark:bg-neutral-700 animate-pulse corner-squircle rounded-md" />
                <div className="md:w-xs w-3xs h-56 bg-background-800 dark:bg-neutral-700 animate-pulse corner-squircle rounded-md" />
                <div className="md:w-xs w-3xs h-56 bg-background-800 dark:bg-neutral-700 animate-pulse corner-squircle rounded-md" />
            </> : uploads?.map((website, idx) => (
                <WebsiteItem website={website} key={idx} className="!max-w-lg" />
            ))}
        </div>
    );
}
