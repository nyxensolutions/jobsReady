import { redirect } from "next/navigation"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import {
  MapPin, Briefcase, Clock, CheckCircle,
  Star, ChevronRight, Bookmark, Bell, User, TrendingUp, ArrowUpRight
} from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import WithdrawButton from "@/components/seeker/WithdrawButton"

const STATUS_COLOR: Record<string, string> = {
  APPLIED:     "text-blue-700 bg-blue-50 border-blue-200",
  VIEWED:      "text-purple-700 bg-purple-50 border-purple-200",
  SHORTLISTED: "text-green-700 bg-green-50 border-green-200",
  REJECTED:    "text-red-600 bg-red-50 border-red-200",
  HIRED:       "text-emerald-700 bg-emerald-50 border-emerald-300",
}

function formatSalary(
  min?: number | null,
  max?: number | null,
  unit = "monthly",
  salaryNotMentioned = "Salary not mentioned"
) {
  const suffix = unit === "daily" ? "/day" : "/month"
  const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
  if (min) return `From ${fmt(min)}${suffix}`
  return salaryNotMentioned
}

const QUICK_CATEGORY_KEYS = [
  { tKey: "delivery", slug: "delivery" },
  { tKey: "driver",   slug: "driver"   },
  { tKey: "security", slug: "security" },
  { tKey: "sales",    slug: "sales"    },
  { tKey: "cook",     slug: "cook"     },
  { tKey: "factory",  slug: "factory"  },
]

