import Link from "next/link"
import Image from "next/image"

const SEEKER_STEPS = [
  { num: "1", img: "/images/step-register.jpg", label: "Sign Up Free", desc: "Quick OTP login with your mobile — no resume needed" },
  { num: "2", img: "/images/step-post.jpg",     label: "Browse Jobs",  desc: "Search by role, salary, city, and qualification" },
  { num: "3", img: "/images/step-hire.jpg",     label: "Get Hired",    desc: "Call HR directly and walk in for the interview" },
]

export default function HowItWorks() {
  return (
    <section className="py-14 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">How It Works</h2>
          <p className="text-sm text-gray-400 mt-1">Find a job in 3 easy steps — 100% free</p>
        </div>

        {/* Step cards with photos */}
        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          {SEEKER_STEPS.map(({ num, img, label, desc }) => (
            <div key={num} className="flex flex-col rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="relative aspect-video w-full">
                <Image src={img} alt={label} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-3 left-3 w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center shadow">
                  {num}
                </span>
              </div>
              <div className="p-4 bg-white flex-1">
                <p className="font-bold text-gray-800 text-sm">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/login"
            className="flex items-center justify-center py-3.5 rounded-2xl bg-[#b45309] text-white font-bold text-sm hover:bg-[#92400e] transition-colors shadow-sm"
          >
            Get a Job Now — Free
          </Link>
          <Link
            href="/employer/register"
            className="flex items-center justify-center py-3.5 rounded-2xl bg-[#1a3461] text-white font-bold text-sm hover:bg-[#142a52] transition-colors shadow-sm"
          >
            Post a Job — Free
          </Link>
        </div>
      </div>
    </section>
  )
}
