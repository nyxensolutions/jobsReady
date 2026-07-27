import Link from "next/link"
import Image from "next/image"

const CITIES = [
  { name: "Delhi",         slug: "delhi",         img: "/images/cities/delhi.jpg" },
  { name: "Noida",         slug: "noida",         img: "/images/cities/noida.jpg" },
  { name: "Gurugram",      slug: "gurugram",      img: "/images/cities/gurugram.jpg" },
  { name: "Ghaziabad",     slug: "ghaziabad",     img: "/images/cities/ghaziabad.jpg" },
  { name: "Faridabad",     slug: "faridabad",     img: "/images/cities/faridabad.jpg" },
  { name: "Greater Noida", slug: "greater-noida", img: "/images/cities/greater-noida.jpg" },
  { name: "Meerut",        slug: "meerut",        img: "/images/cities/meerut.jpg" },
  { name: "Hapur",         slug: "hapur",         img: "/images/cities/hapur.jpg" },
]

function CityTile({ city }: { city: typeof CITIES[0] }) {
  return (
    <Link
      href={`/jobs?city=${city.slug}`}
      className="relative rounded-xl overflow-hidden group cursor-pointer aspect-[4/3] flex items-end"
    >
      <Image
        src={city.img}
        alt={`Jobs in ${city.name}`}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      <div className="relative z-10 p-3 w-full">
        <p className="text-white font-bold text-base leading-tight drop-shadow">{city.name}</p>
        <p className="text-white/75 text-xs">Jobs near you</p>
      </div>
    </Link>
  )
}

export default function CitiesSection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Jobs in Delhi NCR &amp; Nearby Cities</h2>
        <p className="text-gray-500 text-sm mb-6">Find verified local jobs near you — walk-in distance</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CITIES.map(c => <CityTile key={c.slug} city={c} />)}
        </div>
        <div className="text-center mt-6">
          <Link href="/cities" className="inline-block border border-[#1a3461] text-[#1a3461] font-semibold px-6 py-2 rounded-full text-sm hover:bg-[#1a3461] hover:text-white transition-colors">
            Browse All Cities
          </Link>
        </div>
      </div>
    </section>
  )
}
