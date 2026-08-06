import { redirect } from "next/navigation"
import Link from "next/link"
import {
  PlusCircle, Users, Clock, CheckCircle, XCircle, AlertCircle,
  Briefcase, Upload, Info, Eye, TrendingUp, ArrowUpRight,
} from "lucide-react"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import EmployerJobActions from "@/components/employer/EmployerJobActions"

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  ACTIVE:         { label: "Active",       color: "text-green-700 bg-green-50 border-green-200",  icon: CheckCircle },
  PENDING_REVIEW: { label: "Under Review", color: "text-amber-700 bg-amber-50 border-amber-200",  icon: Clock },
  DRAFT:          { label: "Draft",        color: "text-gray-600 bg-gray-50 border-gray-200",    icon: AlertCircle },
  EXPIRED:        { label: "Expired",      color: "text-red-600 bg-red-50 border-red-200",       icon: XCircle },
  CLOSED:         { label: "Closed",       color: "text-gray-500 bg-gray-50 border-gray-200",    icon: XCircle },
  REJECTED:       { label: "Rejected",     color: "text-red-700 bg-red-50 border-red-200",       icon: XCircle },
}

function formatSalary(min?: number | null, max?: number | null, unit = "monthly") {
  const suffix = unit === "daily" ? "/day" : "/month"
  const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
  if (min) return `From ${fmt(min)}${suffix}`
  return "—"
}

