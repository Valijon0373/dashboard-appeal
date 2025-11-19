"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReviewForm } from "@/components/review-form"

interface Review {
  id: string
  reviewer_name?: string
  rating: number
  comment: string
  teaching_quality: number
  communication: number
  professional_knowledge: number
  approachability: number
  created_at: string
}

interface Teacher {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  specialization_uz?: string
  experience_years?: number
  photo?: string
  reviews?: Review[]
  department_id: string
  department_name_uz?: string
}

export default function TeacherPage() {
  const params = useParams()
  const teacherId = params.id as string
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [qrCode, setQrCode] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchData = async () => {
    try {
      // Fetch teacher
      const teacherResponse = await fetch(`/api/teachers`)
      const teachers = await teacherResponse.json()
      const currentTeacher = teachers.find((t: Teacher) => t.id === teacherId)

      // Agar o'qituvchi topilsa, uning kafedrasini ham olib kelamiz
      if (currentTeacher) {
        try {
          const departmentsResponse = await fetch("/api/departments")
          const departments = await departmentsResponse.json()
          const department = departments.find(
            (d: { id: string }) => String(d.id) === String(currentTeacher.department_id),
          )

          setTeacher({
            ...currentTeacher,
            department_name_uz: department?.name_uz,
          })
        } catch (err) {
          console.error("Error fetching departments for teacher:", err)
          setTeacher(currentTeacher)
        }
      } else {
        setTeacher(null)
      }

      // Fetch reviews
      const reviewsResponse = await fetch(`/api/reviews?teacher_id=${teacherId}&status=active`)
      const reviewsData = await reviewsResponse.json()
      setReviews(reviewsData)

      // Generate QR code
      const qrResponse = await fetch("/api/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/teacher/${teacherId}`,
          size: 250,
        }),
      })
      const qrData = await qrResponse.json()
      setQrCode(qrData.qrCode)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (teacherId) {
      fetchData()
    }
  }, [teacherId])

  if (loading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>
  }

  if (!teacher) {
    return <div className="text-center py-8">O'qituvchi topilmadi</div>
  }

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            ← Orqaga
          </Button>
        </Link>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Teacher Info */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">
                  {teacher.first_name} {teacher.last_name}
                </CardTitle>
                <CardDescription>{teacher.specialization_uz}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
                  <div className="space-y-4">
                    {teacher.department_name_uz && (
                      <p className="text-sm">
                        <span className="font-semibold">Kafedra:</span> {teacher.department_name_uz}
                      </p>
                    )}
                    {teacher.email && (
                      <p className="text-sm">
                        <span className="font-semibold">Email:</span> {teacher.email}
                      </p>
                    )}
                    {teacher.phone && (
                      <p className="text-sm">
                        <span className="font-semibold">Telefon:</span> {teacher.phone}
                      </p>
                    )}
                    {teacher.experience_years && (
                      <p className="text-sm">
                        <span className="font-semibold">Tajriba:</span> {teacher.experience_years} yil
                      </p>
                    )}
                  </div>
                  
                  {/* Teacher Image on Right Side */}
                  <div className="flex flex-col items-center justify-start md:pl-6">
                    <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-border shadow-md">
                      <Image
                        src={teacher.photo || "/placeholder-user.jpg"}
                        alt={`${teacher.first_name} ${teacher.last_name}`}
                        width={192}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <p className="mb-2 text-2xl font-bold text-yellow-500">Reyting: {avgRating}/5</p>
                  <p className="text-sm text-muted-foreground">{reviews.length} sharhga asoslangan</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-lg">QR Kod</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                {qrCode && <Image src={qrCode || "/placeholder.svg"} alt="QR Code" width={200} height={200} />}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Review Form */}
        <div className="mt-12">
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} size="lg">
              Sharh bering
            </Button>
          ) : (
            <ReviewForm
              teacherId={teacherId}
              onReviewSubmitted={() => {
                setShowForm(false)
                fetchData()
              }}
            />
          )}
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Sharhlar ({reviews.length})</h2>

          {reviews.length === 0 ? (
            <p className="text-muted-foreground">Hali sharh yo'q</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{review.reviewer_name || "Anonim"}</CardTitle>
                      <span className="text-lg font-bold text-yellow-500">{"⭐".repeat(review.rating)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">{review.comment}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground">
                      <p>O'qitish sifati: {review.teaching_quality}/5</p>
                      <p>Muloqot: {review.communication}/5</p>
                      <p>Professional bilim: {review.professional_knowledge}/5</p>
                      <p>Yaqinlik: {review.approachability}/5</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
