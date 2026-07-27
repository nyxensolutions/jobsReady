import type { Metadata } from "next"
import Link from "next/link"
import { Target, Users, Zap, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us",
  description: "Job Ready is India's dedicated blue-collar job portal connecting workers with employers across 200+ cities. Built by NyxenCloud Solution Pvt. Ltd.",
}

const VALUES = [
  { icon: Target, title: "Our Mission", desc: "To bridge the gap between India's 500 million blue-collar workforce and the employers who need them — fast, free, and in their own language." },
  { icon: Users, title: "Who We Serve", desc: "Delivery workers, drivers, security guards, cooks, construction workers, factory hands, sales executives, and every frontline professional who keeps India running." },
  { icon: Zap, title: "How We're Different", desc: "No lengthy forms, no paid subscriptions for seekers, no irrelevant results. Just the right job, in the right city, reachable in two taps." },
  { icon: Heart, title: "Our Commitment", desc: "We are committed to building a platform that respects workers' dignity, protects their data, and gives them a fair shot at every opportunity." },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3461] to-[#1e4080] text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            A product of NyxenCloud Solution Pvt. Ltd.
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-4">About Job Ready</h1>
          <p className="text-white/75 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            We're building India's most trusted job platform for blue-collar and frontline workers —
            connecting millions of job seekers with employers across every city and town.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#1a3461] mb-4">Our Story</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Job Ready was born from a simple observation: India has hundreds of millions of skilled,
                hard-working people — delivery workers, drivers, cooks, security guards — who struggle
                to find the right jobs simply because existing job platforms are built for office workers.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We set out to change that. Job Ready is built ground-up for India's frontline workforce:
                phone-number login (no email required), Hindi and regional language support, jobs
                listed by salary and city, and a direct "Call HR" button on every listing.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Developed by <strong>NyxenCloud Solution Pvt. Ltd.</strong>, a technology company focused
                on building accessible digital products for India's working population.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: "50,000+", label: "Active Job Listings" },
                { val: "200+",    label: "Cities Covered" },
                { val: "5,000+",  label: "Employers Hiring" },
                { val: "25,000+", label: "Successful Hires" },
              ].map(({ val, label }) => (
                <div key={label} className="bg-[#f0f4ff] rounded-2xl p-5 text-center">
                  <p className="text-2xl font-black text-[#1a3461]">{val}</p>
                  <p className="text-xs text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1a3461] text-center mb-10">What We Stand For</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="w-10 h-10 rounded-xl bg-[#eef2ff] flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#1a3461]" />
                </div>
                <h3 className="font-bold text-[#1a3461] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1a3461] mb-6">Company Information</h2>
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 text-sm text-gray-600 space-y-2">
            <p><strong className="text-gray-800">Company Name:</strong> NyxenCloud Solution Pvt. Ltd.</p>
            <p><strong className="text-gray-800">Website:</strong>{" "}
              <a href="https://www.nyxensolutions.net" className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
                www.nyxensolutions.net
              </a>
            </p>
            <p><strong className="text-gray-800">Product:</strong> Job Ready (jobready.in)</p>
            <p><strong className="text-gray-800">Registered in:</strong> India</p>
            <p><strong className="text-gray-800">Contact:</strong>{" "}
              <a href="mailto:support@jobready.in" className="text-blue-700 hover:underline">support@jobready.in</a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-[#1a3461] text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-3">Ready to find your next job?</h2>
          <p className="text-white/70 text-sm mb-6">Join thousands of workers who found their dream job on Job Ready.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/jobs" className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors text-sm">
              Browse Jobs
            </Link>
            <Link href="/employer" className="px-6 py-3 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors text-sm">
              I'm an Employer
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
