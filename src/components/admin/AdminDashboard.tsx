import type { report, User, websites } from "@prisma/client";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDialogManager } from "easy-dialogs";
import { dialogs } from "@/lib/dialogs";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { debugLog } from "@/lib/log";
import { format } from "date-fns";
import type { BannedDetailsType } from "@/types/user";
import { getURLHost } from "@/lib/utils";

const PAGE_SIZE = 5;

const AdminDashboard = ({ websites, users, reports }: { websites: websites[], users: User[], reports: report[] }) => {
    const [localWebsites, localWebsitesSet] = useState<websites[]>(websites)
    const [localUsers, localUsersSet] = useState<User[]>(users)
    const [localReports, localReportsSet] = useState<report[]>(reports)

    const [websiteSearch, setWebsiteSearch] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [reportSearch, setReportSearch] = useState("");
    const [reportPage, setReportPage] = useState(1);
    const [websitePage, setWebsitePage] = useState(1);
    const [userPage, setUserPage] = useState(1);

    const { callDialog } = useDialogManager(dialogs)
    const [filteredWebsites, setFilteredWebsites] = useState(() =>
        websites.filter((w) =>
            w.name?.toLowerCase().includes(websiteSearch.toLowerCase())
        )
    );

    const [filteredUsers, setFilteredUsers] = useState(() =>
        users.filter((u) =>
            (u.name || u.email)
                ?.toLowerCase()
                .includes(userSearch.toLowerCase())
        )
    );

    const [filteredReport, setFilteredReports] = useState(() =>
        reports.filter((u) =>
            (u.content || u.type)
                ?.toLowerCase()
                .includes(reportSearch.toLowerCase())
        )
    );

    useMemo(() => {
        setFilteredWebsites(
            localWebsites.filter((w) =>
                w.name?.toLowerCase().includes(websiteSearch.toLowerCase())
            )
        );
    }, [localWebsites, websiteSearch]);

    useMemo(() => {
        setFilteredUsers(
            localUsers.filter((u) =>
                (u.name || u.email)
                    ?.toLowerCase()
                    .includes(userSearch.toLowerCase())
            )
        );
    }, [localUsers, userSearch]);

    useMemo(() => {
        setFilteredReports(
            localReports.filter((u) =>
                (u.content || u.type)
                    ?.toLowerCase()
                    .includes(reportSearch.toLowerCase())
            )
        );
    }, [localReports, reportSearch]);

    const paginatedWebsites = useMemo(
        () =>
            filteredWebsites.slice(
                (websitePage - 1) * PAGE_SIZE,
                websitePage * PAGE_SIZE
            ),
        [filteredWebsites, websitePage]
    );

    const paginatedUsers = useMemo(
        () =>
            filteredUsers.slice(
                (userPage - 1) * PAGE_SIZE,
                userPage * PAGE_SIZE
            ),
        [filteredUsers, userPage]
    );

    const paginatedReports = useMemo(
        () =>
            filteredReport.slice(
                (reportPage - 1) * PAGE_SIZE,
                reportPage * PAGE_SIZE
            ),
        [filteredReport, reportPage]
    );

    const handleWebsiteRemove = async (w: websites) => {
        const result = await callDialog("confirmation-dialog", {
            title: "Are you sure you want to remove this website?",
            description: "This action cannot be undone.",
            buttons: {
                cancel: {
                    label: "Cancel",
                    action: () => { }
                },
                confirm: {
                    label: "Remove",
                    action: async () => { },
                    variant: "destructive"
                }
            }
        })

        if (result) {
            const result = await actions.removeWebsite({ url: w.url })
            if (result.error) {
                toast.error("Failed to remove website. Please try again later.")
                debugLog("ERROR", 'Failed to remove website: ' + result.error.message);
                return
            }

            toast.success("Website removed successfully!");
            localWebsitesSet((prev) => prev.filter((website) =>
                website.id !== w.id
            ));
        }
    }

    const handleWebsiteHideToggle = async (w: websites) => {
        const result = await actions.admin.websiteVisibleToggle({ url: w.url, hidden: !w.hidden })
        if (result.error) {
            toast.error("Failed to hide toggle website. Please try again later.")
            debugLog("ERROR", 'Failed to hide toggle website: ' + result.error.message);
            return
        }

        w.hidden ? toast.success("Website unhided successfully!") : toast.success("Website hided successfully!");
        localWebsitesSet((prev) => prev.map((website) =>
            website.id === w.id ? { ...website, hidden: !website.hidden } : website
        ));
    }

    const handleBanUser = async (u: User) => {
        const result = await callDialog("userban-dialog", { user: u })
        if (!result) return;

        const banResult = await actions.admin.banUser({
            id: u.id,
            description: result.description,
            unban_date: result.unban_date.toString()
        });

        if (banResult.error) {
            toast.error("Failed to ban user. Please try again later.");
            debugLog("ERROR", 'Failed to ban user: ' + banResult.error.message);
            return;
        }

        toast.success("User banned successfully!");
    }

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Websites</CardTitle>
                    <Input
                        placeholder="Search websites..."
                        value={websiteSearch}
                        onChange={(e) => {
                            setWebsiteSearch(e.target.value);
                            setWebsitePage(1);
                        }}
                        className="mt-2"
                    />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Uploader</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedWebsites.map((w) => (
                                <TableRow key={w.id}>
                                    <TableCell>{w.name}</TableCell>
                                    <TableCell>{w.url}</TableCell>
                                    <TableCell>
                                        {w.created_at
                                            ? new Date(w.created_at).toLocaleDateString()
                                            : ""}
                                    </TableCell>
                                    <TableCell>{w.created_by}</TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant="destructive" size="sm" onClick={() => handleWebsiteRemove(w)}>Remove</Button>
                                        <Button variant="default" size="sm" onClick={() => handleWebsiteHideToggle(w)}>{w.hidden ? "Unhide" : "Hide"}</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {paginatedWebsites.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">
                                        No websites found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <div className="flex justify-between items-center mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={websitePage === 1}
                            onClick={() => setWebsitePage((p) => p - 1)}
                        >
                            Previous
                        </Button>
                        <span>
                            Page {websitePage} of {Math.max(1, Math.ceil(filteredWebsites.length / PAGE_SIZE))}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={websitePage * PAGE_SIZE >= filteredWebsites.length}
                            onClick={() => setWebsitePage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <Input
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => {
                            setUserSearch(e.target.value);
                            setUserPage(1);
                        }}
                        className="mt-2"
                    />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined at</TableHead>
                                <TableHead>Ban history</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell><a href={`/profile/${u.name}`} target="_blank" className="text-primary-600">{u.name}</a></TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>{u.role}</TableCell>
                                    <TableCell>{format(u.createdAt, "dd.MM.yyyy HH:mm")}</TableCell>
                                    <TableCell className="space-y-2">{((typeof u.banned_details === "string" ? JSON.parse(u.banned_details) : u.banned_details) as unknown as BannedDetailsType[]).map((ban, idx) => (
                                        <div key={idx} className="flex flex-col">
                                            <span>{ban.reason ?? "(no reason)"}</span>
                                            <span className="text-xs text-gray-500">
                                                Until: {ban.unban_date ? format(new Date(ban.unban_date), "dd.MM.yyyy HH:mm") : "No ban date"}
                                            </span>
                                        </div>
                                    ))}</TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant={"destructive"} onClick={() => handleBanUser(u)}>Ban</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {paginatedUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <div className="flex justify-between items-center mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={userPage === 1}
                            onClick={() => setUserPage((p) => p - 1)}
                        >
                            Previous
                        </Button>
                        <span>
                            Page {userPage} of {Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={userPage * PAGE_SIZE >= filteredUsers.length}
                            onClick={() => setUserPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <Input
                        placeholder="Search reports..."
                        value={reportSearch}
                        onChange={(e) => {
                            setReportSearch(e.target.value);
                            setReportPage(1);
                        }}
                        className="mt-2"
                    />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Website</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Content</TableHead>
                                <TableHead>Created at</TableHead>
                                <TableHead>Created by</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedReports.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.id}</TableCell>
                                    <TableCell><a href={`/website/${getURLHost(u.url)}`} target="_blank" className="text-primary-600">{u.url}</a></TableCell>
                                    <TableCell>{u.type}</TableCell>
                                    <TableCell><p className="max-w-xs break-words text-balance">{u.content}</p></TableCell>
                                    <TableCell>{format(u.created_at, "dd.MM.yyyy HH:mm")}</TableCell>
                                    <TableCell><a href={`/profile/${u.created_by}`} target="_blank" className="text-primary-600">{u.created_by}</a></TableCell>
                                </TableRow>
                            ))}

                            {paginatedReports.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">
                                        No reports found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <div className="flex justify-between items-center mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={reportPage === 1}
                            onClick={() => setReportPage((p) => p - 1)}
                        >
                            Previous
                        </Button>
                        <span>
                            Page {reportPage} of {Math.max(1, Math.ceil(filteredReport.length / PAGE_SIZE))}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={reportPage * PAGE_SIZE >= filteredReport.length}
                            onClick={() => setReportPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;