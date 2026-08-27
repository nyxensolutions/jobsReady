import { redirect } from "next/navigation"
import Link from "next/link"
import {
  PlusCircle, Users, Clock, CheckCircle, XCircle, AlertCircle,
  Briefcase, Eye, TrendingUp, ArrowUpRight, Upload, Info,
  Zap, BarChart2, MapPin, Tag, IndianRupee, ChevronRight,
} from "lucide-react"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import EmployerJobActions from "@/components/employer/EmployerJobActions"
import { getActiveSub } from "@/lib/subscription"

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; icon: typeof CheckCircle }> = {
  ACTIVE:         { label: "Active",       color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle },
  PENDING_REVIEW: { label: "Under Review", color: "text-amber-700 bg-amber-50 border-amber-200",       dot: "bg-amber-400",  icon: Clock },
  DRAFT:          { label: "Draft",        color: "text-slate-500 bg-slate-50 border-slate-200",       dot: "bg-slate-400",  icon: AlertCircle },
  EXPIRED:        { label: "Expired",      color: "text-red-600 bg-red-50 border-red-200",             dot: "bg-red-400",    icon: XCircle },
  CLOSED:         { label: "Closed",       color: "text-slate-500 bg-slate-50 border-slate-200",       dot: "bg-slate-300",  icon: XCircle },
  REJECTED:       { label: "Rejected",     color: "text-red-700 bg-red-50 border-red-200",             dot: "bg-red-500",    icon: XCircle },
}

function formatSalary(min?: number | null, max?: number | null, unit = "monthly") {
  const suffix = unit === "daily" ? "/day" : "/mo"
  const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
  if (min) return `from ${fmt(min)}${suffix}`
  return "Salary not set"
}

function daysLeft(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000))
}

