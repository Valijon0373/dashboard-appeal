"use client"

import { Instagram, Send, Youtube, Facebook } from "lucide-react"

export default function Footer({ isHome }) {
  const isHomePage = isHome

  const footerBg = isHomePage
    ? "bg-white/10 backdrop-blur-md border-t border-white/20 shadow-lg"
    : "bg-white border-t border-slate-200 shadow-sm"

  const iconWrapper =
    "p-3 rounded-full transition-colors " +
    (isHomePage
      ? "border border-white/40 hover:bg-white/15"
      : "border border-slate-200 hover:bg-slate-100")

  const textColor = isHomePage ? "text-white/80" : "text-slate-600"

  return (
    <footer className={`mt-12 ${footerBg}`}>
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-center gap-4">
        <a href="https://t.me/UrDPI_UZ" aria-label="Telegram" className={iconWrapper}>
          <Send className={`h-7 w-7 ${isHomePage ? "text-white" : "text-slate-700"}`} />
        </a>
        <a href="https://www.instagram.com/urspi.uz?igsh=b3Bwc2g0YWoxYnZh" aria-label="Instagram" className={iconWrapper}>
          <Instagram className={`h-7 w-7 ${isHomePage ? "text-white" : "text-slate-700"}`} />
        </a>
        <a href="https://www.youtube.com/@urspiurspi" aria-label="YouTube" className={iconWrapper}>
          <Youtube className={`h-7 w-7 ${isHomePage ? "text-white" : "text-slate-700"}`} />
        </a>
        <a href="https://www.facebook.com/people/Urganch-Davlat-Pedagogika-Instituti/pfbid0bPNZR2Wy86C9X3wdZFFYaGfzuShapjc1h92dUG1r324CAopcCRSZrKzXCq4ZnEkEl/?mibextid=LQQJ4d" aria-label="Facebook" className={iconWrapper}>
          <Facebook className={`h-7 w-7 ${isHomePage ? "text-white" : "text-slate-700"}`} />
        </a>
      </div>
      <a href="https://t.me/Val1jon_0373" className={`text-sm text-center tracking-wide ${textColor}`}>
        UrSPI | RRTM Jamosi | 2025
      </a>
    </div>
    </footer>
  )
}
