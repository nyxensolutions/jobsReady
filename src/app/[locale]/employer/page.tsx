import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { CheckCircle, Users, Building2, TrendingUp, Zap, Phone, Star } from "lucide-react"

const STATS = [
  { value: "5,000+", label: "Companies Hiring" },
  { value: "50,000+", label: "Active Job Listings" },
  { value: "25,000+", label: "Successful Hires" },
  { value: "200+", label: "Cities Covered" },
]

const BENEFITS = [
  {
    icon: Zap,
    title: "Post in 2 Minutes",
    desc: "Simple form, no bloat. Your job goes live instantly and reaches thousands of active seekers.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Users,
    title: "Pre-Screened Candidates",
    desc: "Seekers fill complete profiles — experience, skills, location — before they apply. No junk applications.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Phone,
    title: "Direct Contact",
    desc: "Shortlisted candidates can call you directly. No middlemen, no delays.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: TrendingUp,
    title: "Frontline Focused",
    desc: "Built for delivery, security, sales, construction, healthcare and 20+ other industries.",
    color: "bg-purple-50 text-purple-600",
  },
]

const STEPS = [
  {
    num: "01",
    title: "Register your company",
    desc: "Create your employer account with company name and contact details. Verified and live in minutes.",
    img: "/images/resume.svg",
  },
  {
    num: "02",
    title: "Post your job",
    desc: "Add job title, salary, location, and requirements. Our smart form makes it fast and clear.",
    img: "/images/working.svg",
  },
  {
    num: "03",
    title: "Hire the right person",
    desc: "Review applications, shortlist candidates, and call them directly from your dashboard.",
    img: "/images/interview.svg",
  },
]

const TESTIMONIALS = [
  {
    name: "Ramesh Gupta",
    role: "Owner, Speedy Logistics",
    quote: "We hired 12 delivery boys in one week. Jobs24India is the fastest way to find frontline workers.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "HR Manager, SecureForce India",
    quote: "The quality of candidates is much better than other portals. They actually want the job.",
    rating: 5,
  },
  {
    name: "Anil Mehta",
    role: "Restaurant Owner, Mumbai",
    quote: "Posted a cook vacancy and got 8 applications the same day. Simple, fast, and free.",
    rating: 5,
  },
]

export default function EmployerLandingPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#1a3461] to-[#1e4080] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Trusted by 5,000+ employers across India
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5">
                Hire Frontline Workers<br />
                <span className="text-orange-400">Fast & Free</span>
              </h1>
              <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                Post jobs for delivery, driving, security, cooking, construction and more.
                Get applications from verified candidates within hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login?role=employer"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-colors shadow-lg"
                >
                  Register Free — Post a Job
                </Link>
                <Link
                  href="/login?role=employer&next=/employer/post-job"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-white/30 hover:bg-white/10 text-white font-semibold text-sm transition-colors"
                >
                  Post a Job Now →
                </Link>
              </div>
              <p className="text-white/50 text-xs mt-4">No credit card required · Jobs go live in minutes</p>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src="/images/hero-employer.jpg"
                  alt="Hire great frontline candidates"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-[#1a3461]/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center py-8 px-4 gap-1">
                <span className="text-2xl sm:text-3xl font-bold text-[#1a3461]">{s.value}</span>
                <span className="text-xs text-slate-500 text-center">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Jobs24India ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a3461] mb-3">Why employers choose Jobs24India</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Built specifically for India's frontline workforce — not a generic job board</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-[#1a3461] mb-2 text-sm">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a3461] mb-3">How it works</h2>
            <p className="text-slate-500">Three simple steps to your next great hire</p>
          </div>
          <div className="flex flex-col gap-16">
            {STEPS.map(({ num, title, desc, img }, i) => (
              <div
                key={num}
                className={`grid lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <span className="text-5xl font-black text-slate-100 leading-none block mb-3">{num}</span>
                  <h3 className="text-xl font-bold text-[#1a3461] mb-3">{title}</h3>
                  <p className="text-slate-500 leading-relaxed mb-6">{desc}</p>
                  <div className="flex flex-col gap-2">
                    {["Takes less than 5 minutes", "No technical knowledge needed", "Candidates apply directly"].map((pt) => (
                      <div key={pt} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle size={15} className="text-green-500 shrink-0" />
                        {pt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`flex justify-center ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <Image src={img} alt={title} width={360} height={300} className="w-full max-w-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a3461] text-center mb-10">What employers say</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, quote, rating }) => (
              <div key={name} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">"{quote}"</p>
                <div>
                  <p className="font-semibold text-[#1a3461] text-sm">{name}</p>
                  <p className="text-slate-400 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-gradient-to-r from-[#1a3461] to-[#1e4080]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Building2 size={40} className="text-orange-400 mx-auto mb-5" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to find your next hire?
          </h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            Join 5,000+ companies already hiring on Jobs24India. Post your first job free — no subscription needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login?role=employer"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition-colors shadow-lg"
            >
              Get Started — It's Free
            </Link>
            <Link
              href="/employer/candidates"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/30 hover:bg-white/10 text-white font-semibold transition-colors"
            >
              Browse Candidates
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
