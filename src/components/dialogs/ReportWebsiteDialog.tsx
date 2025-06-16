import { Flag, LoaderCircle, Send, X } from "lucide-react"
import Container from "../container"
import { Button } from "../ui/button"
import { Dialog, DialogContent } from "../ui/dialog"
import { Fragment, useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import Textarea from "../ui/textarea"
import { toast } from "sonner"
import { REPORT_TEXT_MAX_LENGTH, REPORT_TEXT_MIN_LENGTH, REPORT_TYPES, type ReportOption } from "@/helpers/websites.helper"
import { actions } from "astro:actions"
import { debugLog } from "@/lib/log"

type ReportWebsiteDialogProps = {
    onClose: (val: boolean) => void
    additionalProps: {
        url: string
    }
}


const ReportWebsiteDialog = ({
    onClose, additionalProps, ...rest
}: ReportWebsiteDialogProps) => {
    const [selectedReportOption, selectedReportOptionSet] = useState<ReportOption | null>(null)
    const [otherReasonText, otherReasonTextSet] = useState<string>("")
    const [isPending, setTransition] = useTransition()

    const handleReportSubmit = async () => {
        if (isPending) return
        if (selectedReportOption?.type === "OTHER" && otherReasonText.length <= REPORT_TEXT_MIN_LENGTH) {
            toast.error("You must specify reason if other is selected!")
            return
        }

        if (!selectedReportOption) {
            toast.error("You must select report reason first!")
            return
        }

        const result = await actions.reportWebsite({
            type: selectedReportOption?.type,
            text: selectedReportOption?.type === "OTHER" ? otherReasonText : selectedReportOption?.text,
            url: additionalProps.url
        })

        if (result.error) {
            toast.error("Failed while reporting this website")
            debugLog("ERROR", "Failed while reporting this website:", result.error)
            return
        }

        toast.success("Website reported!")
        onClose(true)
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="flex flex-col gap-2 overflow-y-auto !max-h-full py-6 data-[state=closed]:!animate-fadeout animate-fadein" {...rest}>
                <Container className="bg-white space-y-2 dark:!bg-neutral-900 dark:!border-neutral-700">
                    <div className="flex gap-8 justify-between items-center">
                        <h1 className="font-bold flex items-center gap-2"><Flag className="text-red-500" /> Report website</h1>
                        <Button variant={"ghost"} className="ml-auto" onClick={() => onClose(false)}><X /></Button>
                    </div>
                    <p>Select what problem you encountered with this website</p>
                    <div className="flex flex-col gap-2 my-4">
                        {REPORT_TYPES.map((option, idx) => {
                            return (
                                <Fragment key={idx}>
                                    <div key={idx} className={cn(selectedReportOption?.type === option.type ? "bg-background-500 text-white" : "bg-background-950 dark:bg-neutral-800", "px-3 py-2 rounded-md cursor-pointer transition-colors")} onClick={() => selectedReportOptionSet(option)}>
                                        {option.text}
                                    </div>
                                    {selectedReportOption?.type === "OTHER" && selectedReportOption.type === option.type && <Textarea
                                        placeholder="Describe other reason..."
                                        value={otherReasonText}
                                        onChange={(e) => otherReasonTextSet(e.target.value)}
                                        className="max-h-48"
                                        maxLength={REPORT_TEXT_MAX_LENGTH}
                                    />}
                                </Fragment>
                            )
                        })}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant={"ghost"} onClick={() => onClose(false)} className="">Cancel</Button>
                        <Button variant={"primary"} disabled={isPending} className={isPending ? "opacity-75 cursor-not-allowed" : ""} onClick={() => setTransition(handleReportSubmit)}>
                            {
                                isPending ? <><LoaderCircle className="animate-spin" /> Reporting...</> : <><Send /> Submit</>
                            }
                        </Button>
                    </div>
                </Container>
            </DialogContent>
        </Dialog >
    );
}

export default ReportWebsiteDialog;