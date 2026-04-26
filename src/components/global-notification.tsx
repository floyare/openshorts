import { authClient } from "@/lib/auth-client";
import { dialogs } from "@/lib/dialogs";
import { debugLog } from "@/lib/log";
import type { User } from "@prisma/client";
import { actions } from "astro:actions";
import { useDialogManager } from "easy-dialogs";
import { useEffect, useMemo } from "react";
import useSWR from "swr";

const GlobalNotificationComponent = () => {
    const { data: currentUser } = authClient.useSession()
    const { callDialog } = useDialogManager(dialogs)

    const STORAGE_KEY = `notifications_fetched_${currentUser?.user.id}`;

    const { data, error, isLoading, mutate } = useSWR(
        currentUser?.user?.id ? ['user-notifications', currentUser.user.id] : null,
        ([, userId]) => actions.user.getUserNotifications(userId),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            revalidateOnMount: false,
            revalidateIfStale: false,
        }
    );

    useEffect(() => {
        if (!currentUser?.user?.id) return;

        const alreadyFetched = sessionStorage.getItem(STORAGE_KEY);

        if (alreadyFetched) return;

        sessionStorage.setItem(STORAGE_KEY, 'true');
        mutate();
    }, [currentUser?.user?.id, mutate]);

    useEffect(() => {
        if (data?.data !== undefined) {
            const notifications = data.data

            debugLog("SUCCESS", 'Notifications fetched', notifications)

            notifications.forEach((n) => {
                debugLog("INFO", 'Found notification: ', n)
                callDialog("confirmation-dialog", {
                    title: n.name ?? (n.notification_type === "INFO" ? "Notification" : "You have been warned!"),
                    description: n.content ?? "No content",
                    buttons: {
                        confirm: {
                            label: "I Understand",
                            action: () => { }
                        },
                    }
                })
            })
        }
    }, [data, isLoading, error])

    return (
        <></>
    );
}

export default GlobalNotificationComponent;