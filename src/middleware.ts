import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { NextRequest, NextResponse } from "next/server"

const intlMiddleware = createMiddleware(routing)

const PROTECTED_SEGMENTS = [
  "/seeker/dashboard",
  "/seeker/profile",
  "/seeker/saved-jobs",
  "/seeker/notifications",
  "/employer/dashboard",
  "/employer/post-job",
  "/employer/profile",
  "/employer/candidates",
  "/employer/jobs",
  "/admin",
]

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Strip locale prefix for segment matching (e.g. /hi/seeker/dashboard → /seeker/dashboard)
  const stripped = pathname.replace(/^\/[a-z]{2}(?=\/)/, "")

  const isProtected = PROTECTED_SEGMENTS.some((s) => stripped === s || stripped.startsWith(s + "/"))

  if (isProtected && !req.cookies.get("firebase-session")) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
}
