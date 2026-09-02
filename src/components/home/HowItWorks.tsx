import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { getTranslations } from "next-intl/server"
import ScrollReveal from "@/components/home/ScrollReveal"

export default async function HowItWorks() {
  const t = await getTranslations("home.howItWorks")

  const SEEKER_STEPS = [
    { num: "1", img: "/images/step-register.jpg", label: t("step1Label"), desc: t("step1Desc") },
    { num: "2", img: "/images/step-post.jpg",     label: t("step2Label"), desc: t("step2Desc") },
    { num: "3", img: "/images/step-hire.jpg",     label: t("step3Label"), desc: t("step3Desc") },
  ]

  return (
    <section className="py-14 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t("title")}</h2>
          <p className="text-sm text-gray-400 mt-1">{t("subtitle")}</p>
        </ScrollReveal>

        {/* Step cards with photos */}
        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          {SEEKER_STEPS.map(({ num, img, label, desc }, index) => (
            <ScrollReveal key={num} animation="fadeUp" stagger={index} className="flex flex-col rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-full">
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
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal animation="fadeUp" delay={400} className="grid md:grid-cols-2 gap-4">
          <Link
            href="/login"
            className="flex items-center justify-center py-3.5 rounded-2xl bg-[#b45309] text-white font-bold text-sm hover:bg-[#92400e] transition-colors shadow-sm"
          >
            {t("ctaSeeker")}
          </Link>
          <Link
            href="/employer/register"
            className="flex items-center justify-center py-3.5 rounded-2xl bg-[#1a3461] text-white font-bold text-sm hover:bg-[#142a52] transition-colors shadow-sm"
          >
            {t("ctaEmployer")}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}
