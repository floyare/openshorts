import { defineDialogs } from "easy-dialogs";
import { lazy } from "react";

const AISearchDialog = lazy(() => import("@/components/dialogs/ai-search-dialog"));
const ConfirmationDialog = lazy(() => import("@/components/dialogs/confirmation-dialog"));
const EditDialogWebsite = lazy(() => import("@/components/dialogs/edit-website-dialog"));
const FeedbackDialog = lazy(() => import("@/components/dialogs/feedback-dialog"));
const ReportWebsiteDialog = lazy(() => import("@/components/dialogs/report-website-dialog"));
const UserBanDialog = lazy(() => import("@/components/dialogs/user-ban-dialog"));
const WebsiteDetailsDialog = lazy(() => import("@/components/dialogs/website-details-dialog"));

export const dialogs = defineDialogs([
    { id: "edit-website", component: EditDialogWebsite, useExitAnimation: true },
    { id: "ai-search", component: AISearchDialog, useExitAnimation: true },
    { id: "website-details", component: WebsiteDetailsDialog, useExitAnimation: true },
    { id: "confirmation-dialog", component: ConfirmationDialog, useExitAnimation: true },
    { id: "userban-dialog", component: UserBanDialog, useExitAnimation: true },
    { id: "report-dialog", component: ReportWebsiteDialog, useExitAnimation: true },
    { id: "feedback-dialog", component: FeedbackDialog, useExitAnimation: true },
])