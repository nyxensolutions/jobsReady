/**
 * Share links as plain anchors — no client JS. WhatsApp comes first because
 * that is how job content actually circulates among our audience.
 */
export default function ShareRow({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, className: "bg-green-600 hover:bg-green-700" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, className: "bg-[#1877F2] hover:bg-[#1568d8]" },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, className: "bg-black hover:bg-gray-800" },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, className: "bg-[#0A66C2] hover:bg-[#095196]" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-gray-200">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-1">Share</span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className={`text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors ${link.className}`}
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}
