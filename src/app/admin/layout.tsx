"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Video,
  Radio,
  Calendar,
  UsersRound,
  Heart,
  BookOpen,
  FileText,
  Image,
  MessageSquare,
  Send,
  Settings,
  Bell,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ChurchLogoIcon } from "@/components/church-logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const sidebarNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Members", href: "/admin/members", icon: Users },
  { title: "Sermons", href: "/admin/sermons", icon: Video },
  { title: "Livestream", href: "/admin/livestream", icon: Radio },
  { title: "Events", href: "/admin/events", icon: Calendar },
  { title: "Groups", href: "/admin/groups", icon: UsersRound },
  { title: "Donations", href: "/admin/donations", icon: Heart },
  { title: "Devotionals", href: "/admin/devotionals", icon: BookOpen },
  { title: "Blog", href: "/admin/blog", icon: FileText },
  { title: "Gallery", href: "/admin/gallery", icon: Image },
  { title: "Community", href: "/admin/community", icon: MessageSquare },
  { title: "Communications", href: "/admin/communications", icon: Send },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

function SidebarNav({
  collapsed,
  onItemClick,
}: {
  collapsed: boolean
  onItemClick?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-2">
      {sidebarNavItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href)
        const Icon = item.icon

        const linkContent = (
          <Link
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        )

        if (collapsed) {
          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {item.title}
              </TooltipContent>
            </Tooltip>
          )
        }

        return <React.Fragment key={item.href}>{linkContent}</React.Fragment>
      })}
    </nav>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden border-r bg-card transition-all duration-300 md:flex md:flex-col",
            collapsed ? "md:w-[68px]" : "md:w-[260px]"
          )}
        >
          {/* Sidebar Header */}
          <div
            className={cn(
              "flex h-16 items-center border-b px-4",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            {!collapsed && (
              <Link href="/admin" className="flex items-center gap-2">
                <ChurchLogoIcon size={28} />
                <div>
                  <span className="text-lg font-bold">Potter&apos;s Hub</span>
                  <p className="text-[11px] text-muted-foreground">Admin Panel</p>
                </div>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8"
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* Sidebar Navigation */}
          <ScrollArea className="flex-1 py-4">
            <SidebarNav collapsed={collapsed} />
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="border-t p-4">
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>PA</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">Pastor Admin</p>
                  <p className="truncate text-xs text-muted-foreground">
                    admin@church.org
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>PA</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <SheetHeader className="border-b p-4">
                    <SheetTitle className="flex items-center gap-2">
                      <ChurchLogoIcon size={24} />
                      Potter&apos;s Hub
                    </SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-80px)] py-4">
                    <SidebarNav
                      collapsed={false}
                      onItemClick={() => setMobileOpen(false)}
                    />
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              <Link
                href="/admin"
                className="flex items-center gap-2 md:hidden"
              >
                <ChurchLogoIcon size={24} />
                <span className="font-bold">Potter&apos;s Hub</span>
              </Link>
            </div>

            {/* Right side: notifications + profile */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-destructive" />
              </Button>

              <Separator orientation="vertical" className="mx-1 h-6" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>PA</AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium md:inline-block">
                      Pastor Admin
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}
