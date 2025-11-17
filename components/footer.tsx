import Link from "next/link"
import { Instagram, Send, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white shadow-sm border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-semibold">UrSPI</h3>
            <p className="text-xs text-muted-foreground">O'qituvchi va katedra reyting tizimi</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Sahifalar</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>
                <Link href="/faculties">Fakultetlar</Link>
              </li>
              <li>
                <Link href="/teachers">O'qituvchilar</Link>
              </li>
              <li>
                <Link href="/admin">Admin</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Ma'lumot</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>
                <Link href="/setup">Setup Guide</Link>
              </li>
              <li>
                <Link href="/DEPLOYMENT.md">Deployment</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Ijtimoiy tarmoqlar</h4>
            <div className="flex items-center gap-3 mt-2 text-muted-foreground">
              <a
                href="#"
                aria-label="Instagram"
                className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Telegram"
                className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>UrSPI RRTM Jamosi 2025</p>
        </div>
      </div>
    </footer>
  )
}
