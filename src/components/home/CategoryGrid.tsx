"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import {
  Truck, Car, TrendingUp, Shield, Sparkles, UtensilsCrossed,
  HardHat, Factory, ShoppingBag, Briefcase, Monitor, HeartPulse
} from "lucide-react"

const CATEGORIES = [
  { key: "delivery", icon: Truck, color: "bg-orange-50 text-orange-600" },
  { key: "driver", icon: Car, color: "bg-blue-50 text-blue-600" },
  { key: "sales", icon: TrendingUp, color: "bg-green-50 text-green-600" },
  { key: "security", icon: Shield, color: "bg-red-50 text-red-600" },
  { key: "housekeeping", icon: Sparkles, color: "bg-purple-50 text-purple-600" },
  { key: "cook", icon: UtensilsCrossed, color: "bg-yellow-50 text-yellow-600" },
  { key: "construction", icon: HardHat, color: "bg-stone-50 text-stone-600" },
  { key: "factory", icon: Factory, color: "bg-slate-50 text-slate-600" },
  { key: "retail", icon: ShoppingBag, color: "bg-pink-50 text-pink-600" },
  { key: "fieldWork", icon: Briefcase, color: "bg-teal-50 text-teal-600" },
  { key: "it", icon: Monitor, color: "bg-indigo-50 text-indigo-600" },
  { key: "healthcare", icon: HeartPulse, color: "bg-rose-50 text-rose-600" },
]

export default function CategoryGrid() {
  const t = useTranslations("home.categories")
  const tCat = useTranslations("categories")

  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("title")}</h2>
          <p className="text-gray-500 mt-2 text-sm">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(({ key, icon: Icon, color }) => (
            <Link
              key={key}
              href={`/jobs?category=${key}`}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={22} />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                {tCat(key as any)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