export default async function EmployerDashboardPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const [dbUser, employer] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
  ])
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")
  if (!employer) redirect("/employer/register")

  const jobs = await prisma.jobListing.findMany({
    where: { employerId: employer.id },
    include: {
      category: { select: { nameEn: true } },
      city: { select: { name: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    live: jobs.filter((j) => j.status === "ACTIVE").length,
    underReview: jobs.filter((j) => j.status === "PENDING_REVIEW").length,
    applications: jobs.reduce((sum, j) => sum + j._count.applications, 0),
    views: jobs.reduce((sum, j) => sum + j.viewCount, 0),
  }

  // Verification steps
  const steps = [
    { label: "Create an account", done: true },
    { label: "Post your first job", done: jobs.length > 0 },
    { label: "Email Verification", done: !!dbUser.email },
    { label: "Document Submission", done: (employer.docUrls ?? []).length > 0, action: { label: "Upload", href: "/employer/setup/verify-docs", icon: "upload" } },
    { label: "Verification", done: employer.status === "VERIFIED", action: { label: "Info", href: "#", icon: "info" } },
  ]
  const completedSteps = steps.filter((s) => s.done).length
  const progressPct = Math.round((completedSteps / steps.length) * 100)

  return (
    <div className="min-h-screen bg-[#f7f9fc]">

      {/* Top header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-[5] shadow-sm">
        <div>
          <h1 className="text-base font-bold text-gray-900">
            Welcome back, {employer.contactPerson?.split(" ")[0] || employer.companyName}! 👋
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Here's what's happening with your jobs today.</p>
        </div>
        <Link
          href="/employer/post-job"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3461] text-white text-sm font-bold rounded-xl hover:bg-[#142a52] transition-all shadow-sm hover:shadow"
        >
          <PlusCircle size={16} />
          <span className="hidden sm:inline">Post a Job</span>
          <span className="sm:hidden">Post</span>
        </Link>
      </div>

      <div className="px-4 sm:px-6 py-6 w-full max-w-6xl">
        <div className="grid xl:grid-cols-3 gap-5 items-start">

          {/* ── Left column ── */}
          <div className="xl:col-span-2 flex flex-col gap-5">

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Live Jobs",    value: stats.live,         icon: Briefcase,  bg: "bg-green-50",   iconColor: "text-green-500",  numColor: "text-green-700"  },
                { label: "Under Review", value: stats.underReview,  icon: Clock,      bg: "bg-amber-50",   iconColor: "text-amber-500",  numColor: "text-amber-700"  },
                { label: "Applications", value: stats.applications, icon: Users,      bg: "bg-blue-50",    iconColor: "text-blue-500",   numColor: "text-blue-700"   },
                { label: "Total Views",  value: stats.views,        icon: Eye,        bg: "bg-purple-50",  iconColor: "text-purple-500", numColor: "text-purple-700" },
              ].map(({ label, value, icon: Icon, bg, iconColor, numColor }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-start relative overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`absolute top-4 right-4 w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon size={16} className={iconColor} />
                  </div>
                  <span className={`text-3xl font-extrabold ${numColor} leading-none mt-1`}>{value}</span>
                  <span className="text-xs text-gray-400 font-medium mt-2">{label}</span>
                </div>
              ))}
            </div>

            {/* Jobs list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" id="jobs">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Your Job Listings</h2>
                <Link
                  href="/employer/post-job"
                  className="text-sm text-[#1a3461] font-bold hover:underline flex items-center gap-1"
                >
                  <PlusCircle size={14} /> Post Job
                </Link>
              </div>

              {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center mb-4">
                    <Briefcase size={28} className="text-gray-300" />
                  </div>
                  <p className="font-bold text-gray-700">No jobs posted yet</p>
                  <p className="text-sm text-gray-400 mt-1 mb-6">Post your first job to start getting candidates</p>
                  <Link
                    href="/employer/post-job"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a3461] text-white text-sm font-bold rounded-xl hover:bg-[#142a52] transition-colors shadow-sm hover:shadow"
                  >
                    <PlusCircle size={16} /> Post a Job
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {jobs.map((job) => {
                    const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.DRAFT
                    const StatusIcon = cfg.icon
                    const canEdit = !["CLOSED", "EXPIRED"].includes(job.status)
                    const canClose = job.status === "ACTIVE" || job.status === "PENDING_REVIEW"
                    const canRepost = ["CLOSED", "EXPIRED", "REJECTED"].includes(job.status)

                    return (
                      <div key={job.id} className="px-5 py-4 hover:bg-gray-50/70 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/jobs/${job.id}`}
                                className="font-bold text-gray-900 hover:text-[#1a3461] transition-colors text-sm"
                              >
                                {job.title}
                              </Link>
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.color}`}>
                                <StatusIcon size={10} /> {cfg.label}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-gray-400">
                              <span>{job.city.name}</span>
                              <span className="text-gray-200">·</span>
                              <span>{job.category.nameEn}</span>
                              <span className="text-gray-200">·</span>
                              <span className="font-semibold text-gray-500">{formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)}</span>
                            </div>
                          </div>
                          <div className="text-center hidden sm:flex flex-col items-center shrink-0 min-w-[48px]">
                            <div className="text-xl font-extrabold text-gray-900">{job._count.applications}</div>
                            <div className="text-[10px] text-gray-400 font-medium">applicants</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <Link href={`/jobs/${job.id}`} className="text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                            View
                          </Link>
                          <Link href={`/employer/jobs/${job.id}/applicants`} className="text-xs font-semibold text-[#1a3461] border border-[#1a3461]/20 bg-[#eef2ff] px-3 py-1.5 rounded-xl hover:bg-[#1a3461]/10 transition-colors flex items-center gap-1">
                            <Users size={11} /> {job._count.applications} Applicants
                          </Link>
                          {canEdit && (
                            <Link href={`/employer/jobs/${job.id}/edit`} className="text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                              Edit
                            </Link>
                          )}
                          <EmployerJobActions jobId={job.id} canClose={canClose} canRepost={canRepost} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-5">

            {/* Plans CTA */}
            <Link
              href="/employer/plans"
              className="bg-gradient-to-br from-[#1a3461] to-[#2a4a7f] rounded-2xl p-5 text-white block hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <TrendingUp size={18} className="text-orange-300" />
                </div>
                <div>
                  <p className="font-bold text-sm">Free Plan Active</p>
                  <p className="text-xs text-white/60">1 job · No contact unlocks</p>
                </div>
              </div>
              <p className="text-xs text-white/70 mb-3 leading-relaxed">
                Upgrade to unlock candidate contacts, boost jobs to top, and post multiple openings.
              </p>
              <div className="flex items-center gap-1 text-orange-300 text-xs font-bold group-hover:gap-2 transition-all">
                View Plans <ArrowUpRight size={13} />
              </div>
            </Link>

            {/* Verification Steps */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#1a3461]/10 flex items-center justify-center">
                    <CheckCircle size={14} className="text-[#1a3461]" />
                  </div>
                  <span className="font-bold text-gray-800 text-sm">Setup Checklist</span>
                  <span className="ml-auto text-xs font-extrabold text-[#1a3461] bg-[#eef2ff] px-2 py-0.5 rounded-full">{progressPct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1a3461] to-[#3b6cb7] rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {steps.map((s) => (
                  <div key={s.label} className="flex items-center gap-3 px-5 py-3.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      s.done ? "bg-green-500 shadow-sm" : "border-2 border-gray-200 bg-gray-50"
                    }`}>
                      {s.done
                        ? <CheckCircle size={13} className="text-white" />
                        : <div className="w-2 h-2 rounded-full bg-gray-300" />
                      }
                    </div>
                    <span className={`flex-1 text-sm ${s.done ? "text-gray-400 line-through" : "text-gray-700"}`}>{s.label}</span>
                    {s.action && !s.done ? (
                      <Link
                        href={s.action.href}
                        className="text-xs text-[#1a3461] font-bold flex items-center gap-1 hover:underline shrink-0"
                      >
                        {s.action.icon === "upload" ? <Upload size={11} /> : s.action.icon === "info" ? <Info size={11} /> : null}
                        {s.action.label}
                      </Link>
                    ) : s.done ? (
                      <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full shrink-0">Done</span>
                    ) : (
                      <span className="text-[11px] text-gray-400 shrink-0">Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Help card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="font-bold text-gray-800 mb-1">Need Help?</p>
              <p className="text-xs text-gray-400 mb-4">Our team is here to help you hire faster</p>
              <div className="flex flex-col gap-2.5">
                <a
                  href="mailto:support@jobsready.in"
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-[#eef2ff] border border-transparent hover:border-[#1a3461]/10 transition-all group"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-800">Contact Support</p>
                    <p className="text-xs text-gray-400">support@jobsready.in</p>
                  </div>
                  <ArrowUpRight size={15} className="text-gray-300 group-hover:text-[#1a3461] transition-colors" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
