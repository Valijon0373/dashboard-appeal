"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, Search, Plus } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"

interface Faculty {
  id: string
  name_uz: string
  name_ru?: string
  description?: string
}

export default function FacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [filteredFaculties, setFilteredFaculties] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch("/api/faculties")
        const data = await response.json()
        setFaculties(data)
        setFilteredFaculties(data)
      } catch (error) {
        console.error("Error fetching faculties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFaculties()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFaculties(faculties)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = faculties.filter(
        (faculty) =>
          faculty.name_uz.toLowerCase().includes(query) ||
          faculty.name_ru?.toLowerCase().includes(query) ||
          faculty.description?.toLowerCase().includes(query)
      )
      setFilteredFaculties(filtered)
    }
  }, [searchQuery, faculties])

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <MobileNav />
            <Link href="/">
              <Button variant="ghost">
                ← Orqaga
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">Bizning Fakultetlar</h1>
              <p className="text-lg text-muted-foreground">Barcha fakultetlar va kafedralar ro'yxati</p>
            </div>
            
            {/* Search and Add Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Fakultetni Qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Link href="/admin">
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Qo'shish
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
          </div>
        ) : filteredFaculties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? "Qidiruv bo'yicha fakultet topilmadi" : "Fakultet topilmadi"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaculties.map((faculty) => (
              <Link key={faculty.id} href={`/faculty/${faculty.id}`}>
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {faculty.name_uz}
                        </CardTitle>
                        {faculty.name_ru && (
                          <CardDescription className="text-sm mt-1">{faculty.name_ru}</CardDescription>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  {faculty.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{faculty.description}</p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
