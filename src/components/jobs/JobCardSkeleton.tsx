export default function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="flex gap-3">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
        <div className="w-16 h-9 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}
