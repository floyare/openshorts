import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AISearchButtonProps {
    onClick: () => Promise<void>;
}

export const AISearchButton = ({ onClick }: AISearchButtonProps) => {
    return (
        <Button 
            variant={"primary"} 
            className="shadow-xl shadow-primary-500/30 !py-7 lg:!text-2xl sm:!text-3xl sm:!py-8 lg:py-2 !text-base font-semibold shimmer-background lg:!w-full w-fit grow mb-0" 
            onClick={onClick}
        >
            <Sparkles className="text-accent-500 drop-shadow-lg drop-shadow-secondary-700/40 shrink" /> 
            Try the <b className="text-accent-600 font-extrabold drop-shadow-lg drop-shadow-accent-500/40">AI Search</b>
        </Button>
    );
};
