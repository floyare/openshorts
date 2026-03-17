import Container from "../container";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";

type ConfirmationDialogProps = {
    onClose: (val: boolean) => void
    additionalProps: {
        title: string,
        description: string,
        buttons: {
            confirm: {
                label: string,
                action: () => void,
                variant?: "default" | "destructive" | "outline" | "secondary"
            },
            cancel: {
                label: string,
                action: () => void,
                variant?: "default" | "outline" | "secondary"
            }
        }
    }
}

const ConfirmationDialog = ({ onClose, additionalProps, ...rest }: ConfirmationDialogProps) => {
    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="flex flex-col gap-2 overflow-y-auto !max-h-full py-6 data-[state=closed]:!animate-fadeout animate-fadein" {...rest}>
                <Container className="dark:!bg-neutral-900 dark:!border-neutral-700">
                    <h2 className="text-2xl font-semibold">{additionalProps.title}</h2>
                    <p className="text-lg text-gray-700 dark:text-text-700">{additionalProps.description}</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            onClick={() => {
                                additionalProps.buttons.cancel.action()
                                onClose(false)
                            }}
                            variant={additionalProps.buttons.cancel.variant}
                        >
                            {additionalProps.buttons.cancel.label}
                        </Button>

                        <Button
                            onClick={() => {
                                additionalProps.buttons.confirm.action()
                                onClose(true)
                            }}
                            variant={additionalProps.buttons.confirm.variant}
                        >
                            {additionalProps.buttons.confirm.label}
                        </Button>
                    </div>
                </Container>
            </DialogContent >
        </Dialog >
    );
}

export default ConfirmationDialog;