import AISearchDialog from "@/components/dialogs/AISearchDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import EditDialogWebsite from "@/components/dialogs/EditWebsiteDialog";
import FeedbackDialog from "@/components/dialogs/FeedbackDialog";
import ReportWebsiteDialog from "@/components/dialogs/ReportWebsiteDialog";
import UserBanDialog from "@/components/dialogs/UserBanDialog";
import { WebsiteDetailsDialog } from "@/components/dialogs/WebsiteDetailsDialog";

export const dialogs = [
    { id: "edit-website", component: EditDialogWebsite, useExitAnimation: true },
    { id: "ai-search", component: AISearchDialog, useExitAnimation: true },
    { id: "website-details", component: WebsiteDetailsDialog, useExitAnimation: true },
    { id: "confirmation-dialog", component: ConfirmationDialog, useExitAnimation: true },
    { id: "userban-dialog", component: UserBanDialog, useExitAnimation: true },
    { id: "report-dialog", component: ReportWebsiteDialog, useExitAnimation: true },
    { id: "feedback-dialog", component: FeedbackDialog, useExitAnimation: true }
] as const