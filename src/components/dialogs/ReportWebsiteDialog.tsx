import Container from "../container"
import { Dialog, DialogContent } from "../ui/dialog"

type ReportWebsiteDialogProps = {
    onClose: (val: boolean) => void
    additionalProps: {
        url: string
    }
}

const ReportWebsiteDialog = ({
    onClose, additionalProps, ...rest
}: ReportWebsiteDialogProps) => {
    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="flex flex-col gap-2 overflow-y-auto !max-h-full py-6 data-[state=closed]:!animate-fadeout animate-fadein" {...rest}>
                <Container>
                    <p>{additionalProps.url}</p>
                </Container>
            </DialogContent >
        </Dialog >
    );
}

export default ReportWebsiteDialog;