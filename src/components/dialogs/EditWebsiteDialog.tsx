import { RefreshCcw, Trash, X } from "lucide-react"
import Container from "../container"
import { Button } from "../ui/button"
import { useState, useTransition } from "react"
import { Input } from "../ui/input"

type EditDialogWebsiteProps = {
    onClose: (val: boolean) => void
    additionalProps: {
        url: string
    }
}

const EditDialogWebsite = ({ onClose, additionalProps }: EditDialogWebsiteProps) => {
    const [deleteConfirmationShown, deleteConfirmationShownSet] = useState(false)
    const [canRemoveWebsite, canRemoveWebsiteSet] = useState(false)
    const [isPending, setTransition] = useTransition()

    const handleRemove = async () => {
        if (!canRemoveWebsite) return

    }

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black/80 z-[100] grid place-items-center-safe">
            <Container className="!bg-background-950 min-w-2xs">
                <div className="flex gap-2 items-center">
                    <h1 className="font-bold">Edit website</h1>
                    <Button variant={"ghost"} className="ml-auto" onClick={() => onClose(false)}><X /></Button>
                </div>
                <div className="flex flex-col gap-2 my-4">
                    <p>Currently editing: {additionalProps.url}</p>
                    <Button><RefreshCcw /> Update website's preview</Button>
                    <Button variant={"destructive"} onClick={() => deleteConfirmationShownSet(true)} disabled={deleteConfirmationShown}><Trash /> Remove website</Button>

                    {deleteConfirmationShown && <div className="space-y-2 mt-6">
                        <p className="text-red-500 max-w-2xs w-fit text-balance">Are you sure you want to remove this website? This action is irreversible!</p>
                        <Input placeholder="Enter full website url..." onChange={(e) => e.target.value === additionalProps.url ? canRemoveWebsiteSet(true) : canRemoveWebsiteSet(false)} />
                        <div className="flex gap-2 items-center">
                            <Button>Cancel</Button>
                            <Button variant={"destructive"} disabled={!canRemoveWebsite} onClick={handleRemove}><Trash /> Remove website</Button>
                        </div>
                    </div>}
                </div>
            </Container>
        </div>
    );
}

export default EditDialogWebsite;