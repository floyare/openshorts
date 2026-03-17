import { useEffect, useMemo, useState, type RefObject } from "react"

export default function useOnScreen(ref: RefObject<HTMLElement | null>) {
    const [isIntersecting, setIntersecting] = useState(false)

    const observer = useMemo(() => {
        if (typeof window !== "undefined" && "IntersectionObserver" in window) {
            return new IntersectionObserver(
                ([entry]) => setIntersecting(entry.isIntersecting)
            );
        }
        return null;
    }, [ref]);

    useEffect(() => {
        if (!ref.current || !observer) return;
        observer.observe(ref.current);
        return () => observer.disconnect && observer.disconnect();
    }, [observer, ref])

    return isIntersecting
}