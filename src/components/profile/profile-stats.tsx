import { actions } from "astro:actions";
import { Heart, UploadCloud } from "lucide-react";
import useSWR from "swr";

const ProfileStats = ({ name }: { name: string }) => {
    const fetcher = (name: string) =>
        actions.getProfileStats({ name }).then(({ data, error }) => {
            if (error) throw error;
            return data;
        });

    const { data: stats, error, isLoading } = useSWR("stats-fetch", () => fetcher(name), {
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        refreshWhenOffline: false,
        refreshWhenHidden: false,
        refreshInterval: 0
    });

    if (error) return (
        <p className="text-red-500 max-w-3xs break-words text-balance">
            Failed to obtain stats: {error.message}
        </p>
    );

    return (
        <>
            <div
                className="flex flex-col items-center gap-1"
                title="Likes"
                aria-label="Likes"
            >
                <Heart size={32} className="fill-primary-600" />
                {isLoading ? <div className="h-8 w-12 bg-background-800 dark:bg-neutral-700 animate-pulse rounded-md" /> : <h2 className="text-3xl font-semibold">{stats ? stats.likes : 0}</h2>}
            </div>
            <div
                className="flex flex-col items-center gap-1"
                title="Uploads"
                aria-label="Uploads"
            >
                <UploadCloud size={32} className="fill-primary-600" />
                {isLoading ? <div className="h-8 w-12 bg-background-800 dark:bg-neutral-700 animate-pulse rounded-md" /> : <h2 className="text-3xl font-semibold">{stats ? stats.uploaded : 0}</h2>}
            </div>
        </>
    );
}

export default ProfileStats;