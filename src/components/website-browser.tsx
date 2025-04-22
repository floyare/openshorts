import type { WebsiteType } from "@/types/website";
import WebsiteItem from "./websites/website-item";

type BrowserProps = {
    entryWebsites: WebsiteType[],
    totalWebsites: number
}

const WebsiteBrowser = ({ entryWebsites, totalWebsites }: BrowserProps) => {
    return (
        <section>
            <p>total: {totalWebsites}</p>
            {entryWebsites.map((website) => (
                <WebsiteItem website={website} key={website.id} />
            ))}
        </section>
    );
}

export default WebsiteBrowser;