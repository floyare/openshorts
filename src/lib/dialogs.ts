import AISearchDialog from "@/components/dialogs/AISearchDialog";
import EditDialogWebsite from "@/components/dialogs/EditWebsiteDialog";

export const dialogs = [
    { id: "edit-website", component: EditDialogWebsite },
    { id: "ai-search", component: AISearchDialog }
] as const