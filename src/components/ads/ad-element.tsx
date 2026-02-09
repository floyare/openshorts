import { DISPLAY_AD_BANNERS } from "@/helpers/user.helper";
import { cn } from "@/lib/utils";
import { Heart, Sparkles } from "lucide-react"; // Optional: assumes lucide-react is installed
import type React from "react";
import { useAnalytics } from "shibuitracker-client/client";

interface Props extends React.HTMLAttributes<HTMLDivElement> { }

const AdElement: React.FC<Props> = ({ className, ...rest }) => {
    if (!DISPLAY_AD_BANNERS) return null;

    const { sendEvent } = useAnalytics()

    return (
        <div
            className={cn(
                "relative overflow-hidden corner-squircle rounded-xl border border-amber-400/50 p-6 shadow-lg",
                "bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-500 bg-[length:200%_auto] animate-gradient",
                "flex flex-col flex-wrap md:flex-row items-center justify-between gap-6",
                className
            )}
            {...rest}
        >
            <div className="absolute inset-0 bg-white/10 pointer-events-none" />

            <div className="flex flex-col gap-2 relative text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-amber-950">
                    <Sparkles className="w-5 h-5 fill-amber-900/20" />
                    <span className="font-bold uppercase tracking-wider text-xs">Support Independent Development</span>
                </div>

                <h3 className="text-2xl md:text-3xl font-extrabold text-amber-950 leading-tight">
                    Keep your tools in one place. <br className="hidden md:block" />
                    <span className="text-amber-800 italic">Fuel the evolution of openshorts.dev!</span>
                </h3>

                <p className="max-w-xl text-amber-900/80 font-medium text-sm md:text-base leading-relaxed">
                    OpenShorts is built for the community, by the community. Your support helps cover
                    domain costs and keeps development 100% independent.
                </p>
            </div>

            <div className="flex flex-col items-center gap-3 relative shrink-0">
                <a
                    href="https://www.buymeacoffee.com/floyare"
                    target="_blank"
                    onClick={() => {
                        sendEvent("custom_event", { source: "AdElement Redirect" })
                    }}
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-8 py-4 bg-amber-950 text-amber-50 hover:bg-black transition-all duration-300 corner-squircle rounded-full font-bold shadow-xl hover:scale-105 active:scale-95"
                >
                    <Heart className="w-5 h-5 fill-red-500 group-hover:scale-110 transition-transform" />
                    Buy us a coffee
                </a>
                <span className="text-[10px] text-amber-900 font-bold uppercase tracking-widest opacity-60">
                    Join the gold tier supporters
                </span>
            </div>
        </div>
    );
};

export default AdElement;