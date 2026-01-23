import { LoaderCircle, RefreshCcw, Trash, X } from "lucide-react"
import Container from "../container"
import { Button } from "../ui/button"
import { useState, useTransition } from "react"
import { Input } from "../ui/input"
import { actions } from "astro:actions"
import { toast } from "sonner"
import { useAnalytics } from "shibuitracker-client/client"

type EditDialogWebsiteProps = {
    onClose: (val: boolean) => void
    additionalProps: {
        url: string
    }
}

const EditDialogWebsite = ({ onClose, additionalProps, ...rest }: EditDialogWebsiteProps) => {
    const [deleteConfirmationShown, deleteConfirmationShownSet] = useState(false)
    const [canRemoveWebsite, canRemoveWebsiteSet] = useState(false)
    const [removingPending, setRemovingTransition] = useTransition()
    const [updatingPending, setUpdatingransition] = useTransition()

    const { sendEvent } = useAnalytics()

    //const [animationParent] = useAutoAnimate()

    const handlePreviewUpdate = () => {
        setUpdatingransition(async () => {
            const result = await actions.updateWebsitePreview({ url: additionalProps.url })
            if (result.error) {
                toast.error(result.error.message)
                await sendEvent("error", {
                    message: "Website preview update failed",
                    details: {
                        error: result.error,
                        additionalProps
                    },
                    caller: "EditDialogWebsite handlePreviewUpdate()"
                })
                return
            }

            toast.success("Website preview updated!")
            onClose(true)
        })
    }

    const handleRemove = async () => {
        if (!canRemoveWebsite) return

        setRemovingTransition(async () => {
            const result = await actions.removeWebsite({ url: additionalProps.url })

            if (result.data) {
                toast.success("Website removed!")
                onClose(true)
            } else {
                toast.error("Failed to remove website")
                await sendEvent("error", {
                    message: "Website removal failed",
                    details: {
                        error: result.error,
                        canRemoveWebsite,
                        additionalProps
                    },
                    caller: "EditDialogWebsite handleRemove()"
                })
            }
        })
    }

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black/80 z-[100] grid place-items-center-safe animate-fadein data-[state=closed]:animate-fadeout" {...rest}>
            <Container className="!bg-background-950 min-w-2xs max-w-md dark:!bg-neutral-900 dark:!border-neutral-700">
                <div className="flex gap-2 items-center">
                    <h1 className="font-bold">Edit website</h1>
                    <Button variant={"ghost"} className="ml-auto" onClick={() => onClose(false)}><X /></Button>
                </div>
                <div className="flex flex-col gap-2 my-4">
                    <p>Currently editing: <b className="text-text-500">{additionalProps.url}</b></p>
                    <div className="flex gap-2">
                        <Button onClick={handlePreviewUpdate} disabled={updatingPending}>{
                            updatingPending ? <><LoaderCircle className="animate-spin" /> Updating...</> : <><RefreshCcw /> Update the preview</>
                        }</Button>
                        <Button variant={"destructive"} onClick={() => deleteConfirmationShownSet(true)} disabled={deleteConfirmationShown}><Trash /> Remove website</Button>
                    </div>

                    {deleteConfirmationShown && <div className="space-y-3 mt-2 border-[1px] border-red-500 p-3 rounded-sm bg-red-400/20 animate-in">
                        <p className="text-red-500 w-full text-balance">Are you sure you want to remove this website? This action is irreversible!</p>
                        <Input className="bg-white" placeholder="Enter full website url..." onChange={(e) => e.target.value === additionalProps.url ? canRemoveWebsiteSet(true) : canRemoveWebsiteSet(false)} />
                        <div className="flex gap-2 items-center">
                            <Button variant={"ghost"} onClick={() => deleteConfirmationShownSet(false)}>Cancel</Button>
                            <Button variant={"destructive"} disabled={!canRemoveWebsite || removingPending} onClick={handleRemove}>{
                                removingPending ? <><LoaderCircle className="animate-spin" /> Removing...</> : <><Trash /> Remove website</>
                            }</Button>
                        </div>
                    </div>}
                </div>
            </Container>
        </div>
    );
}

export default EditDialogWebsite;