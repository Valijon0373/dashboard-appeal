import type React from "react"
import type { Metadata } from "next"
import { Josefin_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Footer } from "@/components/footer"

const josefinSans = Josefin_Sans({ 
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-josefin-sans"
})

export const metadata: Metadata = {
  title: "UrSPI - O'qituvchi Reyting Tizimi",
  description: "O'qituvchi va katedra reyting tizimi. QR kodlar orqali sharh bering.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz">
      <body className={`${josefinSans.variable} font-sans antialiased`}>
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
