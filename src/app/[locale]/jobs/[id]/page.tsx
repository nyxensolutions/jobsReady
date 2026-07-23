import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MapPin, Clock, Briefcase, Users, Phone, ArrowLeft, Star, CheckCircle } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

type Props = {
  params: Promise<{ id: string; locale: string }>
}

// Same sample data — will swap for DB query once Prisma is connected
const SAMPLE_JOBS: Record<string, any> = {
  "1": {
    id: "1",
    title: "Delivery Executive",
    company: "Zomato",
    city: "Hyderabad",
    area: "Banjara Hills, Jubilee Hills",
    salaryMin: 15000,
    salaryMax: 22000,
    type: "FULL_TIME",
    category: "delivery",
    vacancies: 10,
    experienceMin: 0,
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isFeatured: true,
    contactPhone: "9876543210",
    description: `We are hiring Delivery Executives to join our growing team at Zomato. You will be responsible for picking up food orders from restaurants and delivering them to customers within the assigned area.

Key Responsibilities:
• Pick up and deliver food orders on time
• Maintain good hygiene of delivery bag and bike
• Use the Zomato app for order management
• Communicate with customers for delivery updates`,
    requirements: ["Valid driving licence (2-wheeler)", "Own a bike/scooter", "Smartphone with internet", "Age 18–45"],
    perks: ["Weekly salary payout", "Accident insurance", "Fuel allowance", "Performance bonus"],
    companyDesc: "Zomato is India's leading food delivery platform operating in 500+ cities.",
  },
  "2": {
    id: "2",
    title: "Security Guard",
    company: "G4S India",
    city: "Hyderabad",
    area: "HITEC City, Gachibowli",
    salaryMin: 12000,
    salaryMax: 16000,
    type: "FULL_TIME",
    category: "security",
    vacancies: 5,
    experienceMin: 1,
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isFeatured: false,
    contactPhone: "9123456780",
    description: "We are looking for trained security guards for corporate offices in HITEC City.",
    requirements: ["10th pass minimum", "Age 21–45", "Height 5'6\" minimum", "No criminal record"],
    perks: ["Uniform provided", "PF + ESI", "Duty meals", "Overtime pay"],
    companyDesc: "G4S is one of the world's largest security companies.",
  },
}

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time", CONTRACT: "Contract", GIG: "Gig"
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params
  const t = await getTranslations("jobs")
  const job = SAMPLE_JOBS[id]

  if (!job) notFound()

  const salary =
    job.salaryMin && job.salaryMax
      ? `₹${(job.salaryMin / 1000).toFixed(0)}K – ₹${(job.salaryMax / 1000).toFixed(0)}K/month`
      : "As per interview"

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              {job.isFeatured && (
                <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold mb-3">
                  <Star size={12} fill="currentColor" /> Featured Job
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0">
                  {job.company[0]}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-gray-600 mt-0.5">{job.company}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={14} />{job.city} · {job.area}</span>
                    <span className="flex items-center gap-1"><Briefcase size={14} />{salary}</span>
                    <span className="flex items-center gap-1"><Users size={14} />{job.vacancies} vacancies</span>
                    <span className="flex items-center gap-1"><Clock size={14} />{formatRelativeTime(job.postedAt)}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                      {TYPE_LABELS[job.type]}
                    </span>
                    {job.experienceMin === 0 && (
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                        Freshers OK
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">{t("jobDetail.about")}</h2>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">{t("jobDetail.requirements")}</h2>
              <ul className="flex flex-col gap-2">
                {job.requirements.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Perks */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">{t("jobDetail.perks")}</h2>
              <div className="flex flex-wrap gap-2">
                {job.perks.map((p: string, i: number) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* About company */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-3">{t("jobDetail.aboutCompany")}</h2>
              <p className="text-sm text-gray-700">{job.companyDesc}</p>
            </div>
          </div>

          {/* Sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-20">
              <div className="text-center mb-5">
                <p className="text-2xl font-bold text-gray-900">{salary}</p>
                <p className="text-xs text-gray-500 mt-1">per month</p>
              </div>

              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors mb-3">
                {t("applyNow")}
              </button>

              {job.contactPhone && (
                <a
                  href={`tel:${job.contactPhone}`}
                  className="w-full py-3 flex items-center justify-center gap-2 border border-gray-300 hover:border-blue-400 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
                >
                  <Phone size={16} />
                  {t("callHr")}
                </a>
              )}

              <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">Vacancies</span>
                  <span className="font-semibold">{job.vacancies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Experience</span>
                  <span className="font-semibold">{job.experienceMin === 0 ? "Freshers OK" : `${job.experienceMin}+ yrs`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Job type</span>
                  <span className="font-semibold">{TYPE_LABELS[job.type]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location</span>
                  <span className="font-semibold">{job.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
