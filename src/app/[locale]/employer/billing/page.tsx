import { redirect } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { ArrowLeft, Download, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  ACTIVE:    { label: "Active",    color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle },
  TRIAL:     { label: "Trial",     color: "text-amber-700 bg-amber-50 border-amber-200",       icon: Clock },
  EXPIRED:   { label: "Expired",   color: "text-red-600 bg-red-50 border-red-200",             icon: XCircle },
  CANCELLED: { label: "Cancelled", color: "text-slate-500 bg-slate-50 border-slate-200",       icon: AlertCircle },
}

function fmt(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default async function BillingPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await getServerSession()
  if (!session) redirect("/login")
  const { locale } = await params

  const [dbUser, employer] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
  ])
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")
  if (!employer) redirect(`/${locale}/employer/register`)

  const subscriptions = await prisma.subscription.findMany({
    where: { employerId: employer.id },
    include: { plan: true },
    orderBy: { startedAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href={`/${locale}/employer/dashboard`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft size={15} /> Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Payment history and receipts for your account</p>
        </div>

        {/* Current plan summary */}
        {subscriptions.find(s => s.status === "ACTIVE" || s.status === "TRIAL") && (() => {
          const active = subscriptions.find(s => s.status === "ACTIVE" || s.status === "TRIAL")!
          const daysLeft = Math.max(0, Math.ceil((active.expiresAt.getTime() - Date.now()) / 86400000))
          return (
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5 mb-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{active.plan.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {active.status === "TRIAL" ? "Trial · " : ""}Active until {fmt(active.expiresAt)} · {daysLeft} days left
                </p>
              </div>
              <Link href={`/${locale}/employer/plans`}
                className="text-sm font-semibold text-[#1a3461] border border-[#1a3461]/30 px-4 py-2 rounded-xl hover:bg-[#eef2ff] transition-colors">
                Manage Plan
              </Link>
            </div>
          )
        })()}

        {/* Transaction history */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Transaction History</h2>
            <span className="text-xs text-gray-400">{subscriptions.length} record{subscriptions.length !== 1 ? "s" : ""}</span>
          </div>

          {subscriptions.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              No payment records yet.{" "}
              <Link href={`/${locale}/employer/plans`} className="text-[#1a3461] font-semibold hover:underline">
                View plans →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {subscriptions.map(sub => {
                const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.CANCELLED
                const StatusIcon = cfg.icon
                const orderId = sub.razorpayOrderId ?? "—"   // cf order id stored here
                return (
                  <div key={sub.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 text-sm">{sub.plan.name}</p>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                          <StatusIcon size={10} /> {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fmt(sub.startedAt)} → {fmt(sub.expiresAt)} · {sub.plan.durationDays} days
                      </p>
                      {orderId !== "—" && (
                        <p className="text-[11px] text-gray-400 mt-0.5 font-mono">Order: {orderId}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">
                        {sub.plan.priceRupees === 1 ? "₹1" : `₹${sub.plan.priceRupees.toLocaleString("en-IN")}`}
                      </p>
                      <p className="text-xs text-gray-400">incl. GST</p>
                    </div>
                    {/* Print receipt button */}
                    <Link
                      href={`/${locale}/employer/billing/receipt/${sub.id}`}
                      target="_blank"
                      className="ml-2 p-2 rounded-lg text-gray-400 hover:text-[#1a3461] hover:bg-[#eef2ff] transition-colors shrink-0"
                      title="Download / Print receipt"
                    >
                      <Download size={15} />
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-5">
          For billing disputes, email us at <a href="mailto:billing@jobs24india.com" className="text-[#1a3461]">billing@jobs24india.com</a>
        </p>
      </div>
    </div>
  )
}
