import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form"
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { uploadSchema } from "@/helpers/upload.helper";
import { actions } from "astro:actions";
import { debugLog } from "@/lib/log";
import { cn, tryCatch } from "@/lib/utils";
import TagsSelector from "./tags-selector";
import { CheckCircleIcon, Link, LoaderCircle, Tags, Text, UploadCloud } from "lucide-react";
import SkewedHighlight from "../skewed-highlight";

type UploadFormInputs = {
    url: string,
    description: string,
    tags: string[],
}

const UploadForm = () => {
    const methods = useForm<UploadFormInputs>({
        defaultValues: {
            tags: []
        },
        resolver: zodResolver(uploadSchema),
        mode: "onBlur"
    })

    const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful }, setError } = methods

    const onSubmit: SubmitHandler<UploadFormInputs> = async (data) => {
        const { url, description, tags } = data;
        const uploadData = {
            url,
            description,
            tags
        };

        console.log('uploading', uploadData);

        if (tags.length <= 0) {
            setError("tags", { type: "manual", message: "Minimum 1 tag is required!" });
            return;
        }

        const result = await actions.uploadWebsite(uploadData);
        debugLog("INFO", "Upload result: ", result);
        if (result.error) {
            setError("root", { type: "manual", message: result.error.message || "Upload failed" });
        }
    }

    return (
        <section>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className={cn(
                    "flex flex-col gap-4 bg-background-900 p-4 rounded-md border-[1px] border-background-800 sm:min-w-xl min-w-auto transition-all relative my-8 max-w-3xs",
                    isSubmitting ? "opacity-60 animate-pulse pointer-events-none" : ""
                )}>
                    <SkewedHighlight className="absolute -top-20 -left-8 z-10">
                        <h2
                            className="text-xl font-semibold text-text-950 flex items-center gap-1"
                        >
                            <UploadCloud /> Upload website
                        </h2>
                    </SkewedHighlight>

                    <div className="space-y-2">
                        <Label><Link size={18} /> Website URL</Label>
                        <Input placeholder={"https://example.com"} {...register("url", { required: true })} />
                        {errors.url && <span className="text-red-500">{errors.url.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label><Text /> Description</Label>
                        <Textarea placeholder={"Example description of a page..."} style={{ maxHeight: "150px" }} maxLength={120} {...register("description", { required: true })} />
                        {errors.description && <span className="text-red-500">{errors.description.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label><Tags /> Tags</Label>
                        <TagsSelector />
                        {errors.tags && <span className="text-red-500">{errors.tags.message}</span>}
                    </div>

                    {errors.root && <span className="text-red-500">{errors.root.message}</span>}
                    {isSubmitSuccessful && !errors.root && (
                        <div className="text-green-700 bg-green-300/70 p-3 rounded-md border-[1px] border-green-500">
                            <p className="flex items-center gap-2"><CheckCircleIcon /> Website uploaded successfully!</p>
                        </div>
                    )}
                    <p className="text-sm text-center text-neutral-700">By clicking "Upload" button, you agree with our <a href="/tos" className="font-bold underline">Terms of Service</a>.</p>
                    <Button type="submit" variant={"primary"} disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle className="animate-spin" /> Uploading...</> : <><UploadCloud /> Upload</>}</Button>
                </form>
            </FormProvider>
        </section>
    );
}

export default UploadForm;