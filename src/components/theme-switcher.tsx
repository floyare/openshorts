import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";

declare global {
    interface Window {
        updateTheme: (theme: "light" | "dark" | "system") => void;
    }
}

export function ThemeSwitcher() {
    const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(() => {
        if (typeof window === "undefined") return "light";
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") return "dark";
        if (storedTheme === "light") return "light";

        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });

    useEffect(() => {
        const checkActualTheme = () => {
            const isDarkMode = document.documentElement.classList.contains("dark");
            setCurrentTheme(isDarkMode ? "dark" : "light");
        };

        checkActualTheme();

        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    checkActualTheme();
                    break;
                }
            }
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => {
            observer.disconnect();
        };
    }, []);

    const toggleTheme = () => {
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        if (window.updateTheme) {
            window.updateTheme(newTheme);
        }
    };

    return (
        <Button variant="default" title={`Switch theme to ${currentTheme === "dark" ? "light" : "dark"}`} className="border-[1px] border-primary-500" size="icon" onClick={toggleTheme}>
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
    )
}