import { MAX_TAGS_PER_UPLOAD } from "@/helpers/upload.helper";
import { DEFINED_TAGS } from "@/helpers/websites.helper";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

type TagsSelectorProps = {}

const TagsSelector = ({ }: TagsSelectorProps) => {
    const { register, setValue } = useFormContext();
    const [selectedTags, selectedTagsSet] = useState<string[]>([]);

    const canAddMore = useMemo(() => selectedTags.length < MAX_TAGS_PER_UPLOAD, [selectedTags])

    const TagElement = memo(({ tag, index }: { tag: string, index: number }) => {
        const isSelected = selectedTags.includes(tag)
        return (
            <span
                key={tag}
                tabIndex={index}
                className={`px-4 py-2 group flex items-center gap-1 cursor-pointer rounded-full transition-colors ${selectedTags.includes(tag) ? "bg-background-500 text-white hover:bg-background-700" : "bg-background-950 text-text-100 hover:bg-background-700/50"}`}
                onClick={() => {
                    const newTags = isSelected ? selectedTags.filter((t) => t !== tag) : (canAddMore ? [...selectedTags, tag] : selectedTags);
                    selectedTagsSet(newTags);

                    setValue("tags", newTags, { shouldValidate: true });
                }}
            >
                {tag}
                <span className="">{isSelected ? <X size={14} /> : <Plus size={14} />}</span>
            </span>
        )
    })

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
                {selectedTags.map((tag, idx) => {
                    return (
                        <TagElement key={idx} tag={tag} index={idx} />
                    )
                })}
            </div>
            <div className={cn(
                "flex flex-wrap gap-2 max-w-full bg-background-950 rounded-md border-[1px] border-background-800 max-h-36 overflow-auto p-2 transition-all",
                !canAddMore ? "grayscale-100 pointer-events-none opacity-65" : ""
            )}>
                {DEFINED_TAGS
                    .filter((tag) => !selectedTags.includes(tag))
                    .map((tag, idx) => (
                        <TagElement key={idx} tag={tag} index={idx} />
                    ))}
            </div>
        </div>
    );
}

export default TagsSelector;