import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useDialogManager } from "easy-dialogs";
import { dialogs } from "@/lib/dialogs";

const FeedbackButton = () => {
    const { callDialog } = useDialogManager(dialogs)
    return (
        <>
            <Button onClick={() => callDialog("feedback-dialog")}>
                <MessageCircle /> Send feedback
            </Button>
        </>
    );
}

export default FeedbackButton;