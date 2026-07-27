"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function SortSelect({ sort }: { sort: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    params.delete("page")
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <select
      value={sort}
      onChange={(e) => handleChange(e.target.value)}
      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="newest">Newest first</option>
      <option value="salary">Highest salary</option>
      <option value="vacancies">Most vacancies</option>
    </select>
  )
}
