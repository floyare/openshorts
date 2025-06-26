import { lazy } from "react";

const AISearchDialog = lazy(() => import("@/components/dialogs/AISearchDialog"));
const ConfirmationDialog = lazy(() => import("@/components/dialogs/ConfirmationDialog"));
const EditDialogWebsite = lazy(() => import("@/components/dialogs/EditWebsiteDialog"));
const FeedbackDialog = lazy(() => import("@/components/dialogs/FeedbackDialog"));
const ReportWebsiteDialog = lazy(() => import("@/components/dialogs/ReportWebsiteDialog"));
const UserBanDialog = lazy(() => import("@/components/dialogs/UserBanDialog"));
const WebsiteDetailsDialog = lazy(() => import("@/components/dialogs/WebsiteDetailsDialog"));

export const dialogs = [
    { id: "edit-website", component: EditDialogWebsite, useExitAnimation: true },
    { id: "ai-search", component: AISearchDialog, useExitAnimation: true },
    { id: "website-details", component: WebsiteDetailsDialog, useExitAnimation: true },
    { id: "confirmation-dialog", component: ConfirmationDialog, useExitAnimation: true },
    { id: "userban-dialog", component: UserBanDialog, useExitAnimation: true },
    { id: "report-dialog", component: ReportWebsiteDialog, useExitAnimation: true },
    { id: "feedback-dialog", component: FeedbackDialog, useExitAnimation: true }
] as const