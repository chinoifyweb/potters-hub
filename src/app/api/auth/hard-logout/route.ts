import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Nukes all NextAuth-related cookies across every domain variant they might
 * have been set on. We use raw Set-Cookie headers (appended, not deduped via
 * NextResponse.cookies.set) so the browser receives multiple Set-Cookie lines
 * for the same cookie name with different Domain attributes.
 *
 * Per RFC 6265, to delete a cookie you must match its original Path AND Domain.
 * If the cookie was set with Domain=.tphc.org.ng, a Max-Age=0 without that
 * Domain won't delete it — so we cover every permutation.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.headers.set("Pragma", "no-cache");

  const cookieNames = [
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
    "__Host-next-auth.csrf-token",
    "next-auth.csrf-token",
    "__Secure-next-auth.callback-url",
    "next-auth.callback-url",
    "__Secure-next-auth.pkce.code_verifier",
    "next-auth.pkce.code_verifier",
    "__Secure-next-auth.state",
    "next-auth.state",
  ];
  const domains = [".tphc.org.ng", "tphc.org.ng", "www.tphc.org.ng", "admin.tphc.org.ng", ""];

  for (const name of cookieNames) {
    for (const domain of domains) {
      const parts: string[] = [];
      parts.push(`${name}=`);
      parts.push("Path=/");
      parts.push("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
      parts.push("Max-Age=0");
      if (domain) parts.push(`Domain=${domain}`);
      if (name.startsWith("__Secure-") || name.startsWith("__Host-")) {
        parts.push("Secure");
        parts.push("SameSite=Lax");
      }
      res.headers.append("Set-Cookie", parts.join("; "));
    }
  }

  return res;
}

export async function GET() {
  return POST();
}
