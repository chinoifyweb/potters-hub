"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Video,
  BookOpen,
  Calendar,
  UsersRound,
  Heart,
  MessageSquare,
  Mail,
  StickyNote,
  Sunrise,
  Image,
  Bell,
  Settings,
  Menu,
  LogOut,
  ChevronLeft,
  Church,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

const sidebarNavItems = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Sermons", href: "/dashboard/sermons", icon: Video },
  { title: "Bible", href: "/dashboard/bible", icon: BookOpen },
  { title: "Events", href: "/dashboard/events", icon: Calendar },
  { title: "Groups", href: "/dashboard/groups", icon: UsersRound },
  { title: "Giving", href: "/dashboard/giving", icon: Heart },
  { title: "Community", href: "/dashboard/community", icon: MessageSquare },
  { title: "Messages", href: "/dashboard/messages", icon: Mail },
  { title: "Notes", href: "/dashboard/notes", icon: StickyNote },
  { title: "Devotionals", href: "/dashboard/devotionals", icon: Sunrise },
  { title: "Gallery", href: "/dashboard/gallery", icon: Image },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: 3 },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

const mobileNavItems = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Sermons", href: "/dashboard/sermons", icon: Video },
  { title: "Bible", href: "/dashboard/bible", icon: BookOpen },
  { title: "Events", href: "/dashboard/events", icon: Calendar },
  { title: "More", href: "#more", icon: Menu },
]

function SidebarNav({ collapsed, onNavClick }: { collapsed: boolean; onNavClick?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-2">
      {sidebarNavItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? item.title : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge variant="destructive" className="h-5 min-w-[20px] justify-center px-1.5 text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  const currentPage = sidebarNavItems.find((item) =>
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href)
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r bg-card transition-all duration-300",
          sidebarCollapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* Sidebar Header */}
        <div className={cn("flex items-center gap-3 p-4", sidebarCollapsed && "justify-center px-2")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Church className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold truncate">Potter's Hub</h2>
              <p className="text-[11px] text-muted-foreground truncate">Welcome home</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 shrink-0", sidebarCollapsed && "hidden")}
            onClick={() => setSidebarCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Sidebar Nav */}
        <ScrollArea className="flex-1 py-3">
          <SidebarNav collapsed={sidebarCollapsed} />
        </ScrollArea>

        {/* Sidebar Footer */}
        <Separator />
        <div className={cn("p-3", sidebarCollapsed && "flex justify-center")}>
          {sidebarCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarCollapsed(false)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/avatars/user.jpg" />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-[11px] text-muted-foreground truncate">john@example.com</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4 lg:px-6">
          {/* Mobile Menu Trigger */}
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Church className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Potter's Hub</h2>
                  <p className="text-[11px] text-muted-foreground">Welcome home</p>
                </div>
              </div>
              <Separator />
              <ScrollArea className="h-[calc(100vh-140px)] py-3">
                <SidebarNav collapsed={false} onNavClick={() => setMobileSheetOpen(false)} />
              </ScrollArea>
              <Separator />
              <div className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatars/user.jpg" />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">John Doe</p>
                    <p className="text-[11px] text-muted-foreground truncate">john@example.com</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Page Title */}
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {currentPage?.title || "Dashboard"}
            </h1>
          </div>

          {/* Header Actions */}
          <Link href="/dashboard/notifications" className="relative">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-5 w-5" />
            </Button>
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              3
            </span>
          </Link>

          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src="/avatars/user.jpg" />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">JD</AvatarFallback>
          </Avatar>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-center justify-around border-t bg-card px-1 py-1.5 safe-area-bottom">
        {mobileNavItems.map((item) => {
          if (item.href === "#more") {
            return (
              <button
                key="more"
                onClick={() => setMobileSheetOpen(true)}
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.title}</span>
              </button>
            )
          }

          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
