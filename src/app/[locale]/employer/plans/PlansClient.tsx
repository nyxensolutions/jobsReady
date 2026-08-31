"use client"

import { useLocale } from "next-intl"
import {
  Briefcase, Users, TrendingUp, Clock, Star, Zap, CheckCircle,
  ChevronRight, Shield, Search, Megaphone, Calendar, Lock, Sparkles,
} from "lucide-react"
import type { Plan } from "@prisma/client"

// ── Types ──────────────────────────────────────────────────────
interface ActiveSubInfo {
  id: string; planName: string; planSlug: string; status: string
  expiresAt: string; candidateUnlocksUsed: number; boostsUsed: number
  activeJobLimit: number; candidateUnlockCredits: number; boostCredits: number
  planPrice: number
}
interface Props {
  plans: Plan[]
  activeSub: ActiveSubInfo | null
  activeJobCount: number
}

// ── Helpers ────────────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString("en-IN") }

// All features included in the current free plan
const FREE_FEATURES = [
  { icon: <Briefcase size={16} />, title: "Post Unlimited Jobs", desc: "No limits on how many roles you can post" },
  { icon: <Users size={16} />, title: "Unlimited Applications", desc: "Receive as many candidate applications as they send" },
  { icon: <Search size={16} />, title: "Search All Candidates", desc: "Browse and filter from our full candidate database" },
  { icon: <TrendingUp size={16} />, title: "High Reach Distribution", desc: "Jobs pushed via notifications to matching candidates" },
  { icon: <Zap size={16} />, title: "Instant Candidate Unlocks", desc: "View contact details of any candidate for free" },
  { icon: <Shield size={16} />, title: "Verified Badge (on doc upload)", desc: "Get a badge that earns 80% more responses" },
  { icon: <Megaphone size={16} />, title: "Featured Job Boosts", desc: "Push your job to the top of search results" },
  { icon: <Calendar size={16} />, title: "No Expiry on Jobs", desc: "Jobs stay active until you close or fill the role" },
  { icon: <Star size={16} />, title: "Analytics Dashboard", desc: "Track views, applications, and candidate interest" },
  { icon: <Clock size={16} />, title: "Priority Support", desc: "Reach our team via email or phone — we respond fast" },
]

// Coming-soon premium plan preview cards
const COMING_PLANS = [
  { name: "Starter", price: "₹999", period: "/mo", tag: null, desc: "For small businesses making their first hire" },
  { name: "Growth", price: "₹2,499", period: "/3 mo", tag: "Popular", desc: "For teams hiring regularly across multiple roles" },
  { name: "Scale", price: "₹7,999", period: "/yr", tag: "Best Value", desc: "For high-volume hiring with unlimited everything" },
]

export default function PlansClient({ activeSub, activeJobCount }: Props) {
  const locale = useLocale()

  return (
    <div className="min-h-screen bg-[#eef2ff]">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── Breadcrumb ─────────────────────────────────── */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <a href={`/${locale}/employer/dashboard`} className="hover:text-slate-600 transition-colors">Dashboard</a>
          <ChevronRight size={12} />
          <span className="text-slate-600">Plans &amp; Pricing</span>
        </div>

        {/* ── Hero ──────────────────────────────────────── */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-emerald-200">
            <Sparkles size={12} /> FREE during launch — all features included
          </span>
          <h1 className="text-3xl font-extrabold text-[#1a3461] tracking-tight mb-2">
            Hire for free. No limits.
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Jobs24India is free for all employers right now. Post jobs, unlock candidates, and boost listings — zero cost during our launch phase.
            Paid plans are coming but current users will get early-bird pricing.
          </p>
        </div>

        {/* ── Free Plan Card ─────────────────────────────── */}
        <div className="bg-white rounded-3xl border-2 border-emerald-400 shadow-xl shadow-emerald-100 mb-8 overflow-hidden">
          {/* Green header bar */}
          <div className="bg-emerald-500 px-8 py-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-emerald-100 text-xs font-semibold tracking-widest uppercase mb-0.5">Your current plan</p>
              <h2 className="text-white text-2xl font-extrabold">Free Plan</h2>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-white">₹0</span>
              <span className="text-emerald-200 text-sm">/ forever (for now)</span>
            </div>
          </div>

          {/* Active stats (if sub exists) */}
          {activeSub && (
            <div className="bg-emerald-50 border-b border-emerald-100 px-8 py-4 flex flex-wrap gap-6">
              {[
                { label: "Active Jobs", value: `${activeJobCount} posting${activeJobCount !== 1 ? "s" : ""}` },
                { label: "Unlocks Used", value: fmt(activeSub.candidateUnlocksUsed) },
                { label: "Boosts Used", value: fmt(activeSub.boostsUsed) },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide">{s.label}</p>
                  <p className="text-lg font-extrabold text-[#1a3461] font-mono">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Features grid */}
          <div className="px-8 py-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Everything included — free</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {FREE_FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <span className="mt-0.5 w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
                    {f.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{f.title}</p>
                    <p className="text-xs text-slate-400 leading-snug">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Coming Soon Plans ─────────────────────────── */}
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-widest">
              <Lock size={12} /> Premium Plans — Coming Soon
            </div>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">Early users will get special pricing when these launch.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 opacity-50 pointer-events-none select-none">
          {COMING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-3 relative"
            >
              {plan.tag && (
                <span className="absolute top-4 right-4 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  {plan.tag}
                </span>
              )}
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Briefcase size={16} />
              </div>
              <div>
                <p className="font-bold text-slate-700">{plan.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{plan.desc}</p>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-slate-700 font-mono">{plan.price}</span>
                <span className="text-slate-400 text-xs">{plan.period}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm mt-auto">
                <Lock size={12} /> Coming Soon
              </div>
            </div>
          ))}
        </div>

        {/* ── Early bird CTA ─────────────────────────────── */}
        <div className="mt-8 bg-[#1a3461] rounded-2xl px-8 py-6 text-center">
          <p className="text-white font-bold text-lg mb-1">Enjoying the free plan?</p>
          <p className="text-blue-200 text-sm mb-4">
            Keep hiring for free. When premium plans launch, existing users get early-bird pricing — automatically.
          </p>
          <a
            href={`/${locale}/employer/dashboard`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Back to Dashboard
          </a>
        </div>

      </div>
    </div>
  )
}
