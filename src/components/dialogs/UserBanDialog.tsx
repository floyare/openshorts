import type { User } from "@prisma/client";
import Container from "../container";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";

type UserBanDialogProps = {
    onClose: (val: { description: string, unban_date: Date } | null) => void
    additionalProps: {
        user: User
    }
}

const UserBanDialog = ({ onClose, additionalProps, ...rest }: UserBanDialogProps) => {
    return (
        <Dialog open onOpenChange={() => onClose(null)}>
            <DialogContent className="flex flex-col gap-2 overflow-y-auto !max-h-full py-6 data-[state=closed]:!animate-fadeout animate-fadein" {...rest}>
                <Container className="dark:!bg-neutral-900 dark:!border-neutral-700">
                    <h1 className="font-bold">Banning user: {additionalProps.user.name}</h1>
                    <form
                        className="flex flex-col gap-4 mt-4"
                        onSubmit={e => {
                            e.preventDefault();

                            const banObject = {
                                description: (e.currentTarget.elements.namedItem("description") as HTMLTextAreaElement).value,
                                unban_date: (e.currentTarget.elements.namedItem("unban_date") as HTMLInputElement).value
                                    ? new Date((e.currentTarget.elements.namedItem("unban_date") as HTMLInputElement).value)
                                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            }

                            console.log('submiting', banObject)
                            onClose(banObject);
                        }}
                    >
                        <label className="flex flex-col gap-1">
                            <span className="font-medium">Ban Description</span>
                            <textarea
                                name="description"
                                className="border rounded px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-neutral-800"
                                placeholder="Reason for banning this user..."
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="font-medium">Banned Until</span>
                            <input
                                name="unban_date"
                                type="datetime-local"
                                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-neutral-800"
                            />
                        </label>
                        <div className="flex justify-end gap-2 mt-2">
                            <Button variant="secondary" type="button" onClick={() => onClose(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" type="submit">
                                Ban User
                            </Button>
                        </div>
                    </form>
                </Container>
            </DialogContent >
        </Dialog >
    );
}

export default UserBanDialog;