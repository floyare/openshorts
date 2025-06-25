import { LoaderCircle, Send, X } from "lucide-react";
import Container from "../container";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState, useTransition, lazy } from "react";
import { MAX_FEEDBACK_LENGTH, MIN_FEEDBACK_LENGTH } from "@/helpers/globals.helper";
import { actions } from "astro:actions";
import { cn, tryCatch } from "@/lib/utils";
import { toast } from "sonner";

const Textarea = lazy(() => import("../ui/textarea"));

type FeedbackDialogProps = {
    onClose: (val: boolean) => void
    additionalProps: {

    }
}

const FeedbackDialog = ({ onClose, additionalProps, ...rest }: FeedbackDialogProps) => {
    const recaptchaRef = useRef<TurnstileInstance>(null);
    const [feedbackContent, feedbackContentSet] = useState<string>("");
    const [feedbackError, feedbackErrorSet] = useState<string>("");
    const [isLoading, setTransition] = useTransition()

    const handleSubmit = async () => {
        if (isLoading) return

        if (feedbackContent.length < MIN_FEEDBACK_LENGTH) {
            feedbackErrorSet(`Feedback must contain at least ${MIN_FEEDBACK_LENGTH} characters.`);
            return
        }

        if (feedbackContent.length > MAX_FEEDBACK_LENGTH) {
            feedbackErrorSet(`Feedback cannot exceed ${MAX_FEEDBACK_LENGTH} characters.`);
            return
        }

        const captchaResponse = recaptchaRef.current?.getResponse();
        if (!captchaResponse) {
            feedbackErrorSet("Please complete the captcha.");
            return;
        }

        const result = await tryCatch(actions.sendFeedback({ content: feedbackContent, captcha: captchaResponse }))
        if (result.error) {
            feedbackErrorSet(result.error.message || "An error occurred while sending feedback.");
            return
        }

        toast.success("Feedback sent succesfully! Thank you for your input!")
        onClose(true)
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="flex flex-col gap-2 overflow-y-auto !max-h-full py-6 data-[state=closed]:!animate-fadeout animate-fadein" {...rest}>
                <Container className="dark:!border-neutral-700 relative bg-white dark:bg-neutral-950 px-4 py-6 space-y-4">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold md:flex inline-block w-full gap-2 dark:text-white text-neutral-900">
                            Send feedback about <span className="underline decoration-4 decoration-primary-600">openshorts</span>!
                            <Button variant={"ghost"} className="ml-auto md:relative absolute top-2 right-2 md:top-0 md:right-0" onClick={() => onClose(false)}><X /></Button>
                        </h1>
                        <p className="max-w-xl text-balance break-words text-neutral-800 dark:text-neutral-400">Share your thoughts about openshorts, what you liked or maybe disliked about our website. We want to deliver premium-grade experience while using this website, so any information is useful for us!</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Textarea value={feedbackContent} minLength={MIN_FEEDBACK_LENGTH} onChange={(e) => feedbackContentSet(e.target.value)} placeholder="Describe your thoughts about openshorts, what can be improved or removed..." className="min-h-36 max-h-60" maxLength={250} />
                        {/*import.meta.env.PROD*/ true && <div className="space-y-2 flex items-center justify-center">
                            <Turnstile
                                siteKey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY}
                                ref={recaptchaRef}
                            />
                        </div>}
                        {feedbackError && <span className="text-red-500 text-center w-full">{feedbackError}</span>}
                        <Button className={cn("ml-auto", isLoading ? "opacity-50 grayscale cursor-not-allowed" : "")} onClick={() => setTransition(handleSubmit)}>{
                            !isLoading ? <><Send /> Send Feedback</> : <><LoaderCircle className="animate-spin" /> Sending...</>
                        }</Button>
                    </div>
                </Container>
            </DialogContent >
        </Dialog >
    );
}

export default FeedbackDialog;