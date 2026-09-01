"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useLocale } from "next-intl"
import {
  Home, Users, UserSearch, TrendingUp, Settings,
  PlusCircle, PanelLeftClose, PanelLeftOpen, LogOut, Receipt, Menu, X,
} from "lucide-react"
import { auth } from "@/lib/firebase/client"
import { signOut as firebaseSignOut } from "firebase/auth"

interface EmployerData {
  companyName: string
  companyInitial: string
  contactPerson?: string | null
  jobCount: number
  logoUrl?: string | null
}

interface Props extends EmployerData {
  children: React.ReactNode
}

const NAV = [
  { href: "/employer/dashboard",  label: "Dashboard",    icon: Home,        iconColor: "text-[#1a3461]",  iconBg: "bg-[#eef2ff]", hasPostJob: true },
  { href: "/employer/responses",  label: "Responses",    icon: Users,       iconColor: "text-violet-600", iconBg: "bg-violet-50" },
  { href: "/employer/candidates", label: "Talent Search",icon: UserSearch,  iconColor: "text-emerald-600",iconBg: "bg-emerald-50" },
  { href: "/employer/plans",      label: "Plans",        icon: TrendingUp,  iconColor: "text-orange-500", iconBg: "bg-orange-50" },
  { href: "/employer/billing",    label: "Billing",      icon: Receipt,     iconColor: "text-teal-600",   iconBg: "bg-teal-50"   },
  { href: "/employer/profile",    label: "Settings",     icon: Settings,    iconColor: "text-gray-500",   iconBg: "bg-gray-100"  },
]

const W_EXPANDED = 240
const W_COLLAPSED = 60

