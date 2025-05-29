import { cn } from "@/lib/utils"
import { useState, type ComponentProps } from "react";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
    const [contentLength, contentLengthSet] = useState(
        props.defaultValue?.toString().length ?? 0,
    );
    return (
        <div className="relative w-full">
            <textarea
                data-slot="textarea"
                className={cn(
                    "relatve field-sizing-content",
                    "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-16 w-full rounded-md border bg-background-950 px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    "",
                    className,
                )}
                onInput={(e) => {
                    if (props.onInput) {
                        props.onInput(e);
                    }
                    contentLengthSet(e.currentTarget.value.length);
                }}
                {...props}
            ></textarea>
            {props.maxLength && (
                <p
                    className={cn(
                        "absolute right-4 bottom-3 text-sm text-text-600 select-none dark:text-neutral-300",
                        contentLength >= props.maxLength
                            ? "text-red-500 dark:text-red-400"
                            : "",
                    )}
                >{`${contentLength}/${props.maxLength}`}</p>
            )}
        </div>
    );
}

export default Textarea
