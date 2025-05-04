import { DEFINED_TAGS } from "@/helpers/websites.helper";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

type TagsSelectorProps = {

}

const TagsSelector = ({ }: TagsSelectorProps) => {
    const { register, setValue } = useFormContext()
    const [selectedTags, selectedTagsSet] = useState<string[]>([])

    useEffect(() => {
        setValue("tags", selectedTags.toString())
    }, [selectedTags])

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                {/* <input type="text" {...register("tags", { required: true })} value={selectedTags.join(",")} /> */}
                {DEFINED_TAGS.map((tag) => (
                    <span
                        key={tag}
                        className={`px-4 py-2 cursor-pointer rounded-full transition-colors ${selectedTags.includes(tag) ? "bg-background-500 text-white" : "bg-background-950 text-text-100"}`}
                        onClick={() => {
                            if (selectedTags.includes(tag)) {
                                selectedTagsSet(selectedTags.filter((t) => t !== tag));
                            } else {
                                selectedTagsSet([...selectedTags, tag]);
                            }
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