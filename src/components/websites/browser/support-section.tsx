import { Github, Youtube, Coffee } from "lucide-react";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "shibuitracker-client/client";
import type { User } from "better-auth";

interface SupportSectionProps {
    currentUser?: User;
}

export const SupportSection = ({ currentUser }: SupportSectionProps) => {
    const { sendEvent } = useAnalytics();

    return (
        <Container className="bg-primary-500 overflow-hidden relative z-10 border-[1px] border-primary-400 text-white grid place-items-center-safe gap-3">
            <div className="flex flex-col items-center justify-center text-center">
                <h2 className="font-semibold text-xl tracking-tight">Help <b onDoubleClick={() => sendEvent("error", {
                    message: "Test debug error",
                    details: { currentUser },
                    caller: "Easter egg!"
                })}>openshorts</b> go global!</h2>
                <p className="">Share the website with your friends and followers to help us grow!</p>
            </div>
            <div className="flex items-center flex-wrap gap-2 justify-center relative z-10">
                <a href="https://www.youtube.com/@floyare" target="_blank" title="floyare's Youtube channel">
                    <Button variant={"secondary"} className="bg-red-600 hover:bg-red-500 !text-white flex flex-col !gap-0 !h-fit"><Youtube size={20} /> Youtube</Button>
                </a>
                <a href="https://github.com/floyare" target="_blank" title="floyare's Github profile">
                    <Button variant={"secondary"} className="flex flex-col !gap-0 !h-fit"><Github size={20} /> Github</Button>
                </a>
                <a href="https://buymeacoffee.com/floyare" target="_blank" title="floyare's buymeacoffee.com">
                    <Button variant={"secondary"} className="bg-amber-600 hover:bg-amber-500 !text-white flex flex-col !gap-0 !h-fit"><Coffee size={20} /> Buy me a coffee!</Button>
                </a>
            </div>
        </Container>
    );
};