export default async function EmployerDashboardPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const [dbUser, employer] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
  ])
  // Gate by employer profile existence — same phone can have both seeker + employer accounts
  if (!dbUser) redirect("/login")
  if (!employer) redirect("/employer/register")

  const [allJobs, draftJobs, activeSub] = await Promise.all([
    prisma.jobListing.findMany({
      where: { employerId: employer.id, status: { not: "DRAFT" } },
      include: {
        category: { select: { nameEn: true, slug: true } },
        city: { select: { name: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.jobListing.findMany({
      where: { employerId: employer.id, status: "DRAFT" },
      include: {
        category: { select: { nameEn: true } },
        city: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    getActiveSub(employer.id),
  ])
  const jobs = allJobs

  const stats = {
    live:         jobs.filter(j => j.status === "ACTIVE").length,
    underReview:  jobs.filter(j => j.status === "PENDING_REVIEW").length,
    applications: jobs.reduce((s, j) => s + j._count.applications, 0),
    views:        jobs.reduce((s, j) => s + j.viewCount, 0),
  }

  const steps = [
    { label: "Create account",      done: true },
    { label: "Post first job",      done: jobs.length > 0 },
    { label: "Email verified",      done: !!dbUser.email },
    { label: "Upload documents",    done: (employer.docUrls ?? []).length > 0, action: "/employer/setup/verify-docs", actionIcon: "upload" },
    { label: "Account verified",    done: employer.status === "VERIFIED" },
  ]
  const pct = Math.round(steps.filter(s => s.done).length / steps.length * 100)
  const firstName = employer.contactPerson?.split(" ")[0] || employer.companyName

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero header ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1a3461] via-[#1e3d73] to-[#243f7a] px-6 sm:px-8 pt-8 pb-0">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-blue-300 text-xs font-semibold tracking-widest uppercase mb-1">Recruiter Dashboard</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-blue-200/70 text-sm mt-1">{employer.companyName}</p>
          </div>
          <Link
            href="/employer/post-job"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#f97316] hover:bg-[#ea6c0a] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all shrink-0"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline">Post a Job</span>
            <span className="sm:hidden">Post</span>
          </Link>
        </div>

        {/* Stat strip — lives in the header, tabs into body */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 -mb-5">
          {[
            { label: "Live Jobs",     value: stats.live,         icon: Briefcase, accent: "text-emerald-400", sub: "currently active"  },
            { label: "Under Review",  value: stats.underReview,  icon: Clock,     accent: "text-amber-400",   sub: "awaiting approval" },
            { label: "Applications",  value: stats.applications, icon: Users,     accent: "text-blue-300",    sub: "total received"    },
            { label: "Total Views",   value: stats.views,        icon: Eye,       accent: "text-violet-300",  sub: "across all jobs"   },
          ].map(({ label, value, icon: Icon, accent, sub }) => (
            <div key={label} className="bg-white rounded-2xl shadow-md border border-slate-100 px-5 py-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                <Icon size={20} className={accent} />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-extrabold text-slate-800 leading-none">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="px-6 sm:px-8 pt-10 pb-10">
        <div className="grid xl:grid-cols-[1fr_340px] gap-6 items-start">

          {/* ── LEFT: Jobs ──────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Jobs panel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-800 text-base">Your Job Listings</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{jobs.length} total · {stats.live} active</p>
                </div>
                <Link
                  href="/employer/post-job"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1a3461] bg-[#eef2ff] px-4 py-2 rounded-xl hover:bg-[#dce6ff] transition-colors"
                >
                  <PlusCircle size={14} /> Post Job
                </Link>
              </div>

              {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-5">
                    <Briefcase size={32} className="text-slate-300" />
                  </div>
                  <p className="font-bold text-slate-700 text-lg">No jobs posted yet</p>
                  <p className="text-sm text-slate-400 mt-2 mb-8 max-w-xs">
                    Post your first opening to start receiving applications from verified candidates.
                  </p>
                  <Link
                    href="/employer/post-job"
                    className="inline-flex items-center gap-2 px-7 py-3 bg-[#1a3461] text-white text-sm font-bold rounded-xl hover:bg-[#142a52] transition-colors shadow-sm"
                  >
                    <PlusCircle size={16} /> Post Your First Job
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {jobs.map(job => {
                    const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.DRAFT
                    const StatusIcon = cfg.icon
                    const canEdit   = !["CLOSED","EXPIRED"].includes(job.status)
                    const canClose  = job.status === "ACTIVE" || job.status === "PENDING_REVIEW"
                    const canRepost = ["CLOSED","EXPIRED","REJECTED"].includes(job.status)

                    return (
                      <div key={job.id} className="px-6 py-5 hover:bg-slate-50/70 transition-colors group">
                        <div className="flex items-start gap-4">
                          {/* Category icon block */}
                          <div className="w-11 h-11 rounded-xl bg-[#eef2ff] flex items-center justify-center shrink-0 mt-0.5">
                            <Briefcase size={18} className="text-[#1a3461]" />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Title + status */}
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <Link
                                href={`/jobs/${job.id}`}
                                className="font-bold text-slate-900 hover:text-[#1a3461] transition-colors text-[15px] leading-snug"
                              >
                                {job.title}
                              </Link>
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                              </span>
                            </div>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <MapPin size={11} /> {job.city.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Tag size={11} /> {job.category.nameEn}
                              </span>
                              <span className="flex items-center gap-1 font-semibold text-slate-500">
                                <IndianRupee size={11} /> {formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)}
                              </span>
                            </div>

                            {/* Action row */}
                            <div className="flex items-center gap-2 mt-3.5 flex-wrap">
                              <Link
                                href={`/employer/jobs/${job.id}/applicants`}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a3461] bg-[#eef2ff] border border-[#1a3461]/15 px-3.5 py-1.5 rounded-xl hover:bg-[#dce6ff] transition-colors"
                              >
                                <Users size={12} /> {job._count.applications} Applicants
                              </Link>
                              <Link
                                href={`/employer/jobs/${job.id}/preview`}
                                className="text-xs font-semibold text-slate-500 border border-slate-200 px-3.5 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                              >
                                Preview
                              </Link>
                              {canEdit && (
                                <Link
                                  href={`/employer/jobs/${job.id}/edit`}
                                  className="text-xs font-semibold text-slate-500 border border-slate-200 px-3.5 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                  Edit
                                </Link>
                              )}
                              <EmployerJobActions jobId={job.id} canClose={canClose} canRepost={canRepost} />
                            </div>
                          </div>

                          {/* Right: applicant count big */}
                          <div className="hidden sm:flex flex-col items-center text-center shrink-0 min-w-[52px]">
                            <span className="text-2xl font-extrabold text-slate-800 leading-none">{job._count.applications}</span>
                            <span className="text-[10px] text-slate-400 font-medium mt-1">applicants</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Drafts panel */}
            {draftJobs.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-800 text-base">Saved Drafts</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{draftJobs.length} draft{draftJobs.length > 1 ? "s" : ""} · continue where you left off</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {draftJobs.map(draft => (
                    <div key={draft.id} className="px-6 py-4 hover:bg-slate-50/70 transition-colors group flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <AlertCircle size={16} className="text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{draft.title || "Untitled Draft"}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {[draft.category?.nameEn, draft.city?.name].filter(Boolean).join(" · ")}
                          {" · "}
                          <span>Saved {new Date(draft.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        </p>
                      </div>
                      <Link
                        href={`/employer/post-job?draft=${draft.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a3461] bg-[#eef2ff] border border-[#1a3461]/15 px-4 py-2 rounded-xl hover:bg-[#dce6ff] transition-colors shrink-0"
                      >
                        Continue <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick links */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { href: "/employer/candidates", label: "Search Talent", sub: "Browse verified job seekers", icon: Users,       bg: "bg-violet-50",  iconColor: "text-violet-500" },
                { href: "/employer/responses",  label: "Responses",     sub: "View all job applications",    icon: BarChart2,   bg: "bg-blue-50",    iconColor: "text-blue-500"   },
                { href: "/employer/plans",      label: "Upgrade Plan",  sub: "Unlock candidate contacts",    icon: Zap,         bg: "bg-orange-50",  iconColor: "text-orange-500" },
              ].map(({ href, label, sub, icon: Icon, bg, iconColor }) => (
                <Link
                  key={href}
                  href={href}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-slate-200 transition-all group"
                >
                  <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={iconColor} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-sm">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                  </div>
                  <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Sidebar cards ─────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Subscription status */}
            {activeSub ? (
              <div className="bg-gradient-to-br from-[#1a3461] to-[#243f7a] rounded-2xl p-5 text-white shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <TrendingUp size={16} className="text-orange-300" />
                    </div>
                    <span className="font-bold text-sm">{activeSub.plan.name}</span>
                  </div>
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                    {activeSub.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-white/10 rounded-xl p-2.5">
                    <p className="text-base font-extrabold">{activeSub.plan.activeJobLimit}</p>
                    <p className="text-[10px] text-white/60 mt-0.5">Job slots</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5">
                    <p className="text-base font-extrabold">{activeSub.plan.candidateUnlockCredits - activeSub.candidateUnlocksUsed}</p>
                    <p className="text-[10px] text-white/60 mt-0.5">Unlocks left</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5">
                    <p className="text-base font-extrabold">{activeSub.plan.boostCredits - activeSub.boostsUsed}</p>
                    <p className="text-[10px] text-white/60 mt-0.5">Boosts left</p>
                  </div>
                </div>
                <p className="text-xs text-white/50 mb-3">Expires in {daysLeft(activeSub.expiresAt.toISOString())} days</p>
                <Link href="/employer/plans" className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs font-bold text-white">
                  Manage Plan <ArrowUpRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#1a3461] to-[#243f7a] rounded-2xl p-5 text-white shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Zap size={18} className="text-orange-300" fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Free Plan</p>
                    <p className="text-xs text-white/50">1 job · no contact unlocks</p>
                  </div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed mb-4">
                  Upgrade to unlock candidate phone numbers, boost jobs to the top, and post multiple openings simultaneously.
                </p>
                <div className="flex flex-col gap-2 mb-4">
                  {["Unlock candidate contacts", "Post unlimited jobs", "Boost to top of search", "High-reach push notifications"].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-white/80">
                      <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  href="/employer/plans"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#f97316] hover:bg-[#ea6c0a] transition-colors text-sm font-bold text-white shadow-sm"
                >
                  <Zap size={14} fill="currentColor" /> View Plans
                </Link>
              </div>
            )}

            {/* Setup checklist */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-800 text-sm">Account Setup</span>
                  <span className="text-xs font-extrabold text-[#1a3461] bg-[#eef2ff] px-2.5 py-1 rounded-full">{pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1a3461] to-[#3b6cb7] rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {steps.map(s => (
                  <div key={s.label} className="flex items-center gap-3 px-5 py-3.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      s.done ? "bg-emerald-500" : "border-2 border-slate-200 bg-slate-50"
                    }`}>
                      {s.done
                        ? <CheckCircle size={12} className="text-white" />
                        : <div className="w-2 h-2 rounded-full bg-slate-300" />
                      }
                    </div>
                    <span className={`flex-1 text-sm ${s.done ? "text-slate-400 line-through decoration-slate-300" : "text-slate-700 font-medium"}`}>
                      {s.label}
                    </span>
                    {s.action && !s.done ? (
                      <Link href={s.action} className="text-xs text-[#1a3461] font-bold flex items-center gap-1 hover:underline shrink-0">
                        {s.actionIcon === "upload" ? <Upload size={11} /> : <Info size={11} />}
                        Do it
                      </Link>
                    ) : s.done ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">✓</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Help & contact */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="font-bold text-slate-800 mb-0.5">Need help hiring?</p>
              <p className="text-xs text-slate-400 mb-4">Talk to our team — we're here to help you get started.</p>
              <div className="flex flex-col gap-2.5">
                <a
                  href="mailto:support@jobsready.in"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-[#eef2ff] border border-transparent hover:border-[#1a3461]/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#eef2ff] flex items-center justify-center shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1a3461" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-700">Email Support</p>
                    <p className="text-xs text-slate-400 truncate">support@jobsready.in</p>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-300 group-hover:text-[#1a3461] transition-colors shrink-0" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
