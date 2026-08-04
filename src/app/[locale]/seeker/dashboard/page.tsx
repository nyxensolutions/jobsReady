import { redirect } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import {
  MapPin, Briefcase, Clock, CheckCircle,
  Star, ChevronRight, Bookmark, Bell, User
} from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import WithdrawButton from "@/components/seeker/WithdrawButton"

const APP_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  APPLIED:     { label: "Applied",     color: "text-blue-700 bg-blue-100" },
  VIEWED:      { label: "Viewed",      color: "text-purple-700 bg-purple-100" },
  SHORTLISTED: { label: "Shortlisted", color: "text-green-700 bg-green-100" },
  REJECTED:    { label: "Rejected",    color: "text-red-600 bg-red-100" },
  HIRED:       { label: "Hired 🎉",   color: "text-green-800 bg-green-200" },
}

function formatSalary(min?: number | null, max?: number | null, unit = "monthly") {
  const suffix = unit === "daily" ? "/day" : "/month"
  const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
  if (min) return `From ${fmt(min)}${suffix}`
  return "Salary not mentioned"
}

const QUICK_CATEGORIES = [
  { label: "Delivery", slug: "delivery" },
  { label: "Driver", slug: "driver" },
  { label: "Security", slug: "security" },
  { label: "Sales", slug: "sales" },
  { label: "Cook", slug: "cook" },
  { label: "Factory", slug: "factory" },
]

export default async function SeekerDashboardPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-[#1a3461] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-xl font-bold">
            {applications.length === 0 ? `Welcome, ${firstName}! 👋` : `Hello, ${firstName}!`}
          </h1>
          <p className="text-white/70 text-sm mt-0.5">
            {applications.length === 0
              ? "Start browsing jobs — it's 100% free"
              : `You have ${stats.applied} application${stats.applied !== 1 ? "s" : ""}`}
          </p>
          <Link
            href="/jobs"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#1a3461] text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors shadow"
          >
            <Briefcase size={15} /> Find Jobs Near You
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Applied", value: stats.applied, icon: Briefcase, color: "text-blue-600 bg-blue-50" },
            { label: "Shortlisted", value: stats.shortlisted, icon: Star, color: "text-purple-600 bg-purple-50" },
            { label: "Hired", value: stats.hired, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile completion banner — shown prominently if incomplete */}
        {!profileComplete && (
          <Link href="/seeker/profile"
            className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <User size={18} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800">
                {profileScore === 0 ? "Complete your profile to get hired faster" : "Your profile is incomplete"}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${profileScore * 25}%` }} />
                </div>
                <span className="text-xs font-semibold text-amber-600 shrink-0">{profileScore * 25}%</span>
              </div>
              <p className="text-xs text-amber-600 mt-1">Add {[
                !isPhonePlaceholder && !!profile?.name ? null : "name",
                profile?.city ? null : "city",
                (profile?.skills?.length ?? 0) > 0 ? null : "skills",
                profile?.resumeUrl ? null : "resume",
              ].filter(Boolean).join(", ")} to improve your chances</p>
            </div>
            <span className="text-xs font-bold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg shrink-0">Update →</span>
          </Link>
        )}

        {/* Quick category browse */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-3 text-sm">Browse by Job Type</h2>
          <div className="flex flex-wrap gap-2">
            {QUICK_CATEGORIES.map(c => (
              <Link key={c.slug} href={`/jobs?category=${c.slug}`}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[#1a3461]/20 text-[#1a3461] bg-[#eef2ff] hover:bg-[#1a3461] hover:text-white transition-colors">
                {c.label}
              </Link>
            ))}
            <Link href="/jobs" className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-500 hover:border-[#1a3461] hover:text-[#1a3461] transition-colors">
              All Jobs →
            </Link>
          </div>
        </div>

        {/* Recommended jobs */}
        {recommendedJobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800">Recommended Jobs</h2>
              <Link href="/jobs" className="text-xs text-[#1a3461] font-semibold hover:underline">See all</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {recommendedJobs.map(job => (
                <div key={job.id} className="bg-white rounded-xl border border-gray-200 hover:border-[#1a3461]/30 hover:shadow-sm transition-all p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link href={`/jobs/${job.id}`}>
                        <p className="font-bold text-[#1a3461] text-sm hover:underline truncate">{job.title}</p>
                      </Link>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{job.employer.companyName}</p>
                      <p className="text-sm font-bold text-green-600 mt-1">{formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-0.5"><MapPin size={10} />{job.city.name}</span>
                        <span>·</span>
                        <span>{job.category.nameEn}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link href={`/jobs/${job.id}`}
                      className="w-full flex items-center justify-center py-1.5 bg-[#1a3461] hover:bg-[#142a52] text-white text-xs font-bold rounded-lg transition-colors">
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/seeker/saved-jobs" className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 hover:shadow-sm transition-all">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-50 text-orange-500 shrink-0">
              <Bookmark size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Saved Jobs</p>
              <p className="text-xs text-gray-400">Jobs you bookmarked</p>
            </div>
            <ChevronRight size={15} className="text-gray-300 ml-auto" />
          </Link>
          <Link href="/seeker/notifications" className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 hover:shadow-sm transition-all">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500 shrink-0">
              <Bell size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Notifications</p>
              <p className="text-xs text-gray-400">Application updates</p>
            </div>
            <ChevronRight size={15} className="text-gray-300 ml-auto" />
          </Link>
        </div>

        {/* Applications list */}
        {applications.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">My Applications</h2>
              <span className="text-xs text-gray-400">{applications.length} total</span>
            </div>
            <div className="divide-y divide-gray-100">
              {applications.map((app) => {
                const cfg = APP_STATUS_CONFIG[app.status] ?? APP_STATUS_CONFIG.APPLIED
                return (
                  <div key={app.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/jobs/${app.jobId}`} className="font-semibold text-gray-900 hover:text-blue-700 transition-colors truncate text-sm">
                          {app.job.title}
                        </Link>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{app.job.employer.companyName}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><MapPin size={10} />{app.job.city.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={11} />{formatRelativeTime(app.createdAt)}
                      </span>
                      {app.status === "APPLIED" && <WithdrawButton applicationId={app.id} />}
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
