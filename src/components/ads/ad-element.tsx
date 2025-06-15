import { cn } from "@/lib/utils";
import type React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> { }

const AdElement: React.FC<Props> = ({ className, children, ...rest }) => (
    <div
        className={cn("px-6 py-4 2xl:max-w-lg max-w-full grid place-items-center rounded-sm border-[1px] border-background-800 dark:border-neutral-700 bg-background-800 dark:bg-neutral-600 dark:text-text-950 w-full gap-2 grow relative", className)}
        {...rest}
    >
        <p>AdElement</p>
    </div>
);

export default AdElement;
