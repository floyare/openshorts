import { Tags, Heart } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { WebsiteTag, SearchContentType } from "@/types/website";
import type { User } from "better-auth";

interface SidebarFiltersProps {
    searchContent: SearchContentType;
    onTagsChange: (value: string[]) => void;
    tagsList: WebsiteTag[];
    isLoading: boolean;
    websitesLoading: boolean;
    currentUser?: User;
    showOnlyLiked: boolean;
    onShowOnlyLikedChange: (value: boolean) => void;
}

export const SidebarFilters = ({
    searchContent,
    onTagsChange,
    tagsList,
    isLoading,
    websitesLoading,
    currentUser,
    showOnlyLiked,
    onShowOnlyLikedChange
}: SidebarFiltersProps) => {
    return (
        <>
            <div className="flex flex-col space-y-1">
                <p className="flex items-center gap-1"><Tags size={18} /> Tags:</p>
                <ToggleGroup className="ml-2 gap-3 max-h-[41vh] overflow-hidden relative" type="multiple" variant={"outline"} disabled={websitesLoading} onValueChange={onTagsChange} value={searchContent.tags}>
                    {
                        isLoading ? (
                            [...Array(17).keys()].map((_, idx) => (
                                <ToggleGroupItem value={idx.toString()} style={{ minWidth: `${Math.round((Math.random() + 0.6) * idx) * 7}px !important` }} key={idx} tabIndex={0} className={"flex items-center p-4 !flex-0 dark:text-text-950 bg-gray-200 dark:bg-neutral-700 !animate-pulse pointer-events-none"} />
                            ))
                        ) : (
                            tagsList.map((tag, idx) => (
                                <ToggleGroupItem value={tag.name} key={idx} tabIndex={0} className={cn("group/toggle border-1 border-primary-800 flex items-center p-4 !flex-0 dark:text-text-950")} disabled={tag.count <= 0}>
                                    <p className="flex items-center gap-2">{tag.name} <span className="group-data-[state=on]/toggle:!text-white text-xs dark:text-secondary-700 text-secondary-500">({tag.count})</span></p>
                                </ToggleGroupItem>
                            ))
                        )
                    }
                </ToggleGroup>
            </div>
            {currentUser && (
                <Label htmlFor="only-liked" className="cursor-pointer hover:bg-background-900 dark:hover:bg-neutral-700 transition-colors p-2 corner-squircle rounded-md">
                    <Checkbox id="only-liked" checked={showOnlyLiked} disabled={websitesLoading} onCheckedChange={(e: boolean) => onShowOnlyLikedChange(e)} /> Show only liked <Heart size={18} />
                </Label>
            )}
        </>
    );
};
