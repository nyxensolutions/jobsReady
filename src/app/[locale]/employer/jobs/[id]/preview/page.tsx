import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import {
  MapPin, Clock, Users, ArrowLeft, CheckCircle, IndianRupee,
  Briefcase, Calendar, GraduationCap, ChevronRight, Eye, AlertCircle,
} from "lucide-react"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { formatRelativeTime } from "@/lib/utils"

type Props = { params: Promise<{ id: string; locale: string }> }

function formatSalary(min?: number | null, max?: number | null, unit = "monthly") {
  const suffix = unit === "daily" ? "/day" : "/month"
  const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
  if (min) return `From ${fmt(min)}${suffix}`
  if (max) return `Up to ${fmt(max)}${suffix}`
  return "Salary as per interview"
}

const STATUS_BANNER: Record<string, { label: string; bg: string; text: string; icon: typeof AlertCircle }> = {
  DRAFT:          { label: "This is a draft — not visible to job seekers yet.",         bg: "bg-slate-100 border-slate-300",  text: "text-slate-700",  icon: AlertCircle },
  PENDING_REVIEW: { label: "This job is under review — will go live once approved.",    bg: "bg-amber-50  border-amber-300",   text: "text-amber-800",  icon: Clock },
  ACTIVE:         { label: "This job is live and visible to job seekers.",              bg: "bg-green-50  border-green-300",   text: "text-green-800",  icon: CheckCircle },
  EXPIRED:        { label: "This listing has expired and is no longer visible.",        bg: "bg-red-50    border-red-300",     text: "text-red-800",    icon: AlertCircle },
  CLOSED:         { label: "This listing has been closed.",                             bg: "bg-slate-100 border-slate-300",  text: "text-slate-700",  icon: AlertCircle },
  REJECTED:       { label: "This listing was rejected. Edit and resubmit.",             bg: "bg-red-50    border-red-300",     text: "text-red-800",    icon: AlertCircle },
}

const SHIFT_LABELS: Record<string, string> = {
  Day: "Day Shift", Night: "Night Shift", Rotational: "Rotational Shift", Flexible: "Flexible Hours",
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time", CONTRACT: "Contract",
  GIG: "Gig / Freelance", WALK_IN: "Walk-in Interview",
}

