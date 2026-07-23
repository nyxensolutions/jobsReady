"use client"

import { useTranslations } from "next-intl"

const STATS = [
  { key: "jobsPosted", value: "50,000+" },
  { key: "citiesCovered", value: "200+" },
  { key: "companiesHiring", value: "5,000+" },
  { key: "successfulHires", value: "25,000+" },
]

export default function StatsBar() {
  const t = useTranslations("home.stats")

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
          {STATS.map((stat) => (
            <div key={stat.key} className="flex flex-col items-center py-5 px-4">
              <span className="text-2xl font-extrabold text-blue-700">{stat.value}</span>
              <span className="text-xs text-gray-500 mt-1 text-center">{t(stat.key as any)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
