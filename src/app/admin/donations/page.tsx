"use client"

import { useState } from "react"
import {
  Search,
  Download,
  Heart,
  TrendingUp,
  RefreshCcw,
  DollarSign,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { toast } from "sonner"

const donationTrendsData = [
  { month: "Jan", amount: 45000 },
  { month: "Feb", amount: 52000 },
  { month: "Mar", amount: 48000 },
  { month: "Apr", amount: 61000 },
  { month: "May", amount: 55000 },
  { month: "Jun", amount: 67000 },
  { month: "Jul", amount: 59000 },
  { month: "Aug", amount: 72000 },
  { month: "Sep", amount: 68000 },
  { month: "Oct", amount: 74000 },
  { month: "Nov", amount: 81000 },
  { month: "Dec", amount: 95000 },
]

interface Donation {
  id: string
  donor: string
  amount: number
  category: string
  date: string
  status: "completed" | "pending" | "failed"
  reference: string
  recurring: boolean
}

const sampleDonations: Donation[] = [
  { id: "1", donor: "John Doe", amount: 500, category: "Tithe", date: "2026-03-12", status: "completed", reference: "TXN-001234", recurring: true },
  { id: "2", donor: "Mary Smith", amount: 1000, category: "Offering", date: "2026-03-12", status: "completed", reference: "TXN-001235", recurring: false },
  { id: "3", donor: "Anonymous", amount: 5000, category: "Building Fund", date: "2026-03-11", status: "completed", reference: "TXN-001236", recurring: false },
  { id: "4", donor: "Grace Johnson", amount: 200, category: "Missions", date: "2026-03-11", status: "completed", reference: "TXN-001237", recurring: true },
  { id: "5", donor: "Michael Chen", amount: 750, category: "Tithe", date: "2026-03-10", status: "completed", reference: "TXN-001238", recurring: true },
  { id: "6", donor: "Ruth Garcia", amount: 300, category: "Welfare", date: "2026-03-10", status: "pending", reference: "TXN-001239", recurring: false },
  { id: "7", donor: "David Lee", amount: 150, category: "Offering", date: "2026-03-09", status: "failed", reference: "TXN-001240", recurring: false },
  { id: "8", donor: "Esther Okafor", amount: 2000, category: "Tithe", date: "2026-03-09", status: "completed", reference: "TXN-001241", recurring: true },
  { id: "9", donor: "Peter Nakamura", amount: 400, category: "Building Fund", date: "2026-03-08", status: "completed", reference: "TXN-001242", recurring: false },
  { id: "10", donor: "Hannah Adams", amount: 600, category: "Missions", date: "2026-03-08", status: "completed", reference: "TXN-001243", recurring: true },
]

const donationCategories = ["Tithe", "Offering", "Building Fund", "Missions", "Welfare", "Special Seed"]

const stats = [
  { title: "Total Donations", value: "$777,000", icon: Heart, color: "text-red-600", bg: "bg-red-50" },
  { title: "This Month", value: "$24,500", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
  { title: "Average Donation", value: "$485", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { title: "Recurring Active", value: "45", icon: RefreshCcw, color: "text-purple-600", bg: "bg-purple-50" },
]

export default function AdminDonationsPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)

  const filtered = sampleDonations.filter((d) => {
    const matchSearch = d.donor.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === "all" || d.category === categoryFilter
    const matchStatus = statusFilter === "all" || d.status === statusFilter
    return matchSearch && matchCategory && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
          <p className="text-muted-foreground">Track and manage church giving</p>
        </div>
        <Button variant="outline" onClick={() => toast.success("CSV export started")}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Donation Trends</CardTitle>
          <CardDescription>Monthly donation totals over the past year</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={donationTrendsData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Bar dataKey="amount" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Recent Donations</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search donors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {donationCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{donation.donor}</span>
                      {donation.recurring && (
                        <RefreshCcw className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">${donation.amount.toLocaleString()}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{donation.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(donation.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        donation.status === "completed"
                          ? "default"
                          : donation.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {donation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">
                    {donation.reference}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Donation Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Donation Categories</CardTitle>
            <CardDescription>Manage giving categories</CardDescription>
          </div>
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Category</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Add Donation Category</DialogTitle>
                <DialogDescription>Create a new donation category.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Category Name</Label>
                  <Input placeholder="e.g., Youth Ministry" />
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
          <div className="flex flex-wrap gap-2">
            {donationCategories.map((cat) => (
              <div key={cat} className="flex items-center gap-1 rounded-lg border px-3 py-1.5">
                <span className="text-sm">{cat}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="mr-2 h-3 w-3" />Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-3 w-3" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
