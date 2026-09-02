"use client"

import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  page: number
  total: number
  perPage: number
}

export default function JobsPagination({ page, total, perPage }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(total / perPage)

  if (totalPages <= 1) return null

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`/jobs?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const pages: (number | "…")[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…")
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm select-none">…</span>
        ) : (
          <button
            key={`page-${p}`}
            onClick={() => goTo(p as number)}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-colors ${
              p === page
                ? "bg-[#1a3461] text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
