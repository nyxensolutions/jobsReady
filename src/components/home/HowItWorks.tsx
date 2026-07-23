"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { UserPlus, Search, CheckCircle, Building2, PenLine, Users } from "lucide-react"

export default function HowItWorks() {
  const t = useTranslations("home.howItWorks")

  const seekerSteps = [
    { icon: UserPlus, label: t("seeker.step1") },
    { icon: Search, label: t("seeker.step2") },
    { icon: CheckCircle, label: t("seeker.step3") },
  ]

  const employerSteps = [
    { icon: Building2, label: t("employer.step1") },
    { icon: PenLine, label: t("employer.step2") },
    { icon: Users, label: t("employer.step3") },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
          {t("title")}
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Job seekers */}
          <div className="bg-blue-50 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-blue-800 mb-6">Looking for a job?</h3>
            <div className="flex flex-col gap-5">
              {seekerSteps.map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </div>
                  <span className="text-gray-700 font-medium">{label}</span>
                </div>
              ))}
            </div>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center justify-center w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Create Free Profile
            </Link>
          </div>

          {/* Employers */}
          <div className="bg-gray-900 rounded-2xl p-8 text-white">
            <h3 className="text-lg font-bold mb-6">Want to hire?</h3>
            <div className="flex flex-col gap-5">
              {employerSteps.map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </div>
                  <span className="text-gray-200 font-medium">{label}</span>
                </div>
              ))}
            </div>
            <Link
              href="/employer/register"
              className="mt-8 inline-flex items-center justify-center w-full py-3 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              Post a Job Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
