import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useForm, type SubmitHandler } from "react-hook-form"
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { uploadSchema } from "@/helpers/upload.helper";
import { actions } from "astro:actions";
import { debugLog } from "@/lib/log";
import { cn } from "@/lib/utils";

type UploadFormInputs = {
    url: string,
    description: string,
    tags: string,
}

const UploadForm = () => {
    const { register, handleSubmit, formState: { errors, isLoading, isSubmitting } } = useForm<UploadFormInputs>({
        resolver: zodResolver(uploadSchema),
        mode: "onBlur"
    })

    const onSubmit: SubmitHandler<UploadFormInputs> = async (data) => {
        const { url, description, tags } = data;
        //const tagsArray = tags.split(",").map(tag => tag.trim());
        const uploadData = {
            url,
            description,
            tags
        };

        const result = await actions.uploadWebsite(uploadData)
        debugLog("INFO", "Upload result: ", result)
    }

    return (
        <section>
            <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-4", isSubmitting ? "opacity-60 animate-pulse pointer-events-none" : "")}>
                <div>
                    <Label>url</Label>
                    <Input placeholder={"https://example.com"} {...register("url", { required: true })} />
                    {errors.url && <span className="text-red-500">{errors.url.message}</span>}
                </div>

                <div>
                    <Label>description</Label>
                    <Textarea placeholder={"Example description of a page..."} {...register("description", { required: true })} />
                    {errors.description && <span className="text-red-500">{errors.description.message}</span>}
                </div>

                <div>
                    <Label>tags</Label>
                    <Input placeholder={"tag1, tag2"} {...register("tags", { required: true })} />
                    {errors.tags && <span className="text-red-500">{errors.tags.message}</span>}
                </div>

                {isSubmitting && <p>uploading...</p>}
                <Button type="submit">Upload</Button>
            </form>
        </section>
    );
}

export default UploadForm;