import { ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import type { WebsiteType } from "@/types/website";
import WebsiteIcon from "./website-icon";

type WebsiteItemProps = {
    website: WebsiteType
}

function WebsiteItem({ website }: WebsiteItemProps) {
    const { name, url, description, image } = website;

    return (
        <div className="px-6 py-4 max-w-md rounded-sm border-[1px] border-background-800 bg-background-950 w-fit flex flex-col gap-2 grow">
            <div className="flex items-start gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <WebsiteIcon src={`https://s2.googleusercontent.com/s2/favicons?domain=${url}&sz=128`} alt={`${name} favicon`} size={48} />
                        {/* <img
                            src={`https://s2.googleusercontent.com/s2/favicons?domain=${url}&sz=128`}
                            width={48}
                            height={48}
                            alt={`${name} favicon`}
                        /> */}
                        <div>
                            <h3 className="text-xl font-semibold">{name}</h3>
                        </div>
                    </div>
                    <p className="w-full overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:6] [-webkit-box-orient:vertical]">
                        {description}
                    </p>
                    <Button variant="primary">
                        Visit website <ExternalLink />
                    </Button>
                </div>
                <img src={image} width={150} height={350} className="rounded-xs" alt={`${name} screenshot`} />
            </div>
        </div>
    );
}

export default WebsiteItem;
