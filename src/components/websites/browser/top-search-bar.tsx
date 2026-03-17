import { Search, CalendarArrowDown, CalendarArrowUp, ArrowDownAZ, Heart } from "lucide-react";
import Container from "@/components/container";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SORTING_TYPE } from "@/helpers/websites.helper";

interface TopSearchBarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    sortingValue: SORTING_TYPE;
    onSortingChange: (value: SORTING_TYPE) => void;
    isLoading: boolean;
    noEntries: boolean;
}

export const TopSearchBar = ({ 
    searchValue, 
    onSearchChange, 
    sortingValue, 
    onSortingChange, 
    isLoading, 
    noEntries 
}: TopSearchBarProps) => {
    return (
        <Container className="dark:bg-neutral-900 dark:border-neutral-700 sticky lg:top-38 top-4 z-10 flex items-center justify-between backdrop-blur-3xl">
            <div className="flex items-center gap-3">
                <Search />
                <Input
                    type="text"
                    placeholder="Search by phrase..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="bg-white dark:bg-neutral-900 border-background-800 border-[1px] corner-squircle rounded-sm w-fit ml-auto relative">
                <Select disabled={isLoading || noEntries} onValueChange={(v) => onSortingChange(v as SORTING_TYPE)} defaultValue={sortingValue}>
                    <SelectTrigger size="default" className="text-lg w-full dark:text-text-950 dark:border-neutral-700" type="button" name="Sort by" aria-label="Sort by" title="Sort by">
                        <SelectValue placeholder="Sort by..." defaultValue={sortingValue} />
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
        </Container>
    );
};
