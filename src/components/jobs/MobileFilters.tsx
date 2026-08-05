"use client"

import { useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { useTranslations } from "next-intl"
import JobFilters from "./JobFilters"

type Props = {
  activeCategory?: string
}

export default function MobileFilters({ activeCategory }: Props) {
  const [open, setOpen] = useState(false)
  const t = useTranslations("jobs.filters")

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#1a3461] hover:border-[#1a3461] transition-colors shadow-sm"
      >
        <SlidersHorizontal size={15} />
        {t("title")} {activeCategory && <span className="w-2 h-2 rounded-full bg-[#1a3461] inline-block" />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[90vw] bg-white z-50 overflow-y-auto shadow-2xl lg:hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
              <span className="font-bold text-gray-900">{t("title")}</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <JobFilters activeCategory={activeCategory} onFilterApply={() => setOpen(false)} />
            </div>
          </div>
        </>
      )}
    </>
  )
}
