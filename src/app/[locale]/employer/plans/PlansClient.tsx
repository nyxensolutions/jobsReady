"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import {
  Briefcase, Users, TrendingUp, Clock, Star, Zap, CheckCircle,
  ChevronRight, ArrowRight, Shield, Search, Megaphone, Calendar,
} from "lucide-react"
import type { Plan } from "@prisma/client"

// ── Types ──────────────────────────────────────────────────────
interface ActiveSubInfo {
  id: string; planName: string; planSlug: string; status: string
  expiresAt: string; candidateUnlocksUsed: number; boostsUsed: number
  activeJobLimit: number; candidateUnlockCredits: number; boostCredits: number
}
interface Props {
  plans: Plan[]
  activeSub: ActiveSubInfo | null
  activeJobCount: number
  razorpayKeyId: string
}

// ── Helpers ────────────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString("en-IN") }
function daysLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

declare global { interface Window { Razorpay: any } }

// ── Plan card feature rows ─────────────────────────────────────
const featureRow = (icon: React.ReactNode, text: React.ReactNode, highlight = false) => (
  <li key={String(text)} className="flex items-start gap-2.5">
    <span className={`mt-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 ${
      highlight ? "bg-emerald-100 text-emerald-600" : "bg-emerald-50 text-emerald-500"
    }`}>
      <CheckCircle size={11} strokeWidth={2.5} />
    </span>
    <span className="text-[13px] text-slate-600 leading-snug">{text}</span>
  </li>
)

const warnRow = (text: React.ReactNode) => (
  <li key={String(text)} className="flex items-start gap-2.5">
    <span className="mt-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 bg-amber-50 text-amber-500">
      <Zap size={10} strokeWidth={2.5} />
    </span>
    <span className="text-[13px] text-amber-700 leading-snug">{text}</span>
  </li>
)

export default function PlansClient({ plans, activeSub, activeJobCount, razorpayKeyId }: Props) {
  const [tab, setTab] = useState<"SINGLE_HIRE" | "MULTI_HIRE">("SINGLE_HIRE")
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const locale = useLocale()

  const shown = plans.filter((p) => p.type === tab || p.isTrial)
    .filter((p) => tab === "SINGLE_HIRE" ? true : !p.isTrial)

  // ── Razorpay checkout ────────────────────────────────────────
  async function handleBuy(planSlug: string) {
    setLoading(planSlug)
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script")
          s.src = "https://checkout.razorpay.com/v1/checkout.js"
          s.onload = () => resolve()
          s.onerror = () => reject(new Error("Razorpay script failed"))
          document.head.appendChild(s)
        })
      }

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Jobs Ready",
        description: data.planName,
        theme: { color: "#1a3461" },
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planSlug,
            }),
          })
          if (verifyRes.ok) {
            router.refresh()
            router.push(`/${locale}/employer/dashboard`)
          }
        },
      })
      rzp.open()
    } catch (err) {
      console.error(err)
      alert("Could not initiate payment. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#eef2ff]">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── Page header ─────────────────────────────────── */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <a href={`/${locale}/employer/dashboard`} className="hover:text-slate-600 transition-colors">Dashboard</a>
          <ChevronRight size={12} />
          <span className="text-slate-600">Plans &amp; Pricing</span>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-[#1a3461] tracking-tight mb-1">Choose your hiring plan</h1>
          <p className="text-slate-500 text-sm">Upgrade anytime · Cancel trial before it ends at no cost · All prices inclusive of GST</p>
        </div>

        {/* ── Active plan banner ───────────────────────────── */}
        {activeSub ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-8 flex flex-wrap items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#eef2ff] flex items-center justify-center shrink-0">
              <Briefcase size={20} className="text-[#1a3461]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Active plan</p>
              <p className="font-bold text-[#1a3461]">{activeSub.planName}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeSub.status === "TRIAL" ? "Trial · " : ""}Expires in {daysLeft(activeSub.expiresAt)} days
                · {new Date(activeSub.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div className="flex gap-5">
              {[
                { label: "Active jobs", value: `${activeJobCount}/${activeSub.activeJobLimit}`, color: "text-[#1a3461]" },
                { label: "Unlocks left", value: fmt(activeSub.candidateUnlockCredits - activeSub.candidateUnlocksUsed), color: "text-orange-500" },
                { label: "Boosts left", value: fmt(activeSub.boostCredits - activeSub.boostsUsed), color: "text-emerald-600" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-xl font-extrabold font-mono ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-8 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#eef2ff] flex items-center justify-center shrink-0">
              <Briefcase size={20} className="text-[#1a3461]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-700">You&apos;re on the <span className="text-[#1a3461]">Free plan</span></p>
              <p className="text-xs text-slate-400 mt-0.5">1 active job · No candidate unlocks · No boosts</p>
            </div>
            <span className="text-xs font-semibold bg-[#eef2ff] text-[#1a3461] px-3 py-1.5 rounded-full border border-slate-200">Free</span>
          </div>
        )}

        {/* ── Toggle ──────────────────────────────────────── */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white border border-slate-200 rounded-full p-1 shadow-sm gap-1">
            {(["SINGLE_HIRE", "MULTI_HIRE"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  tab === t
                    ? "bg-[#1a3461] text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "SINGLE_HIRE"
                  ? <><Users size={13} /> Single Hire</>
                  : <><Users size={13} /> Multi Hires <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tab === "MULTI_HIRE" ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-600"}`}>Save 20%</span></>
                }
              </button>
            ))}
          </div>
        </div>

        {/* ── Plan cards ──────────────────────────────────── */}
        <div className={`grid gap-4 ${tab === "SINGLE_HIRE" ? "lg:grid-cols-4 sm:grid-cols-2" : "lg:grid-cols-3 sm:grid-cols-2"}`}>
          {shown.map((plan) => {
            const isCurrent = activeSub?.planSlug === plan.slug
            const isPopular = plan.isPopular
            const isTrial = plan.isTrial
            const monthlyPrice = plan.durationDays <= 31
              ? plan.priceRupees
              : Math.round(plan.priceRupees / (plan.durationDays / 30))

            return (
              <div
                key={plan.slug}
                className={`relative bg-white rounded-2xl flex flex-col transition-all duration-200 hover:-translate-y-1 ${
                  isPopular
                    ? "border-2 border-emerald-500 shadow-lg shadow-emerald-100"
                    : isTrial
                    ? "border border-amber-200 shadow-sm bg-amber-50/30"
                    : "border border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[11px] font-bold px-4 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap shadow-sm">
                    <Star size={10} fill="currentColor" /> Most Popular
                  </div>
                )}
                {isTrial && (
                  <span className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
                    Limited Access
                  </span>
                )}

                <div className="p-6 flex flex-col flex-1 gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isTrial ? "bg-amber-100 text-amber-600"
                    : isPopular ? "bg-emerald-100 text-emerald-600"
                    : "bg-[#eef2ff] text-[#1a3461]"
                  }`}>
                    {isTrial ? <Clock size={18} /> : isPopular ? <Star size={18} /> : <Briefcase size={18} />}
                  </div>

                  {/* Name + price */}
                  <div>
                    <p className={`font-bold text-base mb-2 ${
                      isTrial ? "text-amber-700" : isPopular ? "text-emerald-600" : "text-[#1a3461]"
                    }`}>
                      {isTrial ? "3-Day Trial"
                        : plan.durationDays === 30 ? "1 Month"
                        : plan.durationDays === 90 ? "3 Months Plan"
                        : "1 Year Plan"}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-slate-500 text-lg font-semibold">₹</span>
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-mono">
                        {isTrial ? "1" : fmt(monthlyPrice)}
                      </span>
                      {!isTrial && <span className="text-slate-400 text-xs self-end mb-1">/mo</span>}
                    </div>
                    {!isTrial && plan.durationDays > 31 && (
                      <p className="text-xs text-slate-400 mt-0.5">Pay ₹{fmt(plan.priceRupees)} upfront</p>
                    )}
                    {isTrial && (
                      <p className="text-xs text-slate-500 mt-0.5">then ₹999/mo · cancel anytime</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {isTrial ? "Hire for one role · try the platform"
                        : tab === "SINGLE_HIRE" ? "Hire for one role at a time"
                        : "Hire for many roles together"}
                    </p>
                  </div>

                  {/* CTA */}
                  {isCurrent ? (
                    <div className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-500 font-semibold rounded-xl text-sm">
                      <CheckCircle size={14} /> Current plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuy(plan.slug)}
                      disabled={!!loading}
                      className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all ${
                        isPopular
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                          : isTrial
                          ? "bg-white border-2 border-slate-200 hover:border-amber-400 text-slate-700"
                          : "bg-[#1a3461] hover:bg-[#243f7a] text-white shadow-sm"
                      } disabled:opacity-60`}
                    >
                      {loading === plan.slug ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>{isTrial ? "Start Trial Now" : "Buy Now"} <ArrowRight size={14} /></>
                      )}
                    </button>
                  )}

                  {/* Features */}
                  <ul className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                    {isTrial
                      ? warnRow(<><span className="font-semibold text-amber-700">Limited reach</span> — fewer candidate calls</>)
                      : featureRow(null, <><span className="font-semibold text-emerald-600">High reach</span> — more calls &amp; applies</>)}
                    {featureRow(null, <><strong>{plan.activeJobLimit}</strong> active job{plan.activeJobLimit > 1 ? "s" : ""} at a time</>)}
                    {featureRow(null, <>Unlock <strong>{fmt(plan.candidateUnlockCredits)}</strong> candidate profiles</>)}
                    {plan.boostCredits > 0
                      ? featureRow(null, <>Boost jobs up to <strong>{plan.boostCredits}</strong> times</>)
                      : null}
                    {featureRow(null, <>Post unlimited jobs &amp; get unlimited responses</>)}
                    {featureRow(null, <>Valid for <strong>{plan.durationDays}</strong> days</>)}
                    {isTrial && (
                      <li className="text-[11px] text-slate-400 pt-1 border-t border-dashed border-slate-200 mt-1 leading-relaxed">
                        3-day trial then auto-renews to ₹999/mo. Cancel within trial at no cost.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Feature explainer ───────────────────────────── */}
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-bold text-[#1a3461] text-base">What each feature means inside the platform</h2>
            <p className="text-xs text-slate-400 mt-1">Every plan feature has a real effect — here&apos;s exactly what happens.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-slate-100">
            {[
              { icon: <Briefcase size={16} />, color: "bg-[#eef2ff] text-[#1a3461]", title: "Active Job Limit", desc: "When you're at your limit and try posting a new job, you'll see an upgrade prompt. Closing or filling a role frees a slot immediately." },
              { icon: <Users size={16} />, color: "bg-orange-50 text-orange-500", title: "Candidate Unlocks", desc: "Seeker phone numbers are blurred by default. Clicking 'View Contact' spends 1 credit and reveals their details permanently for you." },
              { icon: <TrendingUp size={16} />, color: "bg-emerald-50 text-emerald-600", title: "Job Boosts", desc: "One boost pushes your job to the top of search results and into recommended feeds for matching seekers for 7 days." },
              { icon: <Search size={16} />, color: "bg-amber-50 text-amber-600", title: "High vs Limited Reach", desc: "High reach jobs are proactively shown via push notifications and the 'For You' feed. Limited reach only appears in direct search." },
              { icon: <Calendar size={16} />, color: "bg-[#eef2ff] text-[#1a3461]", title: "Validity Period", desc: "Credits and active job slots expire with the plan. Jobs under an expired plan are automatically paused until you renew." },
              { icon: <Shield size={16} />, color: "bg-emerald-50 text-emerald-600", title: "Unlimited Responses", desc: "Receive as many applications as candidates send — no per-application fee. You only spend credits to reveal contact info." },
            ].map((f) => (
              <div key={f.title} className="p-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${f.color}`}>{f.icon}</div>
                <p className="font-semibold text-slate-800 text-sm mb-1">{f.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
