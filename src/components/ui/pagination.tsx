import * as React from "react"
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn("mx-auto flex w-full justify-center", className)}
            {...props}
        />
    )
}

function PaginationContent({
    className,
    ...props
}: React.ComponentProps<"ul">) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn("flex flex-row items-center gap-1", className)}
            {...props}
        />
    )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
    return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
    isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
    React.ComponentProps<"a">

function PaginationLink({
    className,
    isActive,
    size = "icon",
    ...props
}: { isDisabled: boolean } & PaginationLinkProps) {
    return (
        <a
            {...props}
            aria-current={isActive ? "page" : undefined}
            data-slot="pagination-link"
            data-active={isActive}
            className={cn(
                buttonVariants({
                    variant: isActive ? "primary" : "ghost",
                    size,
                }),
                className,
                props.isDisabled ? "pointer-events-none" : ""
            )}
            onClick={(e) => {
                if (props.isDisabled) {
                    e.preventDefault()
                    e.stopPropagation()
                    return
                }

                props.onClick && props.onClick(e)
            }}
        />
    )
}

function PaginationPrevious({
    className,
    isDisabled,
    ...props
}: { isDisabled: boolean } & React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            size="default"
            className={cn("gap-1 px-2.5 sm:pl-2.5", isDisabled ? "cursor-not-allowed grayscale-100 opacity-60" : "", className)}
            isDisabled={isDisabled}
            {...props}
        >
            <ChevronLeftIcon />
            <span className="hidden sm:block"></span>
        </PaginationLink>
    )
}

function PaginationNext({
    className,
    isDisabled,
    ...props
}: { isDisabled: boolean } & React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to next page"
            size="default"
            className={cn("gap-1 px-2.5 sm:pr-2.5", isDisabled ? "cursor-not-allowed grayscale-100 opacity-60" : "", className)}
            isDisabled={isDisabled}
            {...props}
        >
            <span className="hidden sm:block"></span>
            <ChevronRightIcon />
        </PaginationLink>
    )
}

function PaginationEllipsis({
    className,
    ...props
}: React.ComponentProps<"span">) {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn("flex size-9 items-center justify-center", className)}
            {...props}
        >
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">More pages</span>
        </span>
    )
}

export {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
}
