"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"

export default function Footer() {
  const t = useTranslations("nav")

  return (
    <footer className="bg-gray-900 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                JR
              </div>
              <span className="font-bold text-white text-base">JobsReady</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              India's trusted job portal for blue-collar and frontline workers.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Job Seekers</h4>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="hover:text-white transition-colors">{t("findJobs")}</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Create Profile</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Browse Categories</Link></li>
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

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} JobsReady. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
