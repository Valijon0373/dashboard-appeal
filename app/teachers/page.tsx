"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 
import { MobileNav } from "@/components/mobile-nav"

interface Teacher {
  id: string
  first_name: string
  last_name: string
  specialization_uz?: string
  department_id: string
  department_name_uz?: string
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // O'qituvchilar va kafedralarni olib kelib, front-endda bog'laymiz
        const [teachersRes, departmentsRes] = await Promise.all([
          fetch("/api/teachers"),
          fetch("/api/departments"),
        ])

        const teachersData = await teachersRes.json()
        const departmentsData = await departmentsRes.json()

        const departmentsById: Record<string, { id: string; name_uz?: string }> = {}
        departmentsData.forEach((dep: { id: string; name_uz?: string }) => {
          departmentsById[String(dep.id)] = dep
        })

        const enrichedTeachers: Teacher[] = teachersData.map((t: Teacher) => ({
          ...t,
          department_name_uz: departmentsById[String(t.department_id)]?.name_uz,
        }))

        setTeachers(enrichedTeachers)
        setFilteredTeachers(enrichedTeachers)
      } catch (error) {
        console.error("Error fetching teachers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [])

  useEffect(() => {
    const filtered = teachers.filter(
      (t) =>
        `${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        (t.specialization_uz?.toLowerCase().includes(search.toLowerCase()) ?? false),
    )
    setFilteredTeachers(filtered)
  }, [search, teachers])

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <MobileNav />
          <Link href="/">
            <Button variant="ghost">
              ← Orqaga
            </Button>
          </Link>
        </div>

        <h1 className="mb-8 text-3xl font-bold">Barcha O'qituvchilar</h1>

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="O'qituvchi izlash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-7xl rounded-full border-border bg-background px-6"
          />
          <Button
            variant="outline"
            type="button"
            className="h-12 rounded-full border-primary/50 px-8 font-semibold text-primary hover:bg-primary/5"
          >
            Qidirish
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Yuklanmoqda...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center text-muted-foreground">O'qituvchi topilmadi</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <Link key={teacher.id} href={`/teacher/${teacher.id}`}>
                <Card className="cursor-pointer transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {teacher.first_name} {teacher.last_name}
                    </CardTitle>
                    {teacher.specialization_uz && <CardDescription>{teacher.specialization_uz}</CardDescription>}
                    {teacher.department_name_uz && (
                      <CardDescription className="mt-1">
                        Kafedra: {teacher.department_name_uz}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
