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

    const { data: uploads, error, isLoading } = useSWR("uploads-fetch", () => fetcher(name));

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
                <WebsiteItem website={website} key={idx} />
            ))}
        </div>
    );
}
