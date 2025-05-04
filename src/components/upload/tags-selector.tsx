import { DEFINED_TAGS } from "@/helpers/websites.helper";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

type TagsSelectorProps = {}

const TagsSelector = ({ }: TagsSelectorProps) => {
    const { register, setValue } = useFormContext();
    const [selectedTags, selectedTagsSet] = useState<string[]>([]);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                {DEFINED_TAGS.map((tag) => (
                    <span
                        key={tag}
                        className={`px-4 py-2 cursor-pointer rounded-full transition-colors ${selectedTags.includes(tag) ? "bg-background-500 text-white hover:bg-background-700" : "bg-background-950 text-text-100 hover:bg-background-700/50"}`}
                        onClick={() => {
                            const newTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag];
                            selectedTagsSet(newTags);

                            setValue("tags", newTags, { shouldValidate: true });
                        }}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default TagsSelector;