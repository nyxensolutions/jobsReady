"use client"
import { useEffect, useRef, useState } from "react"
import { Bell, BriefcaseIcon, X } from "lucide-react"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  body: string
  isRead: boolean
  data?: { link?: string } | null
  createdAt: string
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/seeker/notifications")
      .then(r => r.ok ? r.json() : [])
      .then(setNotifs)
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const unread = notifs.filter(n => !n.isRead).length

  function openPanel() {
    setOpen(v => !v)
    if (!open && unread > 0) {
      fetch("/api/seeker/notifications", { method: "PATCH" }).catch(() => {})
      setNotifs(n => n.map(x => ({ ...x, isRead: true })))
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={openPanel} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Notifications">
        <Bell size={20} className="text-gray-600" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-800 text-sm">Notifications</span>
            <button onClick={() => setOpen(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                <BriefcaseIcon size={28} className="mx-auto mb-2 opacity-40" />
                No notifications yet
              </div>
            ) : notifs.map(n => (
              <div key={n.id} className={`px-4 py-3 hover:bg-gray-50 ${!n.isRead ? "bg-orange-50/40" : ""}`}>
                {n.data?.link ? (
                  <Link href={n.data.link} onClick={() => setOpen(false)}>
                    <p className="text-sm font-medium text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                  </Link>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                  </>
                )}
                <p className="text-[11px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 px-4 py-2">
            <Link href="/seeker/notifications" onClick={() => setOpen(false)} className="text-xs text-orange-500 font-medium hover:underline">View all</Link>
          </div>
        </div>
      )}
    </div>
  )
}
