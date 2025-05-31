import { Edit } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useDialogManager } from "easy-dialogs";
import { dialogs } from "@/lib/dialogs";
import { useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { MAX_PROFILE_NAME_LENGTH, MIN_PROFILE_NAME_LENGTH } from "@/helpers/user.helper";

const ProfileNameUpdate = () => {
    const { callDialog } = useDialogManager(dialogs)
    const [newNickname, setNewNickname] = useState("");
    return (
        <div className="flex flex-col gap-2">
            <Input placeholder="Enter your new profile name..." maxLength={MAX_PROFILE_NAME_LENGTH} value={newNickname} onChange={(e) => setNewNickname(e.target.value)} />
            <div className="flex items-center gap-2">
                <Button disabled={newNickname.length < MIN_PROFILE_NAME_LENGTH || newNickname.length > MAX_PROFILE_NAME_LENGTH} onClick={async (e) => {
                    e.preventDefault()
                    await callDialog("confirmation-dialog", {
                        title: "Change profile name",
                        description: `Are you sure you want to change your profile name to "${newNickname}" ? This action cannot be undone.`,
                        buttons: {
                            confirm: {
                                label: "Change name",
                                variant: "destructive",
                                action: async () => {
                                    const result = await actions.user.updateUsername({
                                        username: newNickname
                                    })

                                    if (result.error) {
                                        toast.error("Failed to change profile name: " + result.error.message);
                                        return
                                    }

                                    toast.success("Profile name changed successfully!");
                                    window.location.replace("/profile/" + newNickname)
                                }
                            },
                            cancel: {
                                label: "Cancel",
                                variant: "outline",
                                action: () => { }
                            }
                        }
                    })
                }}><Edit /> Change name</Button>
                <Button variant={"ghost"} onClick={async (e) => {
                    e.preventDefault()
                    await callDialog("confirmation-dialog", {
                        title: "Keep current profile name",
                        description: `Are you sure you want to keep your current profile name? This action cannot be undone.`,
                        buttons: {
                            confirm: {
                                label: "Keep current name",
                                variant: "destructive",
                                action: async () => {
                                    const result = await actions.user.updateUsername({})

                                    if (result.error) {
                                        toast.error("Failed to keep profile name: " + result.error.message);
                                        return
                                    }

                                    window.location.replace("/profile/" + result.data.name);
                                }
                            },
                            cancel: {
                                label: "Cancel",
                                variant: "outline",
                                action: () => { }
                            }
                        }
                    })
                }}>Keep current name</Button>
            </div>
        </div>
    );
}

export default ProfileNameUpdate;