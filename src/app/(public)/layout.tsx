"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChurchLogoIcon } from "@/components/church-logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/sermons", label: "Sermons" },
  { href: "/devotionals", label: "Devotionals" },
  { href: "/children", label: "Children Manual" },
  { href: "/workers", label: "Workers Manual" },
  { href: "/intercessory", label: "Intercessory" },
  { href: "/events", label: "Events" },
  { href: "/give", label: "Give" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <ChurchLogoIcon size={36} />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground leading-tight">Potter&apos;s Hub</span>
            <span className="text-[9px] text-muted-foreground leading-none tracking-wide">Transforming Lives, Remolding Destinies</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === link.href
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/pastors"
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1",
              pathname?.startsWith("/pastors")
                ? "text-amber-700 bg-amber-50"
                : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            )}
          >
            <Shield className="h-3.5 w-3.5" />
            Pastor&apos;s Portal
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-2">
          {session ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <nav className="flex flex-col p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  pathname === link.href
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/pastors"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "px-3 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                pathname?.startsWith("/pastors")
                  ? "text-amber-700 bg-amber-50"
                  : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              )}
            >
              <Shield className="h-4 w-4" />
              Pastor&apos;s Portal
            </Link>
            <div className="pt-3 border-t mt-2 flex flex-col gap-2">
              {session ? (
                <Button variant="outline" asChild>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Log In
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Church Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ChurchLogoIcon size={36} />
              <span className="text-xl font-bold text-white">Potter&apos;s Hub</span>
            </div>
            <p className="text-sm leading-relaxed italic">
              Transforming Lives, Remolding Destinies.
            </p>
            <p className="text-sm leading-relaxed">
              A community of believers growing together in faith, hope, and love.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-primary transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-primary transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-primary transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-primary transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h3 className="text-white font-semibold mb-4">Service Times</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <p className="text-white font-medium">Celebration Service</p>
                <p>8:00 AM</p>
              </li>
              <li>
                <p className="text-white font-medium">Revival Prayer Hour (Tuesday)</p>
                <p>5:00 PM</p>
              </li>
              <li>
                <p className="text-white font-medium">School of Wealth Creation (2nd/3rd Sunday)</p>
                <p>10:00 AM</p>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Welfare Quarters, Makurdi, Benue State, Nigeria</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+234 XXX XXX XXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@thepottershousechurch.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Potter&apos;s Hub — The Potter&apos;s House Church. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
