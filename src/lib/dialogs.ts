import AISearchDialog from "@/components/dialogs/AISearchDialog";
import EditDialogWebsite from "@/components/dialogs/EditWebsiteDialog";
import { WebsiteDetailsDialog } from "@/components/dialogs/WebsiteDetailsDialog";

export const dialogs = [
    { id: "edit-website", component: EditDialogWebsite, useExitAnimation: true },
    { id: "ai-search", component: AISearchDialog, useExitAnimation: true },
    { id: "website-details", component: WebsiteDetailsDialog, useExitAnimation: true },
] as const