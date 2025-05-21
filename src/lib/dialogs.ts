import AISearchDialog from "@/components/dialogs/AISearchDialog";
import EditDialogWebsite from "@/components/dialogs/EditWebsiteDialog";
import { WebsiteDetailsDialog } from "@/components/dialogs/WebsiteDetailsDialog";

export const dialogs = [
    { id: "edit-website", component: EditDialogWebsite },
    { id: "ai-search", component: AISearchDialog },
    { id: "website-details", component: WebsiteDetailsDialog },
] as const