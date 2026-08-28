import { redirect } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

/**
 * Landing page after Cashfree redirects back.
 * Cashfree appends ?order_id=xxx to the return_url.
 * We check if the webhook already activated the subscription.
 * If not yet processed (webhook is async, can lag ~1-2s), we show a
 * "processing" state with auto-refresh so the user never sees a dead end.
 */
export default async function PaymentReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ order_id?: string }>
}) {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const { locale } = await params
  const { order_id } = await searchParams

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session.uid },
  })
  if (!employer) redirect(`/${locale}/employer/register`)

  // Check if the webhook has already activated a subscription for this order
  const sub = order_id
    ? await prisma.subscription.findFirst({
        where: {
          employerId: employer.id,
          razorpayOrderId: order_id,   // cf order id stored here
          status: { in: ["ACTIVE", "TRIAL"] },
        },
        include: { plan: true },
      })
    : null

  // Also check for any recently activated sub (webhook may have come from a different order_id)
  const anySub = sub ?? await prisma.subscription.findFirst({
    where: {
      employerId: employer.id,
      status: { in: ["ACTIVE", "TRIAL"] },
      expiresAt: { gt: new Date() },
    },
    include: { plan: true },
    orderBy: { startedAt: "desc" },
  })

  const isSuccess = !!anySub
  const isProcessing = !isSuccess && !!order_id  // order exists but webhook not yet processed

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">

        {isSuccess ? (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">Payment successful! 🎉</h1>
            <p className="text-sm text-gray-500 mb-2">
              Your <span className="font-bold text-[#1a3461]">{anySub!.plan.name}</span> plan is now active.
            </p>
            <p className="text-xs text-gray-400 mb-8">
              Valid until{" "}
              {new Date(anySub!.expiresAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
            <Link
              href={`/${locale}/employer/dashboard`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a3461] text-white font-bold rounded-xl hover:bg-[#142a52] transition-colors text-sm"
            >
              Go to Dashboard <ArrowRight size={15} />
            </Link>
            <p className="text-xs text-gray-400 mt-5">
              A confirmation email has been sent to your registered email.
            </p>
          </>
        ) : isProcessing ? (
          <>
            {/* Webhook not processed yet — auto-refresh every 3s */}
            {/* eslint-disable-next-line @next/next/no-head-element */}
            <meta httpEquiv="refresh" content="4" />
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
              <Clock size={32} className="text-amber-500 animate-pulse" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">Processing payment…</h1>
            <p className="text-sm text-gray-500 mb-8">
              This usually takes a few seconds. The page will refresh automatically.
            </p>
            <Link
              href={`/${locale}/employer/plans`}
              className="text-sm text-[#1a3461] font-semibold hover:underline"
            >
              ← Back to plans
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-1">Payment not completed</h1>
            <p className="text-sm text-gray-500 mb-8">
              Your payment was not processed. No money has been deducted. Please try again.
            </p>
            <Link
              href={`/${locale}/employer/plans`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a3461] text-white font-bold rounded-xl hover:bg-[#142a52] transition-colors text-sm"
            >
              Try again <ArrowRight size={15} />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
