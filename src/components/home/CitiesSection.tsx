import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { getTranslations } from "next-intl/server"
import ScrollReveal from "@/components/home/ScrollReveal"

const CITIES = [
  { name: "Delhi",         tKey: "Delhi",        slug: "delhi",         img: "/images/cities/delhi.jpg" },
  { name: "Noida",         tKey: "Noida",        slug: "noida",         img: "/images/cities/noida.jpg" },
  { name: "Gurugram",      tKey: "Gurugram",     slug: "gurugram",      img: "/images/cities/gurugram.jpg" },
  { name: "Ghaziabad",     tKey: "Ghaziabad",    slug: "ghaziabad",     img: "/images/cities/ghaziabad.jpg" },
  { name: "Faridabad",     tKey: "Faridabad",    slug: "faridabad",     img: "/images/cities/faridabad.jpg" },
  { name: "Greater Noida", tKey: "Greater Noida", slug: "greater-noida", img: "/images/cities/greater-noida.jpg" },
  { name: "Meerut",        tKey: "Meerut",       slug: "meerut",        img: "/images/cities/meerut.jpg" },
  { name: "Hapur",         tKey: "Hapur",        slug: "hapur",         img: "/images/cities/hapur.jpg" },
]

function CityTile({ city, translatedName, nearYouLabel }: { city: typeof CITIES[0]; translatedName: string; nearYouLabel: string }) {
  return (
    <Link
      href={`/jobs?city=${city.slug}`}
      className="relative rounded-xl overflow-hidden group cursor-pointer aspect-[4/3] flex items-end h-full"
    >
      <Image
        src={city.img}
        alt={`Jobs in ${city.name}`}
        fill
        className="object-cover transition-transform duration-[8s] ease-out group-hover:scale-110 group-hover:translate-x-[-1%] group-hover:translate-y-[-1%]"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      <div className="relative z-10 p-3 w-full">
        <p className="text-white font-bold text-base leading-tight drop-shadow">{translatedName}</p>
        <p className="text-white/75 text-xs">{nearYouLabel}</p>
      </div>
    </Link>
  )
}

export default async function CitiesSection() {
  const t = await getTranslations("home.cities")

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{t("title")}</h2>
          <p className="text-gray-500 text-sm mb-6">{t("subtitle")}</p>
        </ScrollReveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CITIES.map((c, index) => (
            <ScrollReveal key={c.slug} animation="zoomIn" stagger={index}>
              <CityTile city={c} translatedName={t(c.tKey as any)} nearYouLabel={t("nearYou")} />
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/cities" className="inline-block border border-[#1a3461] text-[#1a3461] font-semibold px-6 py-2 rounded-full text-sm hover:bg-[#1a3461] hover:text-white transition-colors">
            {t("browseAll")}
          </Link>
        </div>
      </div>
    </section>
  )
}
