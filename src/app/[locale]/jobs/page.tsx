import { getTranslations } from "next-intl/server"
import JobSearchBar from "@/components/jobs/JobSearchBar"
import JobFilters from "@/components/jobs/JobFilters"
import JobCard from "@/components/jobs/JobCard"

type SearchParams = {
  q?: string
  city?: string
  category?: string
  type?: string
  page?: string
}

type Props = {
  searchParams: Promise<SearchParams>
}

// Sample data until DB is live
const SAMPLE_JOBS = [
  {
    id: "1",
    title: "Delivery Executive",
    company: "Zomato",
    city: "Hyderabad",
    salary: "₹15,000 – ₹22,000/month",
    type: "FULL_TIME",
    category: "delivery",
    vacancies: 10,
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isFeatured: true,
  },
  {
    id: "2",
    title: "Security Guard",
    company: "G4S India",
    city: "Hyderabad",
    salary: "₹12,000 – ₹16,000/month",
    type: "FULL_TIME",
    category: "security",
    vacancies: 5,
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isFeatured: false,
  },
  {
    id: "3",
    title: "Sales Executive",
    company: "Reliance Retail",
    city: "Hyderabad",
    salary: "₹18,000 – ₹28,000/month",
    type: "FULL_TIME",
    category: "sales",
    vacancies: 8,
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isFeatured: true,
  },
  {
    id: "4",
    title: "Driver (LMV)",
    company: "Ola",
    city: "Bengaluru",
    salary: "₹20,000 – ₹30,000/month",
    type: "GIG",
    category: "driver",
    vacancies: 20,
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isFeatured: false,
  },
  {
    id: "5",
    title: "Cook (North Indian)",
    company: "Hospitality Hub",
    city: "Mumbai",
    salary: "₹14,000 – ₹20,000/month",
    type: "FULL_TIME",
    category: "cook",
    vacancies: 3,
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    isFeatured: false,
  },
  {
    id: "6",
    title: "Warehouse Helper",
    company: "Amazon India",
    city: "Hyderabad",
    salary: "₹13,000 – ₹18,000/month",
    type: "CONTRACT",
    category: "factory",
    vacancies: 30,
    postedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isFeatured: true,
  },
]

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams
  const t = await getTranslations("jobs")

  const q = params.q ?? ""
  const city = params.city ?? ""
  const category = params.category ?? ""

  const filtered = SAMPLE_JOBS.filter((j) => {
    if (q && !j.title.toLowerCase().includes(q.toLowerCase()) && !j.company.toLowerCase().includes(q.toLowerCase())) return false
    if (city && !j.city.toLowerCase().includes(city.toLowerCase())) return false
    if (category && j.category !== category) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top search bar */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <JobSearchBar defaultQuery={q} defaultCity={city} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <JobFilters activeCategory={category} />
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {t("searchResults", { count: filtered.length })}
                {q && <span className="font-semibold"> for "{q}"</span>}
              </p>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500">
                <option>Newest first</option>
                <option>Highest salary</option>
                <option>Most vacancies</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg">{t("noResults")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
