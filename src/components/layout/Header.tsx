"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import LocaleSwitcher from "@/components/layout/LocaleSwitcher"

export default function Header() {
  const t = useTranslations("nav")
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              JR
            </div>
            <span className="font-bold text-lg text-blue-700 hidden sm:block">JobsReady</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/jobs" className="hover:text-blue-600 transition-colors">
              {t("findJobs")}
            </Link>
            <Link href="/employer/register" className="hover:text-blue-600 transition-colors">
              {t("forEmployers")}
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              {t("login")}
            </Link>
            <Link
              href="/employer/post-job"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {t("postJob")}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
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
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4 text-sm font-medium text-gray-700">
          <Link href="/jobs" onClick={() => setMobileOpen(false)}>{t("findJobs")}</Link>
          <Link href="/employer/register" onClick={() => setMobileOpen(false)}>{t("forEmployers")}</Link>
          <Link href="/login" onClick={() => setMobileOpen(false)}>{t("login")}</Link>
          <Link
            href="/employer/post-job"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            {t("postJob")}
          </Link>
        </div>
      )}
    </header>
  )
}
