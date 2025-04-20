import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

interface LogoProps extends ComponentProps<"h1"> { }

const Logo = (props: LogoProps) => {
    return (
        <h1 {...props} className={cn("text-4xl font-bold flex items-center gap-4", props.className)}>
            open
            <span className="text-text-950 relative">
                <div className="absolute bottom-[50%] rounded-md translate-y-[50%] left-[50%] -translate-x-[50%] w-[calc(100%+25px)] h-full bg-background-500 -skew-6 -z-10 py-6"></div>
                <p className="text-3xl mb-0.5">shorts</p>
            </span>
        </h1>
    );
}

export default Logo;