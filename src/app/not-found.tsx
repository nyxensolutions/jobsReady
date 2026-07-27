import Link from "next/link"
import { Search, Home, Briefcase } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-[#1a3461]/10 mb-2">404</div>
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Briefcase size={28} className="text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#1a3461] mb-3">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
          The job listing might have expired or been removed by the employer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/jobs"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm"
          >
            <Search size={15} /> Browse Jobs
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 hover:border-[#1a3461] text-[#1a3461] font-semibold rounded-xl transition-colors text-sm"
          >
            <Home size={15} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
