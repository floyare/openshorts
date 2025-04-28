import { FileQuestion, Loader, LoaderCircle } from "lucide-react";
import React, { useState } from "react";

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

    return (
        <div
            className="inline-block relative align-middle bg-background-900 rounded-sm overflow-hidden"
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
                <img
                    src={src}
                    alt={alt}
                    width={size}
                    height={size}
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
                        style={{ fontSize: size }}
                    >
                        <FileQuestion className="text-secondary-300" />
                    </span>
                ))}
        </div>
    );
};

export default WebsiteIcon;