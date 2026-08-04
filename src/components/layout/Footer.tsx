"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

const NO_FOOTER_SEGMENTS = ["/employer/", "/seeker/", "/admin"]

export default function Footer() {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const hide = NO_FOOTER_SEGMENTS.some((s) => pathname.includes(s))
  if (hide) return null

  return (
    <footer className="bg-gray-900 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <Image src="/logo-full.png" alt="Jobs Ready" width={32} height={32} className="object-contain" />
              <span className="font-bold text-white text-base">Jobs<span className="text-blue-400">Ready</span></span>
            </div>
            <p className="text-gray-600 text-xs mb-3">
              A product of{" "}
              <a href="https://www.nyxensolutions.net" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                NyxenSolutions
              </a>
            </p>
            <p className="text-gray-500 text-xs leading-relaxed">
              India's trusted job portal for blue-collar and frontline workers.
            </p>
            <a href="tel:+919953699143" className="inline-flex items-center gap-1.5 mt-3 text-xs text-gray-400 hover:text-white transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +91 99536 99143
            </a>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Job Seekers</h4>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="hover:text-white transition-colors">{t("findJobs")}</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Create Profile</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Browse Categories</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Employers</h4>
            <ul className="space-y-2">
              <li><Link href="/employer/post-job" className="hover:text-white transition-colors">{t("postJob")}</Link></li>
              <li><Link href="/employer/register" className="hover:text-white transition-colors">Register Company</Link></li>
              <li><Link href="/employer/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <a href="https://www.nyxensolutions.net" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400 transition-colors">
            NyxenCloud Solution Pvt. Ltd.
          </a>
          <span>© {new Date().getFullYear()} NyxenCloud Solution Pvt. Ltd. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
