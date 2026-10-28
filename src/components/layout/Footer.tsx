"use client"

import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import Image from "next/image"

const NO_FOOTER_SEGMENTS = ["/employer/", "/admin"]

// Kept inline rather than imported from the blog data so the article content
// isn't bundled into this client component. Hindi visitors get Hindi labels,
// and only guides that actually have a Hindi version (the links are locale-aware).
const FOOTER_GUIDES = {
  en: {
    heading: "Popular blog articles",
    links: [
      ["/blog/delivery/delivery-boy-salary-in-india", "Delivery boy salary in India"],
      ["/blog/security/security-guard-night-shift-salary-delhi-ncr", "Security guard night shift salary"],
      ["/blog/telecaller/telecaller-job-description-salary-skills", "Telecaller job & salary"],
      ["/blog/warehouse/warehouse-jobs-in-greater-noida", "Warehouse jobs in Greater Noida"],
      ["/blog/job-safety/how-to-spot-a-fake-job-offer", "How to spot a fake job offer"],
      ["/blog/resume/resume-for-freshers-without-experience", "Resume for freshers"],
    ],
  },
  hi: {
    heading: "लोकप्रिय ब्लॉग लेख",
    links: [
      ["/blog/delivery/delivery-boy-salary-in-india", "डिलीवरी बॉय की सैलरी"],
      ["/blog/security/security-guard-night-shift-salary-delhi-ncr", "सिक्योरिटी गार्ड नाइट शिफ्ट सैलरी"],
      ["/blog/telecaller/telecaller-job-description-salary-skills", "टेलीकॉलर जॉब और सैलरी"],
      ["/blog/driver/driver-job-salary-in-india", "ड्राइवर की सैलरी"],
      ["/blog/job-safety/how-to-spot-a-fake-job-offer", "फर्जी जॉब ऑफर कैसे पहचानें"],
      ["/blog/resume/resume-for-freshers-without-experience", "फ्रेशर के लिए रिज्यूमे"],
    ],
  },
} as const

type Props = {
  userRole?: "SEEKER" | "EMPLOYER" | "ADMIN" | null
}

export default function Footer({ userRole }: Props) {
  const t = useTranslations("nav")
  const locale = useLocale()
  const guides = locale === "hi" ? FOOTER_GUIDES.hi : FOOTER_GUIDES.en
  const pathname = usePathname()
  const hide = NO_FOOTER_SEGMENTS.some((s) => pathname.includes(s))
  if (hide) return null

  const isSeeker = userRole === "SEEKER"

  return (
    <footer className="bg-gray-900 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-1">
              <Image src="/Logo_Light.png" alt="Jobs24India" width={180} height={50} className="object-contain" />
            </div>
            <p className="text-gray-600 text-xs mb-3">
              A product of{" "}
              <a href="https://www.nyxensolutions.net" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                NyxenCloud Solutions
              </a>
            </p>
            <p className="text-gray-500 text-xs leading-relaxed">
              India's trusted job portal for frontline workers.
            </p>
          </div>

          {/* Job Seekers section */}
          <div>
            <h4 className="text-white font-semibold mb-3">{t("jobSeekers")}</h4>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="hover:text-white transition-colors">{t("findJobs")}</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">{t("createProfile")}</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">{t("browseCategories")}</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">{t("blog")}</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">{t("aboutUs")}</Link></li>
            </ul>
          </div>

          {/* Employers section — hide internal links when user is a seeker to avoid confusion */}
          <div>
            <h4 className="text-white font-semibold mb-3">{t("employers")}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={isSeeker ? "/login?role=employer&next=/employer/post-job" : "/employer/post-job"}
                  className="hover:text-white transition-colors"
                >
                  {t("postJob")}
                </Link>
              </li>
              <li>
                <Link
                  href={isSeeker ? "/login?role=employer" : "/employer/register"}
                  className="hover:text-white transition-colors"
                >
                  {t("registerCompany")}
                </Link>
              </li>
              {/* Only show employer dashboard link to actual employers */}
              {!isSeeker && (
                <li>
                  <Link href="/employer/dashboard" className="hover:text-white transition-colors">
                    {t("dashboard")}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">{t("company")}</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition-colors">{t("aboutUs")}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{t("contact")}</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">{t("privacyPolicy")}</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">{t("termsOfUse")}</Link></li>
              <li><Link href="/cancellation-policy" className="hover:text-white transition-colors">{t("cancellationPolicy")}</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Popular blog articles — only shown on public pages, not when seeker is logged in */}
        {!isSeeker && (
          <div className="border-t border-gray-800 mt-10 pt-6">
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wide">{guides.heading}</h4>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
              {guides.links.map(([href, label]) => (
                <Link key={href} href={href} className="hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <a href="https://www.nyxensolutions.net" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400 transition-colors">
            NyxenCloud Solutions Private Limited
          </a>
          <span>© {new Date().getFullYear()} NyxenCloud Solutions Private Limited All rights reserved.</span>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
            <Link href="/cancellation-policy" className="hover:text-gray-400 transition-colors">{t("cancellationPolicy")}</Link>
            <Link href="/cookie-policy" className="hover:text-gray-400 transition-colors">Cookies</Link>
            <Link href="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