export default function EmployerShell({ companyName, companyInitial, contactPerson, jobCount, logoUrl, children }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const locale = useLocale()

  async function handleSignOut() {
    await Promise.all([
      firebaseSignOut(auth),
      fetch("/api/auth/session", { method: "DELETE" }),
    ])
    window.location.href = `/${locale}`
  }

  const sidebarW = collapsed ? W_COLLAPSED : W_EXPANDED

  function isActive(href: string) {
    const full = `/${locale}${href}`
    if (href === "/employer/dashboard") return pathname === full
    return pathname.startsWith(full)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fc]">

      {/* ── Sidebar (fixed, desktop) ── */}
      <aside
        style={{ width: sidebarW }}
        className="hidden md:flex flex-col bg-white border-r border-gray-100 fixed top-0 left-0 h-screen z-20 shadow-sm transition-[width] duration-200 overflow-hidden"
      >
        {/* Top: Logo + toggle */}
        <div className={`border-b border-gray-100 flex shrink-0 ${collapsed ? "flex-col items-center justify-center py-2 px-1 gap-1.5 min-h-[80px]" : "h-16 items-center px-3 gap-2"}`}>
          {collapsed ? (
            /* Collapsed: running guy centered, then expand toggle */
            <>
              <Link href="/" title="Jobs24India" className="flex items-center justify-center" onClick={() => window.scrollTo(0, 0)}>
                <Image src="/logo-full.png" alt="Jobs24India" width={44} height={44} className="object-contain" />
              </Link>
              <button
                onClick={() => setCollapsed(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-[#1a3461] hover:bg-[#eef2ff] transition-colors"
                title="Expand sidebar"
              >
                <PanelLeftOpen size={15} />
              </button>
            </>
          ) : (
            /* Expanded: job24 brand logo fills header + collapse toggle */
            <>
              <Link href="/" className="flex items-center flex-1 min-w-0" onClick={() => window.scrollTo(0, 0)}>
                <Image src="/job24.png" alt="Jobs24India" width={130} height={40} className="object-contain shrink-0" />
              </Link>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#1a3461] hover:bg-[#eef2ff] transition-colors shrink-0"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            </>
          )}
        </div>

        {/* User info */}
        <div className={`border-b border-gray-50 shrink-0 ${collapsed ? "flex justify-center py-3 px-2" : "px-4 py-3"}`}>
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-[#1a3461] to-[#2a4a7f] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
              {logoUrl
                ? <Image src={logoUrl} alt={companyName} fill className="object-cover" sizes="36px" />
                : companyInitial}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{contactPerson || companyName}</p>
                <p className="text-[11px] text-gray-400 truncate">{companyName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto px-2">
          {NAV.map(({ href, label, icon: Icon, iconColor, iconBg, hasPostJob }) => {
            const active = isActive(href)
            return (
              <div key={href + label} className="flex items-center gap-1">
                <Link
                  href={`/${locale}${href}`}
                  title={collapsed ? label : undefined}
                  className={`flex-1 flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                    collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
                  } ${active ? "bg-[#1a3461] text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  {active ? (
                    <Icon size={17} className="text-white shrink-0" />
                  ) : (
                    <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                      <Icon size={15} className={iconColor} />
                    </div>
                  )}
                  {!collapsed && <span>{label}</span>}
                </Link>
                {hasPostJob && !collapsed && (
                  <Link
                    href={`/${locale}/employer/post-job`}
                    className="p-2 rounded-xl text-gray-400 hover:bg-[#eef2ff] hover:text-[#1a3461] transition-colors shrink-0"
                    title="Post a Job"
                  >
                    <PlusCircle size={16} />
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className={`border-t border-gray-100 bg-gray-50/50 shrink-0 ${collapsed ? "py-3 flex justify-center px-2" : "px-4 py-3"}`}>
          {collapsed ? (
            <div className="relative w-7 h-7 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center text-gray-600 font-bold text-xs shadow-sm">
              {logoUrl
                ? <Image src={logoUrl} alt={companyName} fill className="object-cover" sizes="28px" />
                : companyInitial}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center text-gray-600 font-bold text-xs shrink-0 shadow-sm">
                {logoUrl
                  ? <Image src={logoUrl} alt={companyName} fill className="object-cover" sizes="28px" />
                  : companyInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-700 truncate">{companyName}</p>
                <p className="text-[10px] text-gray-400">{jobCount} job{jobCount !== 1 ? "s" : ""} posted</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors text-xs font-medium"
                title="Sign out"
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content — margin syncs with sidebar width ── */}
      <main
        style={{ paddingLeft: sidebarW }}
        className="hidden md:block flex-1 transition-[padding] duration-200 w-full"
      >
        {children}
      </main>

      {/* Mobile: top bar + content */}
      <div className="md:hidden flex flex-col flex-1 min-h-screen w-full">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2" onClick={() => window.scrollTo(0, 0)}>
            <Image src="/logo-full.png" alt="Jobs24India" width={36} height={36} className="object-contain" />
            <span className="font-bold text-[#1a3461] text-sm truncate max-w-[130px]">{companyName}</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href={`/${locale}/employer/post-job`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1a3461] text-white text-xs font-bold"
            >
              <PlusCircle size={13} /> Post Job
            </Link>
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 flex flex-col" onClick={() => setMobileMenuOpen(false)}>
            <div className="h-14" /> {/* space for top bar */}
            <div className="bg-white border-b border-gray-100 shadow-xl px-4 py-3 flex flex-col gap-1" onClick={e => e.stopPropagation()}>
              {NAV.map(({ href, label, icon: Icon, iconColor, iconBg }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={`/${locale}${href}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-[#1a3461] text-white" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${active ? "bg-white/20" : iconBg} flex items-center justify-center shrink-0`}>
                      <Icon size={15} className={active ? "text-white" : iconColor} />
                    </div>
                    {label}
                  </Link>
                )
              })}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <LogOut size={15} className="text-red-500" />
                  </div>
                  Sign out
                </button>
              </div>
            </div>
            {/* backdrop */}
            <div className="flex-1 bg-black/20" />
          </div>
        )}

        <main className="flex-1 pb-16">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-1.5 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
          {NAV.slice(0, 4).map(({ href, label, icon: Icon, iconColor, iconBg }) => {
            const active = isActive(href)
            return (
              <Link key={href + label} href={`/${locale}${href}`} className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-0">
                {active ? (
                  <Icon size={20} className="text-[#1a3461]" />
                ) : (
                  <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}>
                    <Icon size={16} className={iconColor} />
                  </div>
                )}
                <span className={`text-[10px] font-semibold truncate ${active ? "text-[#1a3461]" : "text-gray-400"}`}>
                  {label === "Talent Search" ? "Talent" : label}
                </span>
              </Link>
            )
          })}
          <Link href={`/${locale}/employer/post-job`} className="flex flex-col items-center gap-0.5 px-2 py-1">
            <div className="w-8 h-8 rounded-xl bg-[#1a3461] flex items-center justify-center shadow-sm">
              <PlusCircle size={16} className="text-white" />
            </div>
            <span className="text-[10px] font-semibold text-gray-400">Post Job</span>
          </Link>
          <button onClick={handleSignOut} className="flex flex-col items-center gap-0.5 px-2 py-1">
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
              <LogOut size={16} className="text-red-400" />
            </div>
            <span className="text-[10px] font-semibold text-red-400">Sign out</span>
          </button>
        </nav>
      </div>

      {/* ── Footer (desktop only, inside sidebar offset) ── */}
      <footer
        style={{ paddingLeft: sidebarW }}
        className="hidden md:block transition-[padding] duration-200 bg-white border-t border-gray-100 text-xs text-gray-400 py-3 px-6 flex-shrink-0"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Jobs24India · All rights reserved</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-gray-600 transition-colors">Terms</a>
            <a href="mailto:support@jobs24india.com" className="hover:text-gray-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
