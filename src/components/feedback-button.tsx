import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useDialogManager } from "easy-dialogs";
import { dialogs } from "@/lib/dialogs";

// TODO: cos tu zfixowac bo sie robi drzewo renderow czy cos w googlu przez to
// przez to ze jest importowany easy-dialogs tutaj i w innych komponentach to te inne komponenty tu daje
const FeedbackButton = () => {
    const { callDialog } = useDialogManager(dialogs)
    return (
        <>
            <Button onClick={() => callDialog("feedback-dialog")} className="md:flex hidden">
                <MessageCircle /> Send feedback
            </Button>
        </>
    );
}

export default FeedbackButton;