export default async function SeekerDashboardPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const [t, tc, tn] = await Promise.all([
    getTranslations("seeker.dashboard"),
    getTranslations("categories"),
    getTranslations("nav"),
  ])
  const ts = await getTranslations("status")

  const [dbUser, profile, recommendedJobs] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.seekerProfile.findUnique({ where: { userId: session.uid } }),
    prisma.jobListing.findMany({
      where: { status: "ACTIVE" },
      include: {
        employer: { select: { companyName: true, contactPhone: true } },
        city: { select: { name: true } },
        category: { select: { nameEn: true, slug: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
  ])
  if (!dbUser || dbUser.role !== "SEEKER") redirect("/login")

  const [applications, totalApplied] = profile
    ? await Promise.all([
        prisma.application.findMany({
          where: { seekerId: profile.id },
          include: {
            job: {
              include: {
                employer: { select: { companyName: true } },
                city: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.application.count({ where: { seekerId: profile.id } }),
      ])
    : [[], 0]

  const stats = {
    applied: totalApplied,
    shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
    hired: applications.filter((a) => a.status === "HIRED").length,
  }

  const isPhonePlaceholder = !profile?.name || /^\+?\d+$/.test(profile.name)
  const firstName = isPhonePlaceholder ? "there" : profile!.name.split(" ")[0]
  const profileScore = [
    !isPhonePlaceholder && !!profile?.name,
    !!profile?.city,
    (profile?.skills?.length ?? 0) > 0,
    !!profile?.resumeUrl,
  ].filter(Boolean).length
  const profileComplete = profileScore === 4

  const salaryNotMentioned = t("salaryNotMentioned")

  // Avatar initial — show first name letter; if name is a phone placeholder, fall back to "U"
  const avatarLetter = isPhonePlaceholder ? "U" : profile!.name[0].toUpperCase()

  return (
    <div className="min-h-screen bg-[#f7f9fc]">

      {/* ── Hero banner — lighter gradient, more modern ── */}
      <div className="bg-gradient-to-br from-[#1a3461] via-[#1e3f73] to-[#243f7a] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            {/* Greeting */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-lg font-bold border border-white/20 shrink-0">
                {avatarLetter}
              </div>
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-0.5">Welcome back</p>
                <h1 className="text-xl font-extrabold leading-tight">
                  {applications.length === 0
                    ? t("welcome", { name: firstName })
                    : t("hello", { name: firstName })}
                </h1>
                <p className="text-white/60 text-sm mt-0.5">
                  {applications.length === 0
                    ? t("startBrowsing")
                    : stats.applied === 1
                      ? t("youHave", { count: stats.applied })
                      : t("youHavePlural", { count: stats.applied })}
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/jobs"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-[#1a3461] text-sm font-bold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
            >
              <Briefcase size={15} /> {t("findJobsNear")}
            </Link>
          </div>

          {/* ── Stat cards inside hero ── */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: t("statApplied"),     value: stats.applied,     color: "bg-white/10 border-white/20",            href: "#applications" },
              { label: t("statShortlisted"), value: stats.shortlisted, color: "bg-white/10 border-white/20",            href: "#applications" },
              { label: t("statHired"),       value: stats.hired,       color: "bg-emerald-500/20 border-emerald-400/30", href: "#applications" },
            ].map(({ label, value, color, href }) => (
              <Link key={label} href={href} className={`${color} border rounded-2xl px-4 py-3.5 flex flex-col items-center cursor-pointer hover:brightness-110 transition-all`}>
                <span className="text-2xl sm:text-3xl font-extrabold text-white">{value}</span>
                <span className="text-white/60 text-[11px] font-medium mt-0.5 text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5">

        {/* Profile completion banner */}
        {!profileComplete && (
          <Link
            href="/seeker/profile"
            className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-200 transition-colors">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800">
                {profileScore === 0 ? t("completeToGetHired") : t("profileIncomplete")}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${profileScore * 25}%` }} />
                </div>
                <span className="text-xs font-bold text-amber-600 shrink-0">{profileScore * 25}%</span>
              </div>
              <p className="text-xs text-amber-600/80 mt-1">
                Add{" "}
                {[
                  !isPhonePlaceholder && !!profile?.name ? null : "name",
                  profile?.city ? null : "city",
                  (profile?.skills?.length ?? 0) > 0 ? null : "skills",
                  profile?.resumeUrl ? null : "resume",
                ].filter(Boolean).join(", ")}
                {" "}to improve your chances
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl">
                {t("updateProfile")}
              </span>
              <ArrowUpRight size={14} className="text-amber-500" />
            </div>
          </Link>
        )}

        {/* Quick category browse */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-3.5 text-sm">{t("browseByType")}</h2>
          <div className="flex flex-wrap gap-2">
            {QUICK_CATEGORY_KEYS.map((c) => (
              <Link
                key={c.slug}
                href={`/jobs?category=${c.slug}`}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#1a3461]/15 text-[#1a3461] bg-[#eef2ff] hover:bg-[#1a3461] hover:text-white hover:border-[#1a3461] transition-all duration-150 shadow-sm hover:shadow"
              >
                {tc(c.tKey as any)}
              </Link>
            ))}
            <Link
              href="/jobs"
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-500 hover:border-[#1a3461] hover:text-[#1a3461] transition-all duration-150"
            >
              {t("allJobs")} →
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/seeker/saved-jobs"
            className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-orange-200 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 text-orange-500 shrink-0 group-hover:bg-orange-100 transition-colors">
              <Bookmark size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{tn("savedJobs")}</p>
              <p className="text-xs text-gray-400">{t("savedJobsDesc")}</p>
            </div>
            <ChevronRight size={15} className="text-gray-300 group-hover:text-orange-400 transition-colors shrink-0" />
          </Link>
          <Link
            href="/seeker/notifications"
            className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500 shrink-0 group-hover:bg-blue-100 transition-colors">
              <Bell size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{t("notificationsTitle")}</p>
              <p className="text-xs text-gray-400">{t("notificationsDesc")}</p>
            </div>
            <ChevronRight size={15} className="text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
          </Link>
        </div>

        {/* Applications list — shown ABOVE recommended jobs */}
        {applications.length > 0 && (
          <div id="applications" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{t("myApplications")}</h2>
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-semibold">
                {t("totalCount", { count: applications.length })}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {applications.map((app) => {
                const colorClass = STATUS_COLOR[app.status] ?? STATUS_COLOR.APPLIED
                let statusLabel: string
                try { statusLabel = ts(app.status as any) } catch { statusLabel = app.status }
                return (
                  <div key={app.id} className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/70 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/jobs/${app.jobId}`}
                          className="font-bold text-gray-900 hover:text-[#1a3461] transition-colors truncate text-sm"
                        >
                          {app.job.title}
                        </Link>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${colorClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{app.job.employer.companyName}</span>
                        <span className="text-gray-200">·</span>
                        <span className="flex items-center gap-0.5"><MapPin size={10} />{app.job.city.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={11} />
                        {formatRelativeTime(app.createdAt)}
                      </span>
                      {app.status === "APPLIED" && <WithdrawButton applicationId={app.id} />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recommended jobs */}
        {recommendedJobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="font-bold text-gray-900">{t("recommendedJobs")}</h2>
              <Link href="/jobs" className="text-xs text-[#1a3461] font-bold hover:underline flex items-center gap-1">
                {t("seeAll")} <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {recommendedJobs.map((job) => {
                const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit, salaryNotMentioned)
                const initial = job.employer.companyName[0].toUpperCase()
                return (
                  <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1a3461]/20 transition-all p-4 group">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a3461] to-[#2a4a7f] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/jobs/${job.id}`}>
                          <p className="font-bold text-gray-900 text-sm hover:text-[#1a3461] truncate transition-colors">{job.title}</p>
                        </Link>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{job.employer.companyName}</p>
                        <p className={`text-sm mt-1.5 font-bold ${salary === salaryNotMentioned ? "text-gray-300 font-normal" : "text-green-600"}`}>
                          {salary}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-0.5"><MapPin size={10} />{job.city.name}</span>
                          <span className="text-gray-200">·</span>
                          <span>{job.category.nameEn}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3.5">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="w-full flex items-center justify-center py-2 bg-[#1a3461] group-hover:bg-[#142a52] text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        {t("browseJobs")}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
