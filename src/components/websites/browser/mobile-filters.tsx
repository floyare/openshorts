import { Filter, Search, SortAsc, Tags, CalendarArrowDown, CalendarArrowUp, ArrowDownAZ, Heart } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { WebsiteTag, SearchContentType } from "@/types/website";
import type { SORTING_TYPE } from "@/helpers/websites.helper";

interface MobileFiltersProps {
    searchContent: SearchContentType;
    onSearchChange: (value: string) => void;
    sortingSelected: SORTING_TYPE;
    onSortingChange: (value: SORTING_TYPE) => void;
    tagsList: WebsiteTag[];
    onTagsChange: (value: string[]) => void;
    isLoading: boolean;
    websitesLoading: boolean;
    noEntries: boolean;
}

export const MobileFilters = ({
    searchContent,
    onSearchChange,
    sortingSelected,
    onSortingChange,
    tagsList,
    onTagsChange,
    isLoading,
    websitesLoading,
    noEntries
}: MobileFiltersProps) => {
    return (
        <Drawer direction="left">
            <DrawerTrigger asChild>
                <Button variant={"outline"} className="!py-7 !m-0 lg:!text-2xl sm:!text-3xl sm:!py-8 lg:py-2 lg:!w-full w-fit grow"><Filter /> Filters</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-3"><Filter /> Filters</DrawerTitle>
                    <DrawerDescription>Adjust your filters to result with more specific search</DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-6 px-3 pt-6">
                    <label className="space-y-2">
                        <p className="flex items-center gap-1"><Search /> Search input</p>
                        <div className="flex items-center gap-3">
                            <Input
                                type="text"
                                placeholder="Search by phrase..."
                                value={searchContent.search}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    </label>

                    <label className="space-y-2">
                        <p className="flex items-center gap-1"><SortAsc /> Sorting</p>
                        <div className="flex items-center gap-3">
                            <Select disabled={websitesLoading || noEntries} onValueChange={(v) => onSortingChange(v as SORTING_TYPE)} defaultValue={sortingSelected}>
                                <SelectTrigger size="default" className="text-lg w-full dark:text-text-950 dark:border-neutral-700" type="button" name="Sort by" aria-label="Sort by" title="Sort by">
                                    <SelectValue placeholder="Sort by..." defaultValue={sortingSelected} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="new"><CalendarArrowDown /> Newest</SelectItem>
                                        <SelectItem value="old"><CalendarArrowUp /> Oldest</SelectItem>
                                        <SelectItem value="alphabet"><ArrowDownAZ /> Alphabetically</SelectItem>
                                        <SelectItem value="likes"><Heart /> Most likes</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </label>

                    <label className="space-y-2">
                        <p className="flex items-center gap-1"><Tags /> Tags</p>
                        <ToggleGroup className="ml-2 gap-3 max-h-[35vh] overflow-hidden relative" type="multiple" variant={"outline"} disabled={websitesLoading} onValueChange={onTagsChange} value={searchContent.tags}>
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
                    </label>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
