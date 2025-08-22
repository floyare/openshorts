import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export function useSearchParamState<T>(
    key: string,
    defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
    const serialize = (val: T) => encodeURIComponent(JSON.stringify(val));
    const deserialize = (val: string | null): T => {
        if (val === null) return defaultValue;
        try {
            return JSON.parse(decodeURIComponent(val));
        } catch {
            return defaultValue;
        }
    };

    const read = (): T => {
        if (typeof window === "undefined") return defaultValue;
        const params = new URLSearchParams(window.location.search);
        return deserialize(params.get(key));
    };

    const [value, setValue] = useState<T>(read);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);
        if (
            value === defaultValue ||
            value === undefined ||
            value === "" ||
            JSON.stringify(value) === JSON.stringify(defaultValue)
        ) {
            params.delete(key);
        } else {
            params.set(key, serialize(value));
        }

        window.history.replaceState(null, "", params.toString().length <= 0 ? "/" : `?${params.toString()}`);
    }, [key, value, defaultValue]);

    useEffect(() => {
        const onPop = () => setValue(read());
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, [key]);

    return [value, setValue];
}