import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form"
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { uploadSchema } from "@/helpers/upload.helper";
import { actions } from "astro:actions";
import { debugLog } from "@/lib/log";
import { cn } from "@/lib/utils";
import TagsSelector from "./tags-selector";
import { CheckCircleIcon, Link, LoaderCircle, Tags, Text, UploadCloud } from "lucide-react";
import SkewedHighlight from "../skewed-highlight";
import { lazy, useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useAnalytics } from "shibuitracker-client/client";

const Textarea = lazy(() => import("../ui/textarea"));

type UploadFormInputs = {
    url: string,
    description: string,
    tags: string[],
    captcha: string
}

const UploadForm = () => {
    const methods = useForm<UploadFormInputs>({
        defaultValues: {
            tags: [],
            captcha: ""
        },
        resolver: zodResolver(uploadSchema),
        mode: "onBlur"
    })

    const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful }, setError, clearErrors, reset } = methods
    const [previewNotUploaded, previewNotUploadedSet] = useState(false)
    const recaptchaRef = useRef<TurnstileInstance>(null);
    const { sendEvent } = useAnalytics()

    const onSubmit: SubmitHandler<UploadFormInputs> = async (data) => {
        previewNotUploadedSet(false)
        const { url, description, tags } = data;
        const uploadData = {
            url,
            description,
            tags,
            captcha: recaptchaRef.current?.getResponse() || ""
        };

        debugLog("ACTION", 'Submiting...', uploadData)

        if (tags.length <= 0) {
            setError("tags", { type: "manual", message: "Minimum 1 tag is required!" });
            return;
        }

        const result = await actions.uploadWebsite(uploadData);
        debugLog("INFO", "Upload result: ", result);

        if (result.error) {
            setError("root", { type: "manual", message: result.error.message || "Upload failed" });
            await sendEvent("error", {
                message: "Website upload failed",
                details: {
                    error: {
                        ...result.error
                    },
                    uploadData
                },
                caller: "UploadForm onSubmit"
            })
            return
        }

        if (!result.data?.image) previewNotUploadedSet(true)

        await sendEvent("custom_event", { source: "Uploaded website" })

        recaptchaRef.current?.reset()

        methods.setValue("tags", [])
        reset()
    }

    return (
        <section>
            <header className="text-3xl font-extrabold tracking-tight">
                Upload a website
            </header>
            <p>We are sure other users are willing to know about your new website!</p>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className={cn(
                    "flex flex-col gap-4 bg-background-900/30 dark:bg-neutral-900 dark:border-neutral-700 p-4 corner-squircle rounded-md border-[1px] border-background-800 sm:min-w-xl min-w-auto transition-all relative my-4 max-w-3xs",
                    isSubmitting ? "opacity-60 animate-pulse pointer-events-none" : ""
                )}>
                    <div className="space-y-2">
                        <Label><Link size={18} /> Website URL</Label>
                        <Input className="dark:border-neutral-700" placeholder={"https://example.com"} {...register("url", { required: true })} />
                        {errors.url && <span className="text-red-500">{errors.url.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label><Text /> Description</Label>
                        <Textarea className="bg-white" placeholder={"Example description of a page..."} style={{ maxHeight: "150px" }} maxLength={120} {...register("description", { required: true })} />
                        {errors.description && <span className="text-red-500">{errors.description.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label><Tags /> Tags</Label>
                        <TagsSelector />
                        {errors.tags && <span className="text-red-500">{errors.tags.message}</span>}
                    </div>

                    {import.meta.env.PROD && <div className="space-y-2 flex items-center justify-center">
                        <Turnstile
                            siteKey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY}
                            ref={recaptchaRef}
                        />
                    </div>}

                    {errors.root && <span className="text-red-500">{errors.root.message}</span>}
                    {isSubmitSuccessful && !errors.root && (previewNotUploaded ? (
                        <div className="text-orange-700 bg-orange-300/70 p-3 corner-squircle rounded-md border-[1px] border-orange-500">
                            <p className="flex items-center gap-2"><CheckCircleIcon /> Website has been uploaded without it's preview.</p>
                        </div>
                    ) : (
                        <div className="text-green-700 bg-green-300/70 p-3 corner-squircle rounded-md border-[1px] border-green-500">
                            <p className="flex items-center gap-2"><CheckCircleIcon /> Website uploaded successfully!</p>
                        </div>
                    ))}
                    <p className="text-sm text-center text-neutral-700 dark:text-neutral-400">By clicking "Upload" button, you agree with our <a href="/tos" className="font-bold underline">Terms of Service</a>.</p>
                    <Button type="submit" variant={"primary"} disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle className="animate-spin" /> Uploading...</> : <><UploadCloud /> Upload</>}</Button>
                </form>
            </FormProvider>
        </section>
    );
}

export default UploadForm;