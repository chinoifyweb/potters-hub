import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_HOSTNAMES: string[] = [];

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
      const rewriteRes = NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
      rewriteRes.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      return rewriteRes;
    }

    const subRes = NextResponse.next();
    subRes.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    subRes.headers.set("Pragma", "no-cache");
    subRes.headers.set("Expires", "0");
    return subRes;
  }

  // --- MAIN DOMAIN ROUTING (tphc.org.ng) ---

  // Public routes - always accessible
  if (
    pathname === "/" ||
    pathname.startsWith("/sermons") ||
    pathname.startsWith("/devotionals") ||
    pathname.startsWith("/events") ||
    pathname.startsWith("/give") ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/children") ||
    pathname.startsWith("/workers") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/devotionals") ||
    pathname.startsWith("/api/children-sermons") ||
    pathname.startsWith("/api/workers-meetings") ||
    pathname.startsWith("/api/sermons") ||
    pathname.startsWith("/api/events") ||
    pathname.startsWith("/api/blog") ||
    pathname.startsWith("/api/donations") ||
    pathname.startsWith("/api/bible") ||
    pathname.startsWith("/api/groups") ||
    pathname.startsWith("/api/posts") ||
    pathname.startsWith("/api/children") ||
    pathname.startsWith("/api/files/") ||
    pathname.startsWith("/download") ||
    pathname.startsWith("/d/") ||

    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/debug") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Pastor's Portal - requires pastor or admin role
  if (pathname.startsWith("/pastors")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== "pastor" && token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Pastor messages API - requires pastor or admin role
  if (pathname.startsWith("/api/pastor-messages")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (token.role !== "pastor" && token.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // Auth pages - redirect to dashboard if already logged in
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (token) {
      const role = token.role as string;
      if (role === "admin" || role === "pastor") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!token) {
    // For API routes, return JSON 401 so the frontend doesn't try to parse HTML
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes on main domain - redirect to admin subdomain
  if (pathname.startsWith("/admin")) {
    if (token.role !== "admin" && token.role !== "pastor") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Defense-in-depth: make sure nothing (LiteSpeed, Cloudflare, browser
    // bfcache) caches authenticated admin HTML. If the session is killed,
    // the next navigation must re-hit the origin and re-run middleware so
    // the redirect-to-login fires.
    const adminRes = NextResponse.next();
    adminRes.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    adminRes.headers.set("Pragma", "no-cache");
    adminRes.headers.set("Expires", "0");
    return adminRes;
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
