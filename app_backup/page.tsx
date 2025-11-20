"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"

interface Faculty {
  id: string
  name_uz: string
  description?: string
}

interface Statistics {
  totalFaculties: number
  totalTeachers: number
  totalReviews: number
  avgRating: number
}

export default function HomePage() {
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [stats, setStats] = useState<Statistics>({
    totalFaculties: 0,
    totalTeachers: 0,
    totalReviews: 0,
    avgRating: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facultiesRes, teachersRes, reviewsRes] = await Promise.all([
          fetch("/api/faculties"),
          fetch("/api/teachers"),
          fetch("/api/reviews"),
        ])

        const facultiesData = await facultiesRes.json()
        const teachersData = await teachersRes.json()
        const reviewsData = await reviewsRes.json()

        setFaculties(facultiesData)

        const avgRating =
          reviewsData.length > 0
            ? (reviewsData.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsData.length).toFixed(1)
            : 0

        setStats({
          totalFaculties: facultiesData.length,
          totalTeachers: teachersData.length,
          totalReviews: reviewsData.length,
          avgRating: Number.parseFloat(avgRating),
        })
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-12">
                <div>
                  <h1 className="text-4xl font-bold text-foreground">UrSPI</h1>
                  <p className="mt-2 text-muted-foreground">O'qituvchi va katedra reyting tizimi</p>
                </div>
                <div className="hidden md:flex gap-4">
                  <Link href="/faculties">
                    <Button variant="ghost" className="text-foreground text-base font-medium">Fakultetlar</Button>
                  </Link>
                  <Link href="/teachers">
                    <Button variant="ghost" className="text-foreground text-base font-medium">O'qituvchilar</Button>
                  </Link>
                  <Link href="/setup">
                    <Button variant="ghost" className="text-foreground text-base font-medium">Setup</Button>
                  </Link>
                </div>
              </div>
              <MobileNav />
            </div>
          </div>
        </header>

        {/* Hero Stats */}
        <div className="border-b border-border bg-card/30 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card className="bg-background/50">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold">{stats.totalFaculties}</p>
                  <p className="text-sm text-muted-foreground">Fakultet</p>
                </CardContent>
              </Card>
              <Card className="bg-background/50">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold">{stats.totalTeachers}</p>
                  <p className="text-sm text-muted-foreground">O'qituvchi</p>
                </CardContent>
              </Card>
              <Card className="bg-background/50">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold">{stats.totalReviews}</p>
                  <p className="text-sm text-muted-foreground">Sharh</p>
                </CardContent>
              </Card>
              <Card className="bg-background/50">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold">{stats.avgRating}/5</p>
                  <p className="text-sm text-muted-foreground">O'rtacha reyting</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-foreground">Fakultetlar</h2>

          {loading ? (
            <div className="text-center text-muted-foreground py-8">Yuklanmoqda...</div>
          ) : faculties.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">Fakultet topilmadi</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {faculties.map((faculty) => (
                <Link key={faculty.id} href={`/faculty/${faculty.id}`}>
                  <Card className="cursor-pointer transition-all hover:shadow-lg h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">{faculty.name_uz}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{faculty.description || "Malumot kiritilmagan"}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="border-t border-border bg-card/50 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-bold mb-4">O'qituvchilarga sharh qoldir</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              QR kodni skan qilib, o'qituvchi haqida sharhingizni qoldiring. Sharhlar boshqa talabalar uchun juda
              foydali!
            </p>
            <Link href="/faculties">
              <Button size="lg">Boshlash</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
