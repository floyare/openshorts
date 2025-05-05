import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

interface SkewedHighlightProps extends ComponentProps<"div"> {
    skew?: string;
}

const SkewedHighlight = (props: SkewedHighlightProps) => {
    const skewAmount = props.skew || "-skew-3";
    return (
        <div {...props} className={cn("relative my-8", props.className)}>
            <div className={cn("absolute bottom-[50%] rounded-md translate-y-[58%] left-[55%] -translate-x-[50%] w-[calc(100%+25px)] h-full bg-background-500/60 -skew-3 -z-20 py-8", skewAmount)}></div>
            <div className={cn("absolute bottom-[50%] rounded-md translate-y-[50%] left-[50%] -translate-x-[50%] w-[calc(100%+25px)] h-full bg-background-500 -z-10 py-8", skewAmount)}></div>
            <div className={skewAmount}>
                {props.children}
            </div>
        </div>
    );
}

export default SkewedHighlight;