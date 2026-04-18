"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserPlus, HardHat, Send, FileText, Image as ImageIcon, BookOpen, Calendar, TrendingUp, FolderUp, Baby, Mic, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Stats {
  members: { total: number; newThisMonth: number };
  workers: { total: number; byDepartment: Record<string, number> };
  firstTimers: { total: number; last7Days: number; last30Days: number };
  outreach: { sentLast7Days: number; sentTotal: number; failedLast7Days: number };
  files: { total: number; totalSizeBytes: number; downloadsTotal: number };
  sermons: { totalPublished: number; lastSermonDate: string | null };
  childrenManual: { totalPublished: number; lastEntryDate: string | null };
}

interface ActivityItem { type: string; title: string; subtitle: string; time: string; icon: string; status?: string }
interface Charts { memberGrowth: Array<{ month: string; count: number }>; outreachByDay: Array<{ day: string; sent: number; failed: number }> }

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [charts, setCharts] = useState<Charts | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, c, a] = await Promise.all([
          fetch("/api/admin/dashboard/stats").then(r => r.json()),
          fetch("/api/admin/dashboard/charts").then(r => r.json()),
          fetch("/api/admin/dashboard/activity").then(r => r.json()),
        ]);
        setStats(s);
        setCharts(c);
        setActivity(a.activity || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening at The Potter&apos;s House Church today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Members" value={stats?.members.total ?? 0} subtitle={`+${stats?.members.newThisMonth ?? 0} this month`} icon={<Users className="h-5 w-5" />} tone="green" />
        <KpiCard title="First Timers" value={stats?.firstTimers.total ?? 0} subtitle={`${stats?.firstTimers.last7Days ?? 0} this week`} icon={<UserPlus className="h-5 w-5" />} tone="amber" />
        <KpiCard title="Workers" value={stats?.workers.total ?? 0} subtitle={`${Object.keys(stats?.workers.byDepartment ?? {}).length} department(s)`} icon={<HardHat className="h-5 w-5" />} tone="blue" />
        <KpiCard title="Messages Sent (7d)" value={stats?.outreach.sentLast7Days ?? 0} subtitle={`${stats?.outreach.failedLast7Days ?? 0} failed`} icon={<Send className="h-5 w-5" />} tone="purple" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Files Hosted" value={stats?.files.total ?? 0} subtitle={formatBytes(stats?.files.totalSizeBytes ?? 0) + " total"} icon={<FolderUp className="h-5 w-5" />} tone="gray" small />
        <KpiCard title="Published Sermons" value={stats?.sermons.totalPublished ?? 0} subtitle={stats?.sermons.lastSermonDate ? `Last: ${new Date(stats.sermons.lastSermonDate).toLocaleDateString()}` : "—"} icon={<Mic className="h-5 w-5" />} tone="gray" small />
        <KpiCard title="Children&apos;s Manual" value={stats?.childrenManual.totalPublished ?? 0} subtitle={stats?.childrenManual.lastEntryDate ? `Last: ${new Date(stats.childrenManual.lastEntryDate).toLocaleDateString()}` : "—"} icon={<Baby className="h-5 w-5" />} tone="gray" small />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Member Growth · last 6 months</CardTitle></CardHeader>
          <CardContent className="h-72">
            {charts?.memberGrowth.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.memberGrowth}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#991b1b" strokeWidth={2.5} dot={{ r: 4 }} name="New members" />
                </LineChart>
              </ResponsiveContainer>
            ) : <Empty label="No new members in the last 6 months" /> }
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Outreach · last 14 days</CardTitle></CardHeader>
          <CardContent className="h-72">
            {charts?.outreachByDay.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.outreachByDay}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#059669" name="Sent" />
                  <Bar dataKey="failed" fill="#dc2626" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty label="No outreach activity in the last 14 days" /> }
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <QuickLink href="/admin/members" icon={<Users className="h-4 w-4" />} label="Members" />
              <QuickLink href="/admin/visitors" icon={<UserPlus className="h-4 w-4" />} label="First Timers" />
              <QuickLink href="/admin/workers" icon={<HardHat className="h-4 w-4" />} label="Workers" />
              <QuickLink href="/admin/outreach" icon={<Send className="h-4 w-4" />} label="Send Outreach" />
              <QuickLink href="/admin/files" icon={<FolderUp className="h-4 w-4" />} label="Files / Downloads" />
              <QuickLink href="/admin/children-sermons" icon={<Baby className="h-4 w-4" />} label="Children&apos;s Manual" />
              <QuickLink href="/admin/sermons" icon={<Mic className="h-4 w-4" />} label="Sermons" />
              <QuickLink href="/admin/events" icon={<Calendar className="h-4 w-4" />} label="Events" />
            </CardContent>
          </Card>

          {Object.keys(stats?.workers.byDepartment ?? {}).length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Workers by Department</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(stats!.workers.byDepartment).map(([dept, count]) => (
                  <div key={dept} className="flex justify-between items-center text-sm">
                    <span>{dept}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {activity.length === 0 ? <Empty label="No recent activity yet" /> : (
              <div className="space-y-2">
                {activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                    <div className="text-xl">{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="font-medium truncate">{a.title}</span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">{timeAgo(a.time)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{a.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon, tone, small = false }: { title: string; value: number | string; subtitle: string; icon: React.ReactNode; tone: "green" | "amber" | "blue" | "purple" | "gray"; small?: boolean }) {
  const toneClasses: Record<string, string> = {
    green: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    gray: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  };
  return (
    <Card>
      <CardContent className={small ? "pt-4 pb-4" : "pt-6 pb-6"}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={`p-2 rounded-md ${toneClasses[tone]}`}>{icon}</div>
        </div>
        <div className={small ? "text-xl font-bold" : "text-3xl font-bold"}>{typeof value === "number" ? value.toLocaleString() : value}</div>
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      </CardContent>
    </Card>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted text-sm group">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <span>{label}</span>
      </div>
      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="h-full flex items-center justify-center text-sm text-muted-foreground">{label}</div>;
}