export default async function EmployerJobPreviewPage({ params }: Props) {
  const { id } = await params

  const session = await getServerSession()
  if (!session) redirect("/login")

  const [employer, job] = await Promise.all([
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
    prisma.jobListing.findUnique({
      where: { id },
      include: {
        employer: { select: { companyName: true, description: true } },
        category: { select: { slug: true, nameEn: true } },
        city: { select: { name: true } },
      },
    }),
  ])

  if (!employer) redirect("/employer/register")
  if (!job || job.employerId !== employer.id) notFound()

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)
  const companyInitial = job.employer.companyName[0]?.toUpperCase() ?? "C"

  const banner = STATUS_BANNER[job.status] ?? STATUS_BANNER.DRAFT
  const BannerIcon = banner.icon

  const otherDetails = [
    { label: "Job Type",     value: JOB_TYPE_LABELS[job.jobType] ?? job.jobType },
    { label: "Experience",   value: job.experienceMin === 0 ? "Freshers OK" : `${job.experienceMin}+ years` },
    { label: "Openings",     value: `${job.vacancies}` },
    { label: "Salary",       value: salary },
    { label: "Location",     value: job.city.name },
    { label: "Posted",       value: formatRelativeTime(job.createdAt) },
    ...(job.shiftType         ? [{ label: "Shift Timing",  value: SHIFT_LABELS[job.shiftType] ?? `${job.shiftType} Shift` }] : []),
    ...(job.workingDaysPerWeek ? [{ label: "Working Days",  value: `${job.workingDaysPerWeek} days/week` }] : []),
    ...(job.incentives        ? [{ label: "Incentives",    value: job.incentives }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Employer nav bar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <Link
            href="/employer/dashboard"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1a3461] transition-colors"
          >
            <ArrowLeft size={13} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1.5">
              <Eye size={12} /> Employer Preview
            </span>
            <Link
              href={`/employer/jobs/${id}/edit`}
              className="text-xs font-bold text-[#1a3461] bg-[#eef2ff] border border-[#1a3461]/15 px-3 py-1.5 rounded-full hover:bg-[#dce6ff] transition-colors"
            >
              ✏ Edit Job
            </Link>
          </div>
        </div>

        {/* Status banner */}
        <div className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 mb-4 text-sm font-medium ${banner.bg} ${banner.text}`}>
          <BannerIcon size={16} className="shrink-0" />
          {banner.label}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── Main content ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Job header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
              {job.isFeatured && (
                <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full mb-3">
                  ★ Featured
                </span>
              )}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#eef2ff] text-[#1a3461] flex items-center justify-center font-black text-xl shrink-0 border border-[#dde5ff]">
                  {companyInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#1a3461] leading-tight">{job.title}</h1>
                  <p className="text-gray-500 mt-1 text-sm">{job.employer.companyName}</p>
                  <p className="text-2xl font-black text-green-600 mt-2">{salary}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={12} />{job.city.name}</span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />{job.vacancies} {job.vacancies === 1 ? "opening" : "openings"}
                    </span>
                    <span className="flex items-center gap-1"><Clock size={12} />{formatRelativeTime(job.createdAt)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-[#eef2ff] text-[#1a3461] text-xs font-semibold px-3 py-1 rounded-full">
                      {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
                    </span>
                    {job.experienceMin === 0 && (
                      <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
                        Freshers OK
                      </span>
                    )}
                    {job.qualificationRequired && (
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                        {job.qualificationRequired} Pass
                      </span>
                    )}
                  </div>

                  {/* Disabled CTA — preview mode */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                    <button
                      disabled
                      className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-400 font-bold text-sm rounded-xl cursor-not-allowed"
                    >
                      Apply Now (preview)
                    </button>
                    <p className="self-center text-xs text-gray-400 italic">Buttons are disabled in preview mode</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Highlights */}
            {otherDetails.filter(d => ["Job Type","Experience","Openings","Salary","Location"].includes(d.label)).length > 0 && (
              <div className="bg-[#eef2ff] border border-[#dde5ff] rounded-2xl p-5">
                <h2 className="font-bold text-[#1a3461] mb-4 flex items-center gap-2">
                  <Briefcase size={16} /> Job Highlights
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { icon: GraduationCap, label: "Education", value: job.qualificationRequired ? `${job.qualificationRequired} Pass` : "All levels" },
                    { icon: Users,         label: "Openings",  value: `${job.vacancies}` },
                    { icon: IndianRupee,   label: "Salary",    value: salary },
                    { icon: Calendar,      label: "Experience",value: job.experienceMin === 0 ? "Freshers OK" : `${job.experienceMin}+ yrs` },
                    { icon: MapPin,        label: "Location",  value: job.city.name },
                    { icon: Briefcase,     label: "Job Type",  value: JOB_TYPE_LABELS[job.jobType] ?? job.jobType },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-xs text-[#1a3461]/60 mb-1 flex items-center justify-center gap-1"><Icon size={12} /> {label}</p>
                      <p className="text-sm font-bold text-[#1a3461]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">About this job</h2>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {job.description || <span className="text-gray-400 italic">No description added yet.</span>}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="flex flex-col gap-2.5">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Other Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Other Details</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {otherDetails.map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Perks */}
            {job.perks.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-3">Perks &amp; Benefits</h2>
                <div className="flex flex-wrap gap-2">
                  {job.perks.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full">
                      <CheckCircle size={11} /> {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="flex flex-col gap-4">

            {/* Company card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-3 text-sm">About the Company</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[#eef2ff] text-[#1a3461] flex items-center justify-center font-black text-lg border border-[#dde5ff]">
                  {companyInitial}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{job.employer.companyName}</p>
                  <p className="text-xs text-gray-400">{job.city.name}</p>
                </div>
              </div>
              {job.employer.description && (
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">{job.employer.description}</p>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
              <p className="font-bold text-gray-800 text-sm">Quick Actions</p>
              <Link
                href={`/employer/jobs/${id}/edit`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#1a3461] text-white text-sm font-bold hover:bg-[#142a52] transition-colors"
              >
                ✏ Edit this Job
              </Link>
              <Link
                href="/employer/dashboard"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </Link>
              {job.status === "DRAFT" && (
                <Link
                  href={`/employer/post-job?draft=${id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#1a3461]/30 text-[#1a3461] text-sm font-semibold hover:bg-[#eef2ff] transition-colors"
                >
                  Continue Editing Draft
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
