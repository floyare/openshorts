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

    const [previewZoomedIn, previewZoomedInSet] = useState(false)

    const fontSize = useMemo(() => size ? size.width * 0.7 : 22, [size.width]);
    const sizeStyle = { width: size.width, height: size.height, fontSize: fontSize };

    useEffect(() => {
        setLoading(true);
        setError(false);

        const img = new window.Image();
        img.src = src;

        img.onload = () => setLoading(false);
        img.onerror = () => {
            setLoading(false);
            setError(true);
        };

        if (img.complete && img.naturalWidth !== 0) {
            setLoading(false);
        }

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);

    return (
        <div
            {...props}
            className={cn("relative flex items-center justify-center bg-background-900 rounded-sm ", props.className)}
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
                <div className="relative w-full h-full">
                    <img
                        src={src}
                        alt={alt}
                        width={size.width}
                        height={size.height}
                        className={`sm:object-contain object-cover ${loading ? "hidden" : "block"} w-full h-full cursor-zoom-in overflow-hidden rounded-sm`}
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                            setError(true);
                        }}
                        onClick={() => previewZoomedInSet(true)}
                        style={sizeStyle}
                    />
                    {previewZoomedIn && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-50 transition-all">
                        <img
                            src={src}
                            alt={alt}
                            width={size.width * 1.6}
                            height={size.height * 1.6}
                            className="rounded-md border bg-background-900 shadow-2xl shadow-black cursor-zoom-out"
                            style={{ maxWidth: 500, maxHeight: 700 }}
                            onClick={() => previewZoomedInSet(false)}
                        />
                    </div>}
                </div>
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