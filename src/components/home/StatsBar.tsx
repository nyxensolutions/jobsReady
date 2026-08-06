"use client"

import { useTranslations } from "next-intl"

const STATS = [
  { key: "jobsPosted",      value: "50,000+", emoji: "💼", color: "text-[#1a3461]" },
  { key: "citiesCovered",   value: "200+",    emoji: "🏙️", color: "text-orange-600" },
  { key: "companiesHiring", value: "5,000+",  emoji: "🏢", color: "text-emerald-600" },
  { key: "successfulHires", value: "25,000+", emoji: "✅", color: "text-purple-600"  },
]

export default function StatsBar() {
  const t = useTranslations("home.stats")

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.key}
              className={`flex flex-col items-center py-5 px-4 gap-0.5 ${
                i % 2 === 0 ? "border-r border-gray-100 sm:border-r" : ""
              } ${i < 2 ? "border-b sm:border-b-0 border-gray-100" : ""}`}
            >
              <span className="text-[11px] mb-1">{stat.emoji}</span>
              <span className={`text-xl sm:text-2xl font-extrabold ${stat.color}`}>{stat.value}</span>
              <span className="text-[11px] text-gray-400 text-center leading-tight">{t(stat.key as any)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
