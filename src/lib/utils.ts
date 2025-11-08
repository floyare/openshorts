import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

type Success<T> = {
    data: T;
    error: null;
};

type Failure<E> = {
    data: null;
    error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

export async function tryCatch<T, E = Error>(
    promise: Promise<T>,
): Promise<Result<T, E>> {
    try {
        const data = await promise;
        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as E };
    }
}

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const getURLHost = (url: string) => {
    let fullHost = new URL(url).host;
    if (fullHost.startsWith("www.")) {
        fullHost = fullHost.slice(4);
    }

    const hostParts = fullHost.split('.');
    const hostnameOnly = hostParts.slice(0, -1).join('.');
    return hostnameOnly
}

export const isValidBrowser = (headers: Headers) => {
    const userAgent = headers.get("user-agent") || "";
    const accept = headers.get("accept") || "";
    const secFetchSite = headers.get("sec-fetch-site");
    const secFetchMode = headers.get("sec-fetch-mode");
    const secFetchDest = headers.get("sec-fetch-dest");

    return (userAgent.length > 0 &&
        /\b(Chrome|Mozilla|Safari|Edge|OPR|Trident)\b/i.test(userAgent) &&
        accept.includes("application/json") &&
        secFetchSite !== null &&
        secFetchMode !== null &&
        secFetchDest !== null)
}