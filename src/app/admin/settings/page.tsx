"use client"

import { useState } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  MapPin,
  MoreHorizontal,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface Branch {
  id: string
  name: string
  address: string
  city: string
  pastor: string
  phone: string
  status: "active" | "inactive"
}

const sampleBranches: Branch[] = [
  { id: "1", name: "Main Campus", address: "123 Church Street", city: "Lagos", pastor: "Pastor David Wilson", phone: "+234 801 234 5678", status: "active" },
  { id: "2", name: "East Campus", address: "456 Faith Avenue", city: "Lagos", pastor: "Pastor Grace Lee", phone: "+234 802 345 6789", status: "active" },
  { id: "3", name: "North Campus", address: "789 Hope Road", city: "Abuja", pastor: "Pastor Samuel Eze", phone: "+234 803 456 7890", status: "active" },
  { id: "4", name: "Island Campus", address: "321 Victory Lane", city: "Lagos", pastor: "Pastor Ruth James", phone: "+234 804 567 8901", status: "inactive" },
]

const donationCategories = ["Tithe", "Offering", "Building Fund", "Missions", "Welfare", "Special Seed"]

const generalSettings = [
  { key: "church_name", label: "Church Name", value: "Grace Community Church", type: "text" },
  { key: "timezone", label: "Timezone", value: "Africa/Lagos", type: "text" },
  { key: "currency", label: "Currency", value: "NGN", type: "text" },
  { key: "max_upload_size", label: "Max Upload Size (MB)", value: "50", type: "number" },
  { key: "enable_donations", label: "Enable Online Donations", value: "true", type: "boolean" },
  { key: "enable_livestream", label: "Enable Livestream", value: "true", type: "boolean" },
  { key: "maintenance_mode", label: "Maintenance Mode", value: "false", type: "boolean" },
]

export default function AdminSettingsPage() {
  const [branchDialogOpen, setBranchDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage church profile and platform configuration</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="profile">Church Profile</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="categories">Donation Categories</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>

        {/* Church Profile */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Church Profile</CardTitle>
              <CardDescription>Update your church information displayed on the app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Church Name</Label>
                  <Input defaultValue="Grace Community Church" />
                </div>
                <div className="space-y-2">
                  <Label>Senior Pastor</Label>
                  <Input defaultValue="Pastor David Wilson" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>About</Label>
                <Textarea
                  defaultValue="Grace Community Church is a vibrant, multi-cultural church committed to spreading the gospel of Jesus Christ and making disciples of all nations. Founded in 2005, we have grown to serve over 600 members across multiple campuses."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center border">
                    <span className="text-2xl font-bold text-muted-foreground">GC</span>
                  </div>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="info@gracechurch.org" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+234 801 234 5678" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input defaultValue="https://gracechurch.org" />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input defaultValue="123 Church Street, Lagos, Nigeria" />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-semibold">Social Media Links</Label>
                <div className="grid gap-4 sm:grid-cols-2 mt-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Facebook</Label>
                    <Input defaultValue="https://facebook.com/gracechurch" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Instagram</Label>
                    <Input defaultValue="https://instagram.com/gracechurch" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">YouTube</Label>
                    <Input defaultValue="https://youtube.com/@gracechurch" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Twitter/X</Label>
                    <Input defaultValue="https://x.com/gracechurch" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Founded Year</Label>
                <Input defaultValue="2005" type="number" className="max-w-[200px]" />
              </div>

              <Button onClick={() => toast.success("Church profile updated!")}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branches */}
        <TabsContent value="branches" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Church Branches</CardTitle>
                <CardDescription>Manage branch locations</CardDescription>
              </div>
              <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Add Branch</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add Branch</DialogTitle>
                    <DialogDescription>Add a new church branch location.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Branch Name</Label>
                      <Input placeholder="e.g., South Campus" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>Address</Label>
                        <Input placeholder="Street address" />
                      </div>
                      <div className="grid gap-2">
                        <Label>City</Label>
                        <Input placeholder="City" />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>Pastor</Label>
                        <Input placeholder="Branch pastor" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Phone</Label>
                        <Input placeholder="Phone number" />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>Latitude</Label>
                        <Input placeholder="e.g., 6.5244" type="number" step="any" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Longitude</Label>
                        <Input placeholder="e.g., 3.3792" type="number" step="any" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBranchDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => { toast.success("Branch added"); setBranchDialogOpen(false) }}>Add Branch</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Address</TableHead>
                    <TableHead className="hidden md:table-cell">Pastor</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{branch.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {branch.address}, {branch.city}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{branch.pastor}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{branch.phone}</TableCell>
                      <TableCell>
                        <Badge variant={branch.status === "active" ? "default" : "secondary"}>
                          {branch.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donation Categories */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Donation Categories</CardTitle>
                <CardDescription>Manage giving categories for the church</CardDescription>
              </div>
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Category</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                    <DialogDescription>Create a new donation category.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Category Name</Label>
                      <Input placeholder="e.g., Youth Ministry" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description (optional)</Label>
                      <Input placeholder="Brief description" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => { toast.success("Category added"); setCategoryDialogOpen(false) }}>Add</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {donationCategories.map((cat, index) => (
                  <div key={cat} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                      <span className="font-medium">{cat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Platform configuration and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generalSettings.map((setting) => (
                <div key={setting.key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-sm">{setting.label}</p>
                    <p className="text-xs text-muted-foreground">Key: {setting.key}</p>
                  </div>
                  {setting.type === "boolean" ? (
                    <Badge variant={setting.value === "true" ? "default" : "secondary"}>
                      {setting.value === "true" ? "Enabled" : "Disabled"}
                    </Badge>
                  ) : (
                    <Input defaultValue={setting.value} className="max-w-[250px]" />
                  )}
                </div>
              ))}
              <Button onClick={() => toast.success("Settings saved!")}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
