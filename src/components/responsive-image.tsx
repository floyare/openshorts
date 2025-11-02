import React, { useEffect, useRef, useState } from "react";
import { Image } from "@unpic/react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "width" | "height"> & {
    width: number;
    height: number;
    className?: string;
    src?: string;
};

export default function ResponsiveImage({ width, height, className = "", src, alt, ...rest }: Props) {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        setLoaded(false);

        const img = new window.Image();
        img.src = src!;

        const handleLoad = () => setLoaded(true);
        const handleError = () => {
            setLoaded(false);
        };

        img.onload = handleLoad;
        img.onerror = handleError;

        if (img.complete) {
            setLoaded(true);
        }

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);

    const paddingPercent = (height / width) * 100;

    return (
        <div className={`relative overflow-hidden w-full ${className}`} style={{ width: `${width}px` }}>
            <div style={{ paddingBottom: `${paddingPercent}%` }} />
            {!loaded && (
                <div className="absolute inset-0 rounded overflow-hidden">
                    <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-gray-700" />
                </div>
            )}
            {src && (
                <Image
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    layout="constrained"
                    className={`absolute inset-0 w-full h-full object-cover ${loaded ? "block" : "hidden"}`}
                    width={width}
                    height={height}
                    onLoad={() => setLoaded(true)}
                    {...rest}
                />
            )}
        </div>
    );
}
