"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Department {
  id: string
  name_uz: string
  name_ru?: string
  head_name?: string
  description?: string
}

interface Faculty {
  id: string
  name_uz: string
  name_ru?: string
}

export default function FacultyPage() {
  const params = useParams()
  const facultyId = params.id as string
  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facultyRes, deptRes] = await Promise.all([
          fetch(`/api/faculties?id=${facultyId}`),
          fetch(`/api/departments?faculty_id=${facultyId}`),
        ])

        const facultyData = await facultyRes.json()
        const departmentsData = await deptRes.json()

        if (Array.isArray(facultyData) && facultyData.length > 0) {
          setFaculty(facultyData[0])
        }
        setDepartments(departmentsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (facultyId) {
      fetchData()
    }
  }, [facultyId])

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link href="/faculties">
            <Button variant="ghost" className="mb-6">
              ← Fakultetlarga
            </Button>
          </Link>

          {faculty && (
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">{faculty.name_uz} / Kafedralar</h1>
              {faculty.name_ru && <p className="text-lg text-muted-foreground">{faculty.name_ru}</p>}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Kafedralar yuklanmoqda...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Kafedra topilmadi</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {departments.map((dept) => (
                <Link key={dept.id} href={`/department/${dept.id}`}>
                  <Card className="cursor-pointer transition-all hover:shadow-lg h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">{dept.name_uz}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dept.name_ru && <CardDescription className="text-sm mb-2">{dept.name_ru}</CardDescription>}
                      {dept.head_name && (
                        <CardDescription className="text-sm">
                          📋 Bosh o'qituvchi: {dept.head_name}
                        </CardDescription>
                      )}
                      {!dept.name_ru && !dept.head_name && (
                        <CardDescription>Ma'lumot kiritilmagan</CardDescription>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
