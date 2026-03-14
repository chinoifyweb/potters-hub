import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_HOSTNAMES = ["admin.tphc.org.ng", "admin.localhost:3000"];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  const isAdminSubdomain = ADMIN_HOSTNAMES.some((h) => hostname.includes(h.split(":")[0]));

  // --- ADMIN SUBDOMAIN ROUTING (admin.tphc.org.ng) ---
  if (isAdminSubdomain) {
    // Allow static files and Next.js internals
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/webhooks") ||
      pathname.startsWith("/api/debug") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // Login/signup pages on admin subdomain
    if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
      if (token) {
        const role = token.role as string;
        if (role === "admin" || role === "pastor") {
          return NextResponse.rewrite(new URL("/admin", request.url));
        }
        // Non-admin users on admin subdomain get redirected to main site
        const mainUrl = new URL("/dashboard", request.url);
        mainUrl.hostname = "tphc.org.ng";
        return NextResponse.redirect(mainUrl);
      }
      return NextResponse.next();
    }

    // All other paths on admin subdomain require auth
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Only admin/pastor roles allowed on admin subdomain
    if (token.role !== "admin" && token.role !== "pastor") {
      const mainUrl = new URL("/dashboard", request.url);
      mainUrl.hostname = "tphc.org.ng";
      return NextResponse.redirect(mainUrl);
    }

    // Rewrite root "/" on admin subdomain to "/admin"
    if (pathname === "/" || pathname === "") {
      return NextResponse.rewrite(new URL("/admin", request.url));
    }

    // If path doesn't start with /admin, rewrite to /admin prefix
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
    }

    return NextResponse.next();
  }

  // --- MAIN DOMAIN ROUTING (tphc.org.ng) ---

  // Public routes - always accessible
  if (
    pathname === "/" ||
    pathname.startsWith("/sermons") ||
    pathname.startsWith("/events") ||
    pathname.startsWith("/give") ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/debug") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Auth pages - redirect to dashboard if already logged in
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (token) {
      const role = token.role as string;
      if (role === "admin" || role === "pastor") {
        // Redirect admins to admin subdomain
        const adminUrl = new URL("/", request.url);
        adminUrl.hostname = "admin.tphc.org.ng";
        return NextResponse.redirect(adminUrl);
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes on main domain - redirect to admin subdomain
  if (pathname.startsWith("/admin")) {
    if (token.role !== "admin" && token.role !== "pastor") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Redirect to admin subdomain
    const adminUrl = new URL(pathname.replace("/admin", "/") || "/", request.url);
    adminUrl.hostname = "admin.tphc.org.ng";
    return NextResponse.redirect(adminUrl);
  }

  // API admin routes
  if (pathname.startsWith("/api/admin")) {
    if (token.role !== "admin" && token.role !== "pastor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
