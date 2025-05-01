import { cn } from "@/lib/utils";
import { FileQuestion, LoaderCircle } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface WebsitePreviewProps extends React.HTMLAttributes<HTMLDivElement> {
    src: string;
    alt?: string;
    size?: { width: number, height: number };
    fallback?: React.ReactNode;
}

const WebsitePreview: React.FC<WebsitePreviewProps> = ({
    src,
    alt = "Website Preview",
    size = { width: 150, height: 350 },
    fallback,
    ...props
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fontSize = useMemo(() => size ? size.width * 0.7 : 22, [size.width]);
    const sizeStyle = { width: size.width, height: size.height, fontSize: fontSize };

    useEffect(() => {
        if (!loading && !error) return;
        const img = new window.Image();
        img.src = src;
        if (img.complete) {
            setLoading(false);
        }
    }, [src, loading, error]);

    return (
        <div
            {...props}
            className={cn("relative flex items-center justify-center bg-background-900 rounded-sm overflow-hidden", props.className)}
            style={{ width: size.width, height: size.height }}
        >
            {loading && !error && (
                <span
                    className="absolute inset-0 flex items-center justify-center animate-spin"
                    style={{ fontSize: fontSize }}
                >
                    <LoaderCircle className="text-primary-600" />
                </span>
            )}
            {!error && (
                <img
                    src={src}
                    alt={alt}
                    width={size.width}
                    height={size.height}
                    className={`object-contain ${loading ? "hidden" : "block"} w-full h-full`}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setLoading(false);
                        setError(true);
                    }}
                    style={sizeStyle}
                />
            )}
            {error &&
                (fallback ? (
                    fallback
                ) : (
                    <span
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ fontSize: fontSize }}
                    >
                        <FileQuestion className="text-secondary-300" />
                    </span>
                ))}
        </div>
    );
};

export default WebsitePreview;