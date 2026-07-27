import Link from "next/link"
import { PenLine, BookOpen, BookMarked, Award, GraduationCap, ScrollText, ChevronRight } from "lucide-react"

const QUALIFICATIONS = [
  { key: "below10",     label: "Below 10th",   icon: PenLine,       vacancies: "63,00,000+", color: "bg-red-50 text-red-500 border-red-100"      },
  { key: "10th",        label: "10th Pass",    icon: BookOpen,      vacancies: "2,50,000+",  color: "bg-blue-50 text-blue-500 border-blue-100"    },
  { key: "12th",        label: "12th Pass",    icon: BookMarked,    vacancies: "4,00,000+",  color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  { key: "diploma",     label: "Diploma",      icon: Award,         vacancies: "40,000+",    color: "bg-green-50 text-green-600 border-green-100"  },
  { key: "graduate",    label: "Graduate",     icon: GraduationCap, vacancies: "2,50,000+",  color: "bg-indigo-50 text-indigo-500 border-indigo-100"},
  { key: "postgrad",    label: "Post Graduate",icon: ScrollText,    vacancies: "10,000+",    color: "bg-purple-50 text-purple-500 border-purple-100"},
]

export default function QualificationSection() {
  return (
    <section className="py-12 bg-[#f0f4ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1a3461]">What is your Qualification?</h2>
          <p className="text-slate-500 mt-1 text-sm">Find jobs that match your education level</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {QUALIFICATIONS.map(({ key, label, icon: Icon, vacancies, color }) => (
            <Link
              key={key}
              href={`/jobs?qualification=${key}`}
              className="group bg-white rounded-xl border border-gray-100 p-4 sm:p-5 hover:shadow-md hover:border-[#1a3461]/20 transition-all flex flex-col items-start gap-3"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${color}`}>
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-sm leading-snug">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{vacancies} Vacancies</p>
              </div>
              <ChevronRight size={15} className="text-gray-300 group-hover:text-[#1a3461] transition-colors self-end" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
