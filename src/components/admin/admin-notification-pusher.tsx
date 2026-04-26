"use client"

import type { User, notification_type } from "@prisma/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { actions } from "astro:actions";
import { toast } from "sonner";
import Textarea from "../ui/textarea";

interface AdminNotificationPusherProps {
    users: User[];
}

const AdminNotificationPusher = ({ users }: AdminNotificationPusherProps) => {
    const [type, setType] = useState<notification_type>("INFO");
    const [name, setName] = useState("");
    const [content, setContent] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const userOptions = users.map(user => ({
        label: user.name,
        value: user.id
    }));

    const handlePush = async () => {
        if (!content) {
            toast.error("Content is required");
            return;
        }

        setLoading(true);
        const result = await actions.admin.pushNotification({
            notification_type: type,
            name: name || undefined,
            content: content,
            user_targets: selectedUsers
        });

        if (result.error) {
            toast.error("Failed to push notification: " + result.error.message);
        } else {
            toast.success("Notification pushed successfully!");
            setName("");
            setContent("");
            setSelectedUsers([]);
        }
        setLoading(false);
    };

    return (
        <Card className="w-full col-span-2">
            <CardHeader>
                <CardTitle>Push Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as notification_type)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INFO">INFO</SelectItem>
                            <SelectItem value="WARNING">WARNING</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Name (Optional)</Label>
                    <Input
                        placeholder="Notification name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                        placeholder="Notification content..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Target Users (Leave empty for broadcast)</Label>
                    <MultiSelect
                        options={userOptions}
                        onValueChange={setSelectedUsers}
                        defaultValue={selectedUsers}
                        placeholder="Select users..."
                    />
                </div>

                <Button onClick={handlePush} disabled={loading} className="w-full">
                    {loading ? "Pushing..." : "Push Notification"}
                </Button>
            </CardContent>
        </Card>
    );
};

export default AdminNotificationPusher;
