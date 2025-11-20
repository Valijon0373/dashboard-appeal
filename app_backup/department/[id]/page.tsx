"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Review {
  id: string
  rating: number
}

interface Teacher {
  id: string
  first_name: string
  last_name: string
  specialization_uz?: string
  experience_years?: number
  photo?: string
  photo_url?: string
  reviews?: Review[]
}

export default function DepartmentPage() {
  const params = useParams()
  const departmentId = params.id as string
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [departmentName, setDepartmentName] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, departmentsRes] = await Promise.all([
          fetch(`/api/teachers?department_id=${departmentId}`),
          fetch("/api/departments"),
        ])

        const teachersData = await teachersRes.json()
        setTeachers(teachersData)

        const departmentsData = await departmentsRes.json()
        const currentDepartment = departmentsData.find(
          (d: { id: string }) => String(d.id) === String(departmentId),
        )
        if (currentDepartment?.name_uz) {
          setDepartmentName(currentDepartment.name_uz)
        }
      } catch (error) {
        console.error("Error fetching teachers:", error)
      } finally {
        setLoading(false)
      }
    }

    if (departmentId) {
      fetchData()
    }
  }, [departmentId])

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            ← Orqaga
          </Button>
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-foreground">
          {departmentName ? departmentName : "Kafedra"} o&apos;qituvchilari
        </h1>
        {departmentName && (
          <p className="mb-8 text-sm text-muted-foreground">
            Tanlangan kafedra: <span className="font-semibold">{departmentName}</span>
          </p>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground">Yuklanmoqda...</div>
        ) : teachers.length === 0 ? (
          <div className="text-center text-muted-foreground">O'qituvchi topilmadi</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => {
              const reviewCount = teacher.reviews?.length ?? 0
              const avgRating =
                reviewCount > 0
                  ? (
                      teacher.reviews!.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
                    ).toFixed(1)
                  : null

              const photoSrc = teacher.photo_url || teacher.photo || "/placeholder-user.jpg"

              return (
                <Link key={teacher.id} href={`/teacher/${teacher.id}`}>
                  <Card className="flex h-full flex-col overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-lg">
                    <div className="relative h-52 w-full">
                      <Image
                        src={photoSrc}
                        alt={`${teacher.first_name} ${teacher.last_name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-semibold">
                        {teacher.first_name} {teacher.last_name}
                      </CardTitle>
                      {teacher.specialization_uz && (
                        <CardDescription className="mt-1">{teacher.specialization_uz}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-between gap-3 pb-4">
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {teacher.experience_years !== undefined && teacher.experience_years !== null && (
                          <p>Tajriba: {teacher.experience_years} yil</p>
                        )}
                        <p>
                          {reviewCount} sharh{reviewCount === 1 ? "" : ""}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-base font-semibold text-yellow-500">
                          {avgRating ? `${avgRating}/5` : "0.0/5"} <span>⭐</span>
                        </div>
                        <span className="text-xs font-medium text-blue-600">Batafsil va baxolash</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
