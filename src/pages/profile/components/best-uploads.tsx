import WebsiteItem from "@/components/websites/website-item";
import getPrismaInstance from "@/lib/prisma";

type Props = {
    id: string;
};

async function getBestUploads(id: string) {
    const prisma = getPrismaInstance();

    // TODO: order by likes and uploader if current id user
    return prisma.websites.findMany({
        take: 3,

    });
}

export default async function BestUploads({ id }: Props) {
    const uploads = await getBestUploads(id);

    if (!uploads.length) return;

    return (
        <div className="flex flex-col gap-2">
            {uploads.map((website, idx) => (
                <WebsiteItem website={website} key={idx} />
            ))}
        </div>
    );
}
