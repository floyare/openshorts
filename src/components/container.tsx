import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

interface ContainerProps extends ComponentProps<"div"> { }

const Container = (props: ContainerProps) => {
    return (
        <div {...props} className={cn("bg-background-900 p-4 rounded-md border-[1px] border-background-800", props.className)}>
            {props.children}
        </div>
    );
}

export default Container;