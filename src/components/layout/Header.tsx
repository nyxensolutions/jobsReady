"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Menu, X, User, Briefcase, LogOut, ChevronDown } from "lucide-react"
import LocaleSwitcher from "@/components/layout/LocaleSwitcher"
import NotificationBell from "@/components/layout/NotificationBell"
import { auth } from "@/lib/firebase/client"
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"

type AuthUser = {
  name: string
  role: "SEEKER" | "EMPLOYER" | "ADMIN"
  initial: string
}

type Props = {
  initialAuth?: AuthUser | null
}

// Segments where the public header should be hidden (they have their own nav)
const HIDE_HEADER_SEGMENTS = ["/employer/", "/seeker/", "/admin"]

export default function Header({ initialAuth }: Props) {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authUser, setAuthUser] = useState<AuthUser | null>(initialAuth ?? null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only listen for client-side auth changes (sign-out / new sign-in)
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setAuthUser(null); return }
      // Only fetch if auth state changed from the server-provided initial
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) { setAuthUser(null); return }
        const data = await res.json()
        setAuthUser({
          name: data.name ?? "User",
          role: data.role ?? "SEEKER",
          initial: (data.name ?? "U")[0].toUpperCase(),
        })
      } catch {
        setAuthUser(null)
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  async function signOut() {
    setMenuOpen(false)
    setAuthUser(null)
    await Promise.all([
      firebaseSignOut(auth),
      fetch("/api/auth/session", { method: "DELETE" }),
    ])
    window.location.href = "/"
  }

  const dashboardHref = authUser?.role === "EMPLOYER" ? "/employer/dashboard"
    : authUser?.role === "ADMIN" ? "/admin"
    : "/seeker/dashboard"

  // Hide on portal pages — they have their own sidebar nav
  if (HIDE_HEADER_SEGMENTS.some(s => pathname.includes(s))) return null

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — goes to dashboard if logged in, home if not */}
          <Link href={authUser ? dashboardHref : "/"} className="flex items-center gap-2 shrink-0">
            <Image src="/logo-full.png" alt="Jobs Ready" width={44} height={44} className="object-contain" />
            <span className="font-bold text-lg text-[#1a3461] tracking-tight">
              Jobs<span className="text-orange-500">Ready</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            {authUser?.role !== "EMPLOYER" && (
              <Link
                href="/jobs"
                className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-[#1a3461] hover:bg-[#f0f4ff] hover:border-[#1a3461] transition-all"
              >
                🔍 {t("findJobs")}
              </Link>
            )}
            {!authUser && (
              <Link
                href="/login?role=employer"
                className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-[#1a3461] hover:bg-[#f0f4ff] hover:border-[#1a3461] transition-all"
              >
                🏢 {t("forEmployers")}
              </Link>
            )}
            {authUser?.role !== "EMPLOYER" && (
              <Link
                href="/blog"
                className="text-sm font-semibold text-gray-600 hover:text-[#1a3461] px-3 py-2 transition-colors"
              >
                Career Guide
              </Link>
            )}
            {authUser?.role === "SEEKER" && (
              <>
                <Link href="/seeker/dashboard#applications" className="text-sm font-semibold text-gray-600 hover:text-[#1a3461] px-3 py-2 transition-colors">
                  {t("applications")}
                </Link>
                <Link href="/seeker/saved-jobs" className="text-sm font-semibold text-gray-600 hover:text-[#1a3461] px-3 py-2 transition-colors">
                  {t("savedJobs")}
                </Link>
              </>
            )}
            {authUser?.role === "EMPLOYER" && (
              <>
                <Link href="/employer/dashboard" className="text-sm font-semibold text-gray-600 hover:text-[#1a3461] px-3 py-2 transition-colors">
                  {t("dashboard")}
                </Link>
                <Link href="/employer/dashboard#jobs" className="text-sm font-semibold text-gray-600 hover:text-[#1a3461] px-3 py-2 transition-colors">
                  {t("myJobs")}
                </Link>
                <Link href="/employer/responses" className="text-sm font-semibold text-gray-600 hover:text-[#1a3461] px-3 py-2 transition-colors">
                  {t("responses")}
                </Link>
                <Link href="/employer/candidates" className="text-sm font-semibold text-gray-600 hover:text-[#1a3461] px-3 py-2 transition-colors">
                  {t("talentSearch")}
                </Link>
              </>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <LocaleSwitcher />

            {authUser ? (
              <>
                <NotificationBell />
                {/* User avatar dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1a3461] text-white text-sm font-bold flex items-center justify-center shrink-0">
                      {authUser.initial}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">{authUser.name}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-11 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1">
                      <Link
                        href={dashboardHref}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Briefcase size={15} className="text-gray-400" />
                        {authUser.role === "EMPLOYER" ? t("employerDashboard") : authUser.role === "ADMIN" ? t("adminPanel") : t("myDashboard")}
                      </Link>
                      {authUser.role === "SEEKER" && (
                        <>
                          <Link
                            href="/seeker/profile"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <User size={15} className="text-gray-400" />
                            {t("profile")}
                          </Link>
                          <Link
                            href="/seeker/saved-jobs"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Briefcase size={15} className="text-gray-400" />
                            {t("savedJobs")}
                          </Link>
                        </>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={signOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} /> {t("signOut")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-[#1a3461] px-3 py-2 transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/login?role=employer&next=/employer/post-job"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-[#1a3461] text-white text-sm font-semibold hover:bg-[#142a52] transition-colors shadow-sm"
                >
                  {t("postJob")}
                </Link>
              </>
            )}

            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-3">
          {authUser?.role !== "EMPLOYER" && (
            <Link href="/jobs" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-[#1a3461]">
              🔍 {t("findJobs")}
            </Link>
          )}
          {!authUser && (
            <Link href="/login?role=employer" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-[#1a3461]">
              🏢 {t("forEmployers")}
            </Link>
          )}
          {authUser?.role !== "EMPLOYER" && (
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-[#1a3461]">
              📖 Career Guide
            </Link>
          )}
          {authUser?.role === "SEEKER" && (
            <>
              <Link href="/seeker/dashboard#applications" onClick={() => setMobileOpen(false)} className="px-4 py-2 text-sm font-semibold text-[#1a3461]">{t("applications")}</Link>
              <Link href="/seeker/saved-jobs" onClick={() => setMobileOpen(false)} className="px-4 py-2 text-sm font-semibold text-[#1a3461]">{t("savedJobs")}</Link>
            </>
          )}
          {authUser?.role === "EMPLOYER" && (
            <>
              <Link href="/employer/dashboard" onClick={() => setMobileOpen(false)} className="px-4 py-2 text-sm font-semibold text-[#1a3461]">{t("dashboard")}</Link>
              <Link href="/employer/dashboard#jobs" onClick={() => setMobileOpen(false)} className="px-4 py-2 text-sm font-semibold text-[#1a3461]">{t("myJobs")}</Link>
              <Link href="/employer/responses" onClick={() => setMobileOpen(false)} className="px-4 py-2 text-sm font-semibold text-[#1a3461]">{t("responses")}</Link>
              <Link href="/employer/candidates" onClick={() => setMobileOpen(false)} className="px-4 py-2 text-sm font-semibold text-[#1a3461]">{t("talentSearch")}</Link>
            </>
          )}
          {authUser ? (
            <button onClick={signOut} className="text-left px-4 py-2 text-sm text-red-600">{t("signOut")}</button>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="px-4 py-2 text-sm text-slate-600">{t("login")}</Link>
              <Link href="/login?role=employer&next=/employer/post-job" onClick={() => setMobileOpen(false)} className="flex items-center justify-center px-4 py-3 rounded-xl bg-[#1a3461] text-white font-semibold text-sm">
                {t("postJob")}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
