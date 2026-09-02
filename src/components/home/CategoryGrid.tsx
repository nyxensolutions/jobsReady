import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"
import ScrollReveal from "@/components/home/ScrollReveal"

const CATEGORIES = [
  { slug: "delivery",     tKey: "delivery",     emoji: "🛵", vacancies: "23L+",  bg: "bg-amber-50",   ring: "hover:ring-amber-300",  text: "text-amber-700"   },
  { slug: "bpo",          tKey: "bpo",          emoji: "🎧", vacancies: "8L+",   bg: "bg-cyan-50",    ring: "hover:ring-cyan-300",   text: "text-cyan-700"    },
  { slug: "driver",       tKey: "driver",       emoji: "🚗", vacancies: "3.3L+", bg: "bg-sky-50",     ring: "hover:ring-sky-300",    text: "text-sky-700"     },
  { slug: "sales",        tKey: "sales",        emoji: "📈", vacancies: "5L+",   bg: "bg-green-50",   ring: "hover:ring-green-300",  text: "text-green-700"   },
  { slug: "security",     tKey: "security",     emoji: "🛡️", vacancies: "70K+",  bg: "bg-red-50",     ring: "hover:ring-red-300",    text: "text-red-700"     },
  { slug: "housekeeping", tKey: "housekeeping", emoji: "🧹", vacancies: "1.5L+", bg: "bg-purple-50",  ring: "hover:ring-purple-300", text: "text-purple-700"  },
  { slug: "cook",         tKey: "cook",         emoji: "👨‍🍳", vacancies: "80K+",  bg: "bg-yellow-50",  ring: "hover:ring-yellow-300", text: "text-yellow-700"  },
  { slug: "dataEntry",    tKey: "dataEntry",    emoji: "⌨️", vacancies: "2L+",   bg: "bg-lime-50",    ring: "hover:ring-lime-300",   text: "text-lime-700"    },
  { slug: "construction", tKey: "construction", emoji: "🏗️", vacancies: "1L+",   bg: "bg-orange-50",  ring: "hover:ring-orange-300", text: "text-orange-700"  },
  { slug: "factory",      tKey: "factory",      emoji: "🏭", vacancies: "70K+",  bg: "bg-slate-50",   ring: "hover:ring-slate-300",  text: "text-slate-700"   },
  { slug: "retail",       tKey: "retail",       emoji: "🛒", vacancies: "2L+",   bg: "bg-pink-50",    ring: "hover:ring-pink-300",   text: "text-pink-700"    },
  { slug: "fieldWork",    tKey: "fieldWork",    emoji: "📋", vacancies: "1.2L+", bg: "bg-teal-50",    ring: "hover:ring-teal-300",   text: "text-teal-700"    },
  { slug: "teaching",     tKey: "teaching",     emoji: "📚", vacancies: "1.5L+", bg: "bg-violet-50",  ring: "hover:ring-violet-300", text: "text-violet-700"  },
  { slug: "accounting",   tKey: "accounting",   emoji: "🧾", vacancies: "60K+",  bg: "bg-emerald-50", ring: "hover:ring-emerald-300",text: "text-emerald-700" },
  { slug: "it",           tKey: "it",           emoji: "💻", vacancies: "10K+",  bg: "bg-indigo-50",  ring: "hover:ring-indigo-300", text: "text-indigo-700"  },
  { slug: "healthcare",   tKey: "healthcare",   emoji: "🏥", vacancies: "20K+",  bg: "bg-rose-50",    ring: "hover:ring-rose-300",   text: "text-rose-700"    },
  { slug: "beauty",       tKey: "beauty",       emoji: "💇", vacancies: "40K+",  bg: "bg-fuchsia-50", ring: "hover:ring-fuchsia-300",text: "text-fuchsia-700" },
  { slug: "logistics",    tKey: "logistics",    emoji: "📦", vacancies: "1L+",   bg: "bg-stone-50",   ring: "hover:ring-stone-300",  text: "text-stone-700"   },
]

export default async function CategoryGrid() {
  const t = await getTranslations("home.categories")
  const tc = await getTranslations("categories")

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t("title")}</h2>
            <p className="text-gray-500 mt-1 text-sm">{t("subtitle")}</p>
          </div>
          <Link href="/jobs" className="text-sm text-[#1a3461] font-medium hover:underline hidden sm:block">
            {t("viewAll")} →
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(({ slug, tKey, emoji, vacancies, bg, ring, text }, index) => {
            let label = tKey
            try { label = tc(tKey as any) } catch { /* fallback to key */ }
            return (
              <ScrollReveal key={slug} animation="fadeUp" stagger={index}>
                <Link
                  href={`/jobs?category=${slug}`}
                  className={`group flex flex-col items-center gap-2.5 p-4 rounded-2xl ${bg} hover:shadow-md transition-all ring-1 ring-transparent ${ring} border border-transparent hover:border-white h-full`}
                >
                  <div className="text-4xl leading-none select-none group-hover:scale-110 transition-transform duration-200">
                    {emoji}
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-bold leading-tight ${text}`}>{label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{vacancies} {t("jobs")}</div>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link href="/jobs" className="text-sm text-[#1a3461] font-medium hover:underline">
            {t("viewAll")} →
          </Link>
        </div>
      </div>
    </section>
  )
}
