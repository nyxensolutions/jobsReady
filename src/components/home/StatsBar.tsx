"use client"

import { useTranslations } from "next-intl"

const STATS = [
  { key: "jobsPosted", value: "50,000+", emoji: "💼" },
  { key: "citiesCovered", value: "200+", emoji: "🏙️" },
  { key: "companiesHiring", value: "5,000+", emoji: "🏢" },
  { key: "successfulHires", value: "25,000+", emoji: "✅" },
]

export default function StatsBar() {
  const t = useTranslations("home.stats")

  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200">
          {STATS.map((stat) => (
            <div key={stat.key} className="flex flex-col items-center py-4 px-4 gap-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-gray-900">{stat.value}</span>
              <span className="text-xs text-gray-500 text-center">{t(stat.key as any)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
