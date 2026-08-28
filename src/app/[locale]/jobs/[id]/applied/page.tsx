import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { CheckCircle, MapPin, ChevronRight } from "lucide-react"
import { prisma } from "@/lib/db"
import { getServerSession } from "@/lib/firebase/session"
import { getTranslations } from "next-intl/server"

export default async function AppliedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession()
  if (!session) redirect("/login")

  const [t, td] = await Promise.all([
    getTranslations("seeker.applied"),
    getTranslations("seeker.dashboard"),
  ])

  // Fetch seeker profile (used for auth check + profile completion)
  const seeker = await prisma.seekerProfile.findUnique({
    where: { userId: session.uid },
    select: { id: true, name: true, city: true, skills: true, resumeUrl: true },
  })

  // Verify the seeker actually applied for this job
  if (seeker) {
    const application = await prisma.application.findUnique({
      where: { jobId_seekerId: { jobId: id, seekerId: seeker.id } },
      select: { id: true },
    })
    if (!application) redirect(`/jobs/${id}`)
  } else {
    redirect(`/jobs/${id}`)
  }

  const job = await prisma.jobListing.findUnique({
    where: { id },
    include: {
      employer: { select: { companyName: true } },
      city: { select: { name: true } },
      category: { select: { nameEn: true, slug: true } },
    },
  })
  if (!job) notFound()

  const similarJobs = await prisma.jobListing.findMany({
    where: { status: "ACTIVE", categoryId: job.categoryId, id: { not: id } },
    include: {
      employer: { select: { companyName: true } },
      city: { select: { name: true } },
      category: { select: { nameEn: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 8,
  })

  const isPhonePlaceholder = !seeker?.name || /^\+?\d+$/.test(seeker.name)
  const profileScore = [
    !isPhonePlaceholder,
    !!seeker?.city,
    (seeker?.skills?.length ?? 0) > 0,
    !!seeker?.resumeUrl,
  ].filter(Boolean).length

  function formatSalary(min?: number | null, max?: number | null, unit = "monthly") {
    const suffix = unit === "daily" ? "/day" : "/month"
    const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`
    if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
    if (min) return `From ${fmt(min)}${suffix}`
    return t("salaryNotMentioned")
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Success banner */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-4">
            <CheckCircle size={22} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-800">{t("sentToHr")}</p>
              <p className="text-sm text-green-600 mt-0.5">
                {t("youAppliedFor", {
                  title: job.title,
                  company: job.employer.companyName,
                  city: job.city.name,
                })}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Link href="/seeker/dashboard"
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              {t("myApplications")}
            </Link>
            <Link href="/jobs"
              className="flex-1 py-2.5 rounded-xl bg-[#1a3461] text-center text-sm font-semibold text-white hover:bg-[#142a52] transition-colors">
              {t("findMoreJobs")}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Profile completion nudge if incomplete */}
        {profileScore < 4 && (
          <Link href="/seeker/profile"
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition-colors">
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">{t("completeProfile")}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${profileScore * 25}%` }} />
                </div>
                <span className="text-xs font-semibold text-amber-600 shrink-0">{profileScore * 25}%</span>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg shrink-0">{t("update")}</span>
          </Link>
        )}

        {/* Similar jobs */}
        {similarJobs.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-800 mb-3">{t("similarJobs")}</h2>
            <div className="flex flex-col gap-3">
              {similarJobs.map(sj => (
                <Link key={sj.id} href={`/jobs/${sj.id}`}
                  className="bg-white rounded-xl border border-gray-200 hover:border-[#1a3461]/30 hover:shadow-sm transition-all p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1a3461] text-sm">{sj.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{sj.employer.companyName}</p>
                    <p className="text-sm font-bold text-green-600 mt-1">
                      {formatSalary(sj.salaryMin, sj.salaryMax, sj.salaryUnit)}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-0.5"><MapPin size={10} />{sj.city.name}</span>
                      <span>·</span>
                      <span>{sj.category.nameEn}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
