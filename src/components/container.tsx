import { cn } from "@/lib/utils";
import type React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> { }

const Container: React.FC<Props> = ({ className, children, ...rest }) => (
    <div
        className={cn("bg-background-900/15 p-4 rounded-md border-[1px] border-background-800", className)}
        {...rest}
    >
        {children}
    </div>
);

export default Container;
