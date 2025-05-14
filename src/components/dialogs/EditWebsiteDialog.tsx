import { Button } from "../ui/button"

type EditDialogWebsiteProps = {
    onClose: (val: boolean) => void
    additionalProps: {
        url: string
    }
}

const EditDialogWebsite = ({ onClose, additionalProps }: EditDialogWebsiteProps) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-red-500/30 z-[100]">
            <Button onClick={() => onClose(true)}>close</Button>
        </div>
    );
}

export default EditDialogWebsite;