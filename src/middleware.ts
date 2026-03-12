import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

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
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
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

  // Admin routes - require admin role
  if (pathname.startsWith("/admin")) {
    if (token.role !== "admin" && token.role !== "pastor") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
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
