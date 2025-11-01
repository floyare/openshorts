import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "../ui/button";

const ProviderItem = (({ name, provider }: { name: string, provider: any }) => {
    const [isPending, setIsPending] = useState(false)

    return (
        <Button onClick={() => {
            setIsPending(true)
            authClient.signIn.social({
                provider: provider
            })
        }} className="flex relative items-center justify-center gap-4 text-xl w-max bg-neutral-900 text-white p-6 rounded-lg cursor-pointer hover:bg-neutral-800 transition-colors duration-200">
            {isPending && <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <LoaderCircle className="animate-spin" size={48} />
            </div>}
            <img src={`/${provider}.svg`} alt={`${name} Icon`} className="w-6 h-6" />
            Sign in with {name}
        </Button>
    )
})

const SignInProviders = () => {
    return (
        <div className="flex flex-col items-center gap-2 flex-wrap">
            <ProviderItem name="GitHub" provider="github" />
            <ProviderItem name="Google" provider="google" />
        </div>
    );
}

export default SignInProviders;