"use client"

import React, { useState } from "react"
import { Heart, TrendingUp, Calendar, CreditCard, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const quickAmounts = [1000, 5000, 10000, 50000]
const categories = ["Tithes", "Offerings", "Building Fund", "Missions", "Special Seed"]

const givingHistory = [
  { id: "1", date: "2026-03-09", amount: 10000, category: "Tithes", status: "successful" as const, reference: "TXN_20260309001" },
  { id: "2", date: "2026-03-09", amount: 5000, category: "Offerings", status: "successful" as const, reference: "TXN_20260309002" },
  { id: "3", date: "2026-03-02", amount: 10000, category: "Tithes", status: "successful" as const, reference: "TXN_20260302001" },
  { id: "4", date: "2026-02-23", amount: 10000, category: "Tithes", status: "successful" as const, reference: "TXN_20260223001" },
  { id: "5", date: "2026-02-23", amount: 25000, category: "Building Fund", status: "successful" as const, reference: "TXN_20260223002" },
  { id: "6", date: "2026-02-16", amount: 10000, category: "Tithes", status: "successful" as const, reference: "TXN_20260216001" },
  { id: "7", date: "2026-02-09", amount: 10000, category: "Tithes", status: "failed" as const, reference: "TXN_20260209001" },
  { id: "8", date: "2026-02-09", amount: 50000, category: "Missions", status: "successful" as const, reference: "TXN_20260209002" },
  { id: "9", date: "2026-01-26", amount: 10000, category: "Tithes", status: "successful" as const, reference: "TXN_20260126001" },
  { id: "10", date: "2026-01-12", amount: 3000, category: "Special Seed", status: "successful" as const, reference: "TXN_20260112001" },
]

const totalThisYear = givingHistory
  .filter((g) => g.status === "successful")
  .reduce((sum, g) => sum + g.amount, 0)

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount)
}

export default function GivingPage() {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("Tithes")
  const [isRecurring, setIsRecurring] = useState(false)
  const [activeTab, setActiveTab] = useState("give")

  const handleGive = () => {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount < 100) {
      toast.error("Please enter an amount of at least 100 Naira")
      return
    }
    toast.success(`${isRecurring ? "Recurring" : "One-time"} gift of ${formatNaira(numAmount)} for ${category} initiated!`)
    setAmount("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Giving</h2>
        <p className="text-muted-foreground">Give cheerfully and support the work of God.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Given (2026)</p>
              <p className="text-lg font-bold">{formatNaira(totalThisYear)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Month</p>
              <p className="text-lg font-bold">{formatNaira(25000)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-lg font-bold">{givingHistory.filter((g) => g.status === "successful").length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="give">Give Now</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="give" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Make a Gift
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Amounts */}
              <div>
                <Label className="text-sm mb-2 block">Quick Amount</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {quickAmounts.map((qa) => (
                    <Button
                      key={qa}
                      variant={amount === qa.toString() ? "default" : "outline"}
                      className="text-sm"
                      onClick={() => setAmount(qa.toString())}
                    >
                      {formatNaira(qa)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <Label htmlFor="amount" className="text-sm mb-2 block">
                  Custom Amount (NGN)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Category */}
              <div>
                <Label className="text-sm mb-2 block">Category</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={category === cat ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Recurring Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Recurring Donation</p>
                    <p className="text-xs text-muted-foreground">Give automatically every month</p>
                  </div>
                </div>
                <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
              </div>

              <Separator />

              {/* Summary */}
              {amount && (
                <div className="rounded-lg bg-primary/5 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">{formatNaira(parseFloat(amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span>{category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span>{isRecurring ? "Monthly Recurring" : "One-time"}</span>
                  </div>
                </div>
              )}

              {/* Give Button */}
              <Button
                size="lg"
                className="w-full text-lg h-12"
                onClick={handleGive}
                disabled={!amount || parseFloat(amount) < 100}
              >
                <Heart className="h-5 w-5 mr-2" />
                Give {amount ? formatNaira(parseFloat(amount)) : "Now"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Giving History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {givingHistory.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="text-sm">
                          {new Date(g.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{g.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{formatNaira(g.amount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={g.status === "successful" ? "default" : "destructive"}
                            className="text-[10px]"
                          >
                            {g.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-mono">
                          {g.reference}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
