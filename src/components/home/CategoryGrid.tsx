import Link from "next/link"

const CATEGORIES = [
  { slug: "delivery",     label: "Delivery",         emoji: "🛵", vacancies: "23L+",  bg: "bg-amber-50",   ring: "hover:ring-amber-300",  text: "text-amber-700"   },
  { slug: "bpo",          label: "BPO / Telecaller", emoji: "🎧", vacancies: "8L+",   bg: "bg-cyan-50",    ring: "hover:ring-cyan-300",   text: "text-cyan-700"    },
  { slug: "driver",       label: "Driver",           emoji: "🚗", vacancies: "3.3L+", bg: "bg-sky-50",     ring: "hover:ring-sky-300",    text: "text-sky-700"     },
  { slug: "sales",        label: "Sales",            emoji: "📈", vacancies: "5L+",   bg: "bg-green-50",   ring: "hover:ring-green-300",  text: "text-green-700"   },
  { slug: "security",     label: "Security Guard",   emoji: "🛡️", vacancies: "70K+",  bg: "bg-red-50",     ring: "hover:ring-red-300",    text: "text-red-700"     },
  { slug: "housekeeping", label: "Housekeeping",     emoji: "🧹", vacancies: "1.5L+", bg: "bg-purple-50",  ring: "hover:ring-purple-300", text: "text-purple-700"  },
  { slug: "cook",         label: "Cook / Chef",      emoji: "👨‍🍳", vacancies: "80K+",  bg: "bg-yellow-50",  ring: "hover:ring-yellow-300", text: "text-yellow-700"  },
  { slug: "dataEntry",    label: "Data Entry",       emoji: "⌨️", vacancies: "2L+",   bg: "bg-lime-50",    ring: "hover:ring-lime-300",   text: "text-lime-700"    },
  { slug: "construction", label: "Construction",     emoji: "🏗️", vacancies: "1L+",   bg: "bg-orange-50",  ring: "hover:ring-orange-300", text: "text-orange-700"  },
  { slug: "factory",      label: "Factory / Mfg",   emoji: "🏭", vacancies: "70K+",  bg: "bg-slate-50",   ring: "hover:ring-slate-300",  text: "text-slate-700"   },
  { slug: "retail",       label: "Retail / Shop",    emoji: "🛒", vacancies: "2L+",   bg: "bg-pink-50",    ring: "hover:ring-pink-300",   text: "text-pink-700"    },
  { slug: "fieldWork",    label: "Field Work",       emoji: "📋", vacancies: "1.2L+", bg: "bg-teal-50",    ring: "hover:ring-teal-300",   text: "text-teal-700"    },
  { slug: "teaching",     label: "Teaching",         emoji: "📚", vacancies: "1.5L+", bg: "bg-violet-50",  ring: "hover:ring-violet-300", text: "text-violet-700"  },
  { slug: "accounting",   label: "Accounting",       emoji: "🧾", vacancies: "60K+",  bg: "bg-emerald-50", ring: "hover:ring-emerald-300",text: "text-emerald-700" },
  { slug: "it",           label: "IT / Computer",    emoji: "💻", vacancies: "10K+",  bg: "bg-indigo-50",  ring: "hover:ring-indigo-300", text: "text-indigo-700"  },
  { slug: "healthcare",   label: "Healthcare",       emoji: "🏥", vacancies: "20K+",  bg: "bg-rose-50",    ring: "hover:ring-rose-300",   text: "text-rose-700"    },
  { slug: "beauty",       label: "Beauty / Salon",   emoji: "💇", vacancies: "40K+",  bg: "bg-fuchsia-50", ring: "hover:ring-fuchsia-300",text: "text-fuchsia-700" },
  { slug: "logistics",    label: "Warehouse",        emoji: "📦", vacancies: "1L+",   bg: "bg-stone-50",   ring: "hover:ring-stone-300",  text: "text-stone-700"   },
]

export default function CategoryGrid() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">What kind of job do you want?</h2>
            <p className="text-gray-500 mt-1 text-sm">Browse by job type — find verified openings near you</p>
          </div>
          <Link href="/jobs" className="text-sm text-[#1a3461] font-medium hover:underline hidden sm:block">
            View all jobs →
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(({ slug, label, emoji, vacancies, bg, ring, text }) => (
            <Link
              key={slug}
              href={`/jobs?category=${slug}`}
              className={`group flex flex-col items-center gap-2.5 p-4 rounded-2xl ${bg} hover:shadow-md transition-all ring-1 ring-transparent ${ring} border border-transparent hover:border-white`}
            >
              <div className="text-4xl leading-none select-none group-hover:scale-110 transition-transform duration-200">
                {emoji}
              </div>
              <div className="text-center">
                <div className={`text-xs font-bold leading-tight ${text}`}>{label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{vacancies} jobs</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link href="/jobs" className="text-sm text-[#1a3461] font-medium hover:underline">
            View all jobs →
          </Link>
        </div>
      </div>
    </section>
  )
}
