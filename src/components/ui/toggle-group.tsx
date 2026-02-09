import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"
import { ChevronDown } from "lucide-react"

const ToggleGroupContext = React.createContext<
    VariantProps<typeof toggleVariants>
>({
    size: "default",
    variant: "default",
})

function ToggleGroup({
    className,
    variant,
    size,
    children,
    ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>) {
    const [expanded, setExpanded] = React.useState(false);
    const groupRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (!expanded && groupRef.current) {
            groupRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [expanded])
    return (
        <ToggleGroupPrimitive.Root
            data-slot="toggle-group"
            data-variant={variant}
            data-size={size}
            ref={groupRef}
            className={cn(
                "group/toggle-group flex w-fit items-center flex-wrap corner-squircle rounded-md py-2 transition-all duration-900 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                className,
                expanded ? "max-h-[55vh] overflow-y-auto" : "max-h-[30vh] overflow-hidden relative"
            )}
            {...props}
        >
            <ToggleGroupContext.Provider value={{ variant, size }}>
                {children}
            </ToggleGroupContext.Provider>
            <div
                onClick={() => setExpanded(!expanded)}
                className="w-full h-20 flex items-end cursor-pointer justify-center sticky -bottom-2 left-0 bg-gradient-to-t from-white dark:from-neutral-800 to-transparent"
            >
                {
                    expanded ? <ChevronDown size={36} className="text-primary-500 corner-squircle rounded-md hover:bg-primary-800/30 w-full transition-colors dark:text-white rotate-180 mb-2" strokeWidth={3} /> : <ChevronDown size={36} className="text-primary-500 corner-squircle rounded-md hover:bg-primary-800/30 w-full transition-colors dark:text-white mb-2" strokeWidth={3} />
                }
            </div>
        </ToggleGroupPrimitive.Root>
    )
}

function ToggleGroupItem({
    className,
    children,
    variant,
    size,
    ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>) {
    const context = React.useContext(ToggleGroupContext)

    return (
        <ToggleGroupPrimitive.Item
            data-slot="toggle-group-item"
            data-variant={context.variant || variant}
            data-size={context.size || size}
            className={cn(
                toggleVariants({
                    variant: context.variant || variant,
                    size: context.size || size,
                }),
                "cursor-pointer text-text-50 shrink-0 grow corner-squircle rounded-md shadow-none focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
                className
            )}
            {...props}
        >
            {children}
        </ToggleGroupPrimitive.Item>
    )
}

export { ToggleGroup, ToggleGroupItem }
