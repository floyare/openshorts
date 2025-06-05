import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

const ProviderItem = (({ name, provider }: { name: string, provider: any }) => {
    const [isPending, setIsPending] = useState(false)

    return (
        <div onClick={() => {
            setIsPending(true)
            authClient.signIn.social({
                provider: provider
            })
        }} className="flex relative flex-col items-center justify-center gap-2 text-2xl w-max bg-neutral-950 text-white p-6 rounded-lg cursor-pointer hover:bg-neutral-800 transition-colors duration-200">
            {isPending && <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <LoaderCircle className="animate-spin" size={48} />
            </div>}
            <img src={`/${provider}.svg`} alt={`${name} Icon`} className="w-18 h-18" />
            {name}
        </div>
    )
})

const SignInProviders = () => {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <ProviderItem name="GitHub" provider="github" />
            <ProviderItem name="Google" provider="google" />
        </div>
    );
}

export default SignInProviders;