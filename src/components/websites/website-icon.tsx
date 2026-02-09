import { FileQuestion, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Image } from "@unpic/react";

interface WebsiteIconProps {
    src: string;
    alt?: string;
    size?: number;
    fallback?: React.ReactNode;
}

const WebsiteIcon: React.FC<WebsiteIconProps> = ({
    src,
    alt = "Website Icon",
    size = 32,
    fallback,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const sizeStyle = { width: size, height: size, fontSize: size };

    useEffect(() => {
        setLoading(true);
        setError(false);

        const img = new window.Image();
        img.src = src;

        const handleLoad = () => setLoading(false);
        const handleError = () => {
            setLoading(false);
            setError(true);
        };

        img.onload = handleLoad;
        img.onerror = handleError;

        if (img.complete) {
            setLoading(false);
        }

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);

    return (
        <div
            className="relative flex items-center justify-center bg-background-900 dark:bg-neutral-700 corner-squircle rounded-sm overflow-hidden p-1.5 shrink-0"
            style={{ width: size, height: size }}
        >
            {loading && !error && (
                <span
                    className="absolute inset-0 flex items-center justify-center animate-spin"
                    style={{ fontSize: size ? size * 0.7 : 22 }}
                >
                    <LoaderCircle className="text-primary-600" />
                </span>
            )}
            {!error && (
                // <img
                //     src={src}
                //     alt={alt}
                //     width={size}
                //     height={size}
                //     className={`object-contain ${loading ? "hidden" : "block"} w-full h-full`}
                //     onLoad={() => setLoading(false)}
                //     onError={() => {
                //         setLoading(false);
                //         setError(true);
                //     }}
                //     style={sizeStyle}
                // />

                <Image
                    src={src}
                    alt={alt}
                    layout="constrained"
                    //background=""
                    width={size}
                    height={size}
                    className={`object-contain ${loading ? "hidden" : "block"} w-full h-full`}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setLoading(false);
                        setError(true);
                    }}
                //style={sizeStyle}
                />
            )}
            {error &&
                (fallback ? (
                    fallback
                ) : (
                    <span
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ fontSize: size }}
                    >
                        <FileQuestion className="text-secondary-300" />
                    </span>
                ))}
        </div>
    );
};

export default WebsiteIcon;