"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, BriefcaseIcon } from "lucide-react"

interface Notification {
  id: string
  title: string
  body: string
  isRead: boolean
  data?: { link?: string } | null
  createdAt: string
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/seeker/notifications")
      .then(r => r.ok ? r.json() : [])
      .then(data => { setNotifs(data); setLoading(false) })
      .catch(() => setLoading(false))
    // mark all read
    fetch("/api/seeker/notifications", { method: "PATCH" }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Bell size={20} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">Updates on your applications and jobs</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-20">
            <BriefcaseIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-semibold text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">We'll notify you when employers view your application</p>
            <Link href="/jobs" className="mt-6 inline-block bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-orange-600 transition-colors">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map(n => (
              <div key={n.id} className={`bg-white rounded-xl border p-4 ${!n.isRead ? "border-orange-200 bg-orange-50/30" : "border-gray-200"}`}>
                {n.data?.link ? (
                  <Link href={n.data.link}>
                    <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                  </Link>
                ) : (
                  <>
                    <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                  </>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
