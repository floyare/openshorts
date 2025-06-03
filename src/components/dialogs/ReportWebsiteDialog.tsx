import { Flag, Send, X } from "lucide-react"
import Container from "../container"
import { Button } from "../ui/button"
import { Dialog, DialogContent } from "../ui/dialog"
import { useState } from "react"
import { cn } from "@/lib/utils"

type ReportWebsiteDialogProps = {
    onClose: (val: boolean) => void
    additionalProps: {
        url: string
    }
}

const REPORT_TYPES = [
    { type: "INVALID_NAME_OR_DESCRIPTION", text: "Website has invalid name or description" },
    { type: "BROKEN_URL_OR_NOT_ACTIVE", text: "Website is not working or URL is invalid" },
    { type: "HARRASING_OR_MATURE_CONTENT", text: "Harrasing or mature content" },
    { type: "OTHER", text: "Other" }
]

type ReportOption = { type: string, text: string }

const ReportWebsiteDialog = ({
    onClose, additionalProps, ...rest
}: ReportWebsiteDialogProps) => {
    const [selectedReportOption, selectedReportOptionSet] = useState<ReportOption | null>(null)

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="flex flex-col gap-2 overflow-y-auto !max-h-full py-6 data-[state=closed]:!animate-fadeout animate-fadein" {...rest}>
                <Container>
                    <div className="flex gap-8 justify-between items-center">
                        <h1 className="font-bold flex items-center gap-2"><Flag className="text-red-500" /> Report website</h1>
                        <Button variant={"ghost"} className="ml-auto" onClick={() => onClose(false)}><X /></Button>
                    </div>
                    <p>Select what problem you encountered with this website</p>
                    <div className="flex flex-col gap-2 my-4">
                        {REPORT_TYPES.map((option) => {
                            return (
                                <div className={cn(selectedReportOption?.type === option.type ? "bg-background-500 text-white" : "bg-neutral-50", "px-3 py-1 rounded-md cursor-pointer transition-colors")} onClick={() => selectedReportOptionSet(option)}>
                                    {option.text}
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant={"ghost"} onClick={() => onClose(false)} className="">Cancel</Button>
                        <Button variant={"primary"} className=""><Send /> Submit</Button>
                    </div>
                </Container>
            </DialogContent >
        </Dialog >
    );
}

export default ReportWebsiteDialog;