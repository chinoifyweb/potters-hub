import { NextResponse } from "next/server"

/**
 * Hard-logout endpoint.
 *
 * NextAuth's built-in `signOut()` sometimes fails to fully clear the session
 * cookie when `cookies.sessionToken.options.domain` is explicitly set (e.g.
 * `.tphc.org.ng`) and the request originates from a different host variant
 * (www vs apex vs subdomain). This endpoint nukes every plausible variant
 * of the session + CSRF + callback cookies across every plausible domain
 * so the browser can't keep a stale JWT alive.
 *
 * Call this from the client AFTER `signOut({ redirect: false })` and then
 * do a full-page reload to `/login?t=<timestamp>` to bust any RSC cache.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true })

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
  ]

  const domains = [".tphc.org.ng", "tphc.org.ng", "www.tphc.org.ng", "admin.tphc.org.ng", ""]

  for (const name of cookieNames) {
    for (const domain of domains) {
      res.cookies.set({
        name,
        value: "",
        expires: new Date(0),
        maxAge: 0,
        path: "/",
        ...(domain ? { domain } : {}),
        ...(name.startsWith("__Secure-") || name.startsWith("__Host-")
          ? { secure: true, sameSite: "lax" as const }
          : {}),
      })
    }
  }

  // Also tell any caches not to hold onto the response
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private")
  res.headers.set("Pragma", "no-cache")
  res.headers.set("Expires", "0")

  return res
}

export async function GET() {
  return POST()
}
