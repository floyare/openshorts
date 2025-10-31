import React from "react";
import clsx from "clsx";
import { CheckCircleIcon, CircleX } from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "error";

const variantProps: Record<AlertVariant, { className: string, icon: any }> = {
    success: {
        className: "text-green-700 dark:text-green-900 bg-green-300/70 p-3 rounded-md border-[1px] border-green-500",
        icon: CheckCircleIcon
    },
    error: {
        className: "text-red-700 bg-red-300/70 p-3 rounded-md border-[1px] border-red-500",
        icon: CircleX
    },
    info: {
        className: "text-blue-700 bg-blue-300/70 p-3 rounded-md border-[1px] border-blue-500",
        icon: CircleX
    },
    warning: {
        className: "text-orange-700 bg-orange-300/70 p-3 rounded-md border-[1px] border-orange-500",
        icon: CircleX
    }
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: AlertVariant;
    children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
    variant = "info",
    children,
    className,
    ...props
}) => {
    const Icon = variantProps[variant].icon;
    return (
        <div
            className={clsx(
                "border rounded-md px-4 py-3 flex items-start gap-2 max-w-full",
                variantProps[variant].className,
                className
            )}
            role="alert"
            {...props}
        >
            <Icon className="h-5 w-5 shrink-0 text-current" />
            {children}
        </div>
    );
};

export default Alert;