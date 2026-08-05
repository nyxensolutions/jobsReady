"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Search, FileText, User } from "lucide-react"
import { useEffect, useState } from "react"

export default function SeekerBottomNav() {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const [isSeeker, setIsSeeker] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.role === "SEEKER") setIsSeeker(true) })
      .catch(() => {})
  }, [])

  if (!isSeeker) return null

  const stripped = pathname.replace(/^\/[a-z]{2}(?=\/)/, "")

  const tabs = [
    { href: "/jobs",             label: t("findJobs"),    icon: Search   },
    { href: "/seeker/dashboard#applications", label: t("applications"), icon: FileText },
    { href: "/seeker/profile",   label: t("profile"),     icon: User     },
  ]

  return (
    <>
      {/* Spacer so content isn't hidden behind the nav */}
      <div className="h-16 md:hidden" />
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200">
        <div className="flex items-stretch h-16">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = stripped === href || stripped.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
                  ${active ? "text-[#1a3461]" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`text-[10px] font-semibold tracking-wide uppercase ${active ? "text-[#1a3461]" : ""}`}>
                  {label}
                </span>
                {active && <span className="absolute top-0 w-8 h-0.5 bg-[#1a3461] rounded-b-full" />}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
