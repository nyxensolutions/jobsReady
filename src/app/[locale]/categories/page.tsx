import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import {
  Truck, Car, TrendingUp, Shield, Sparkles, UtensilsCrossed,
  HardHat, Factory, ShoppingBag, ClipboardList, Monitor, Heart,
  Package, Scissors, Wrench, Paintbrush, ChevronRight,
} from "lucide-react"
import { alternatesFor } from "@/lib/seo"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: "Browse Job Categories — Jobs24India",
    description: "Find jobs by category in India. Browse delivery, driver, sales, security, cook, construction, factory, retail, IT and more.",
    alternates: alternatesFor(locale, "/categories"),
  }
}

const CATEGORIES = [
  { key: "delivery",     label: "Delivery",           Icon: Truck,           vacancies: "23,00,000+", color: "bg-amber-50 text-amber-600 border-amber-100",   desc: "Delivery boys, courier executives, last-mile delivery" },
  { key: "driver",       label: "Driver",             Icon: Car,             vacancies: "3,30,000+",  color: "bg-sky-50 text-sky-600 border-sky-100",          desc: "Cab drivers, truck drivers, company drivers, auto drivers" },
  { key: "sales",        label: "Sales & Marketing",  Icon: TrendingUp,      vacancies: "5,00,000+",  color: "bg-green-50 text-green-600 border-green-100",    desc: "Sales executives, field sales, telecallers, promoters" },
  { key: "security",     label: "Security Guard",     Icon: Shield,          vacancies: "70,000+",    color: "bg-red-50 text-red-600 border-red-100",          desc: "Security guards, bouncers, watchmen, CCTV operators" },
  { key: "housekeeping", label: "Housekeeping",       Icon: Sparkles,        vacancies: "1,50,000+",  color: "bg-purple-50 text-purple-600 border-purple-100", desc: "Housekeeping staff, cleaners, sweepers, facility workers" },
  { key: "cook",         label: "Cook / Chef",        Icon: UtensilsCrossed, vacancies: "80,000+",    color: "bg-yellow-50 text-yellow-600 border-yellow-100", desc: "Cooks, chefs, kitchen helpers, food production workers" },
  { key: "construction", label: "Construction",       Icon: HardHat,         vacancies: "1,00,000+",  color: "bg-orange-50 text-orange-600 border-orange-100", desc: "Construction workers, masons, painters, plumbers, electricians" },
  { key: "factory",      label: "Factory / Production",Icon: Factory,        vacancies: "70,000+",    color: "bg-slate-50 text-slate-600 border-slate-100",    desc: "Factory workers, machine operators, assembly line workers" },
  { key: "retail",       label: "Retail / Store",     Icon: ShoppingBag,     vacancies: "2,00,000+",  color: "bg-pink-50 text-pink-600 border-pink-100",       desc: "Cashiers, store helpers, retail sales associates" },
  { key: "fieldWork",    label: "Field Work",         Icon: ClipboardList,   vacancies: "1,20,000+",  color: "bg-teal-50 text-teal-600 border-teal-100",       desc: "Field executives, survey workers, data collection agents" },
  { key: "it",           label: "IT / Computer",      Icon: Monitor,         vacancies: "10,000+",    color: "bg-indigo-50 text-indigo-600 border-indigo-100", desc: "Computer operators, data entry, BPO, tech support" },
  { key: "healthcare",   label: "Healthcare",         Icon: Heart,           vacancies: "20,000+",    color: "bg-rose-50 text-rose-600 border-rose-100",       desc: "Nurses, ward boys, medical helpers, pharmacy assistants" },
  { key: "warehouse",    label: "Warehouse",          Icon: Package,         vacancies: "45,000+",    color: "bg-cyan-50 text-cyan-600 border-cyan-100",       desc: "Warehouse workers, pickers, packers, inventory staff" },
  { key: "beauty",       label: "Beauty & Salon",     Icon: Scissors,        vacancies: "15,000+",    color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100", desc: "Hair stylists, beauticians, spa attendants, makeup artists" },
  { key: "technician",   label: "Technician",         Icon: Wrench,          vacancies: "30,000+",    color: "bg-lime-50 text-lime-700 border-lime-100",       desc: "AC technicians, mobile repair, appliance repair, plumbers" },
  { key: "painter",      label: "Painter",            Icon: Paintbrush,      vacancies: "25,000+",    color: "bg-violet-50 text-violet-600 border-violet-100", desc: "House painters, industrial painters, waterproofing workers" },
]

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a3461] mb-3">Browse Jobs by Category</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Explore thousands of frontline job opportunities across India, organised by role type.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CATEGORIES.map(({ key, label, Icon, vacancies, color, desc }) => (
            <Link
              key={key}
              href={`/jobs?category=${key}`}
              className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-[#1a3461]/20 transition-all flex flex-col gap-3"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${color} shrink-0`}>
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold text-[#1a3461] text-sm leading-snug">{label}</h2>
                  <ChevronRight size={15} className="text-gray-300 group-hover:text-[#1a3461] shrink-0 transition-colors mt-0.5" />
                </div>
                <p className="text-xs text-green-600 font-semibold mt-0.5">{vacancies} vacancies</p>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* SEO text */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#1a3461] mb-4">Find Jobs Across India</h2>
          <div className="text-sm text-gray-500 leading-relaxed space-y-3">
            <p>
              Jobs24India is India's leading platform for frontline employment. Whether you're
              looking for a <Link href="/jobs?category=delivery" className="text-blue-700 hover:underline">delivery job</Link>,{" "}
              <Link href="/jobs?category=driver" className="text-blue-700 hover:underline">driving job</Link>,{" "}
              <Link href="/jobs?category=security" className="text-blue-700 hover:underline">security guard job</Link>, or{" "}
              <Link href="/jobs?category=cook" className="text-blue-700 hover:underline">cook job</Link>,{" "}
              we have thousands of verified listings across 200+ cities.
            </p>
            <p>
              All jobs are posted directly by employers — no middlemen, no placement fees. Apply with just your
              mobile number and get a call from HR directly.
            </p>
            <p>
              Popular cities: Delhi NCR · Mumbai · Bangalore · Hyderabad · Chennai · Pune · Kolkata · Ahmedabad · Surat · Jaipur
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
