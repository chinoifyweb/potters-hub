"use client"

import { useState } from "react"
import {
  Send,
  Bell,
  Mail,
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Campaign {
  id: string
  title: string
  type: "push" | "email" | "sms"
  target: string
  sentAt: string
  status: "sent" | "scheduled" | "draft"
  recipients: number
  opened: number
}

const sampleCampaigns: Campaign[] = [
  { id: "1", title: "Easter Service Reminder", type: "push", target: "All Members", sentAt: "2026-03-12 09:00", status: "sent", recipients: 654, opened: 432 },
  { id: "2", title: "Weekly Newsletter - March Week 2", type: "email", target: "All Members", sentAt: "2026-03-11 08:00", status: "sent", recipients: 654, opened: 389 },
  { id: "3", title: "Youth Conference Registration", type: "push", target: "Youth Group", sentAt: "2026-03-10 15:00", status: "sent", recipients: 120, opened: 98 },
  { id: "4", title: "Women's Retreat Invite", type: "email", target: "Women Members", sentAt: "2026-03-15 10:00", status: "scheduled", recipients: 280, opened: 0 },
  { id: "5", title: "Tithing Reminder", type: "sms", target: "All Members", sentAt: "2026-03-09 07:00", status: "sent", recipients: 450, opened: 450 },
  { id: "6", title: "Prayer Chain Update", type: "push", target: "Prayer Warriors", sentAt: "2026-03-08 20:00", status: "sent", recipients: 45, opened: 38 },
  { id: "7", title: "New Member Welcome", type: "email", target: "New Members (March)", sentAt: "", status: "draft", recipients: 12, opened: 0 },
]

export default function AdminCommunicationsPage() {
  const [activeTab, setActiveTab] = useState("push")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
        <p className="text-muted-foreground">Send notifications, emails, and SMS campaigns</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="push" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Push</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">SMS</span>
          </TabsTrigger>
        </TabsList>

        {/* Push Notifications Tab */}
        <TabsContent value="push" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Push Notification</CardTitle>
              <CardDescription>Send a push notification to church members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="Notification title" />
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      <SelectItem value="leaders">Leaders Only</SelectItem>
                      <SelectItem value="youth">Youth Group</SelectItem>
                      <SelectItem value="women">Women Members</SelectItem>
                      <SelectItem value="men">Men Members</SelectItem>
                      <SelectItem value="new">New Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Write your notification message..." rows={3} />
              </div>
              <div className="flex gap-3">
                <Button onClick={() => toast.success("Notification sent successfully!")}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Now
                </Button>
                <Button variant="outline" onClick={() => toast.success("Notification scheduled")}>
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Email Campaign</CardTitle>
              <CardDescription>Send an email to church members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input placeholder="Email subject line" />
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      <SelectItem value="leaders">Leaders Only</SelectItem>
                      <SelectItem value="youth">Youth Group</SelectItem>
                      <SelectItem value="women">Women Members</SelectItem>
                      <SelectItem value="men">Men Members</SelectItem>
                      <SelectItem value="new">New Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Body</Label>
                <Textarea placeholder="Write your email content..." rows={8} />
              </div>
              <div className="flex gap-3">
                <Button onClick={() => toast.success("Email sent successfully!")}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button variant="outline" onClick={() => toast.success("Email scheduled")}>
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
                <Button variant="ghost" onClick={() => toast.success("Draft saved")}>
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Tab */}
        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send SMS Campaign</CardTitle>
              <CardDescription>Send a text message to church members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    <SelectItem value="leaders">Leaders Only</SelectItem>
                    <SelectItem value="youth">Youth Group</SelectItem>
                    <SelectItem value="women">Women Members</SelectItem>
                    <SelectItem value="men">Men Members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Message (160 characters max)</Label>
                <Textarea placeholder="Write your SMS message..." rows={3} maxLength={160} />
              </div>
              <Button onClick={() => toast.success("SMS sent successfully!")}>
                <Send className="mr-2 h-4 w-4" />
                Send SMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Campaign History */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign History</CardTitle>
          <CardDescription>Past and scheduled communications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden sm:table-cell">Target</TableHead>
                <TableHead className="hidden md:table-cell">Recipients</TableHead>
                <TableHead className="hidden lg:table-cell">Opened</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {campaign.type === "push" && <Bell className="mr-1 h-3 w-3" />}
                      {campaign.type === "email" && <Mail className="mr-1 h-3 w-3" />}
                      {campaign.type === "sms" && <MessageSquare className="mr-1 h-3 w-3" />}
                      {campaign.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{campaign.target}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {campaign.recipients}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {campaign.opened > 0 ? (
                      <span className="text-sm">
                        {campaign.opened} ({Math.round((campaign.opened / campaign.recipients) * 100)}%)
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        campaign.status === "sent"
                          ? "default"
                          : campaign.status === "scheduled"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {campaign.status === "sent" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {campaign.status === "scheduled" && <Clock className="mr-1 h-3 w-3" />}
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {campaign.sentAt || "Not scheduled"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
