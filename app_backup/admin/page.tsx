"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createBrowserClient } from "@supabase/ssr"
import { useToast } from "@/hooks/use-toast"
import { LogOut, Moon, GraduationCap, Users, MessageSquare, Building2, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChevronDown } from "lucide-react"

interface Statistics {
  totalFaculties: number
  totalDepartments: number
  totalTeachers: number
  totalReviews: number
  avgRating: number
}

interface Review {
  id: string
  teacher_id: string
  reviewer_name: string
  rating: number
  comment: string
  teaching_quality: number
  communication: number
  professional_knowledge: number
  approachability: number
  created_at: string
  is_verified: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [stats, setStats] = useState<Statistics>({
    totalFaculties: 0,
    totalDepartments: 0,
    totalTeachers: 0,
    totalReviews: 0,
    avgRating: 0,
  })
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddFaculty, setShowAddFaculty] = useState(false)
  const [showAddDepartment, setShowAddDepartment] = useState(false)
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [faculties, setFaculties] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null)
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<"faculties" | "departments" | "teachers" | "reviews">("faculties")

  const [facultyForm, setFacultyForm] = useState({
    name_uz: "",
    name_ru: "",
    description: "",
  })

  const [departmentForm, setDepartmentForm] = useState({
    faculty_id: "",
    name_uz: "",
    name_ru: "",
    description: "",
    head_name: "",
  })

  const [teacherForm, setTeacherForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    specialization_uz: "",
    specialization_ru: "",
    experience_years: 0,
    department_id: "",
    photo: null as File | null,
  })

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [facultiesRes, deptRes, teachersRes, reviewsRes] = await Promise.all([
          fetch("/api/faculties"),
          fetch("/api/departments"),
          fetch("/api/teachers"),
          fetch("/api/reviews"),
        ])

        const facultiesData = await facultiesRes.json()
        const departmentsData = await deptRes.json()
        const teachersData = await teachersRes.json()
        const reviewsData = await reviewsRes.json()

        setFaculties(facultiesData)
        setDepartments(departmentsData)
        setTeachers(teachersData)
        setReviews(reviewsData)

        const avgRating =
          reviewsData.length > 0
            ? reviewsData.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsData.length
            : 0

        setStats({
          totalFaculties: facultiesData.length,
          totalDepartments: departmentsData.length,
          totalTeachers: teachersData.length,
          totalReviews: reviewsData.length,
          avgRating: Number.parseFloat(avgRating.toFixed(1)),
        })
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        toast({
          title: "Xato!",
          description: "Ma'lumotlarni yuklashda xato yuz berdi",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingFacultyId
        ? `/api/faculties`
        : `/api/faculties`
      const method = editingFacultyId ? "PUT" : "POST"
      const body = editingFacultyId
        ? { id: editingFacultyId, ...facultyForm }
        : facultyForm

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error(editingFacultyId ? "Failed to update faculty" : "Failed to add faculty")

      toast({
        title: "Muvaffaqiyat!",
        description: editingFacultyId ? "Fakultet yangilandi" : "Fakultet qo'shildi",
      })

      setFacultyForm({ name_uz: "", name_ru: "", description: "" })
      setEditingFacultyId(null)
      setShowAddFaculty(false)
      
      // Refresh data
      const facultiesRes = await fetch("/api/faculties")
      const facultiesData = await facultiesRes.json()
      setFaculties(facultiesData)
      setStats((prev) => ({
        ...prev,
        totalFaculties: facultiesData.length,
      }))
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Xato!",
        description: editingFacultyId ? "Fakultetni yangilashda xato yuz berdi" : "Fakultetni qo'shishda xato yuz berdi",
        variant: "destructive",
      })
    }
  }

  const handleEditFaculty = (faculty: any) => {
    setFacultyForm({
      name_uz: faculty.name_uz || "",
      name_ru: faculty.name_ru || "",
      description: faculty.description || "",
    })
    setEditingFacultyId(faculty.id)
    setShowAddFaculty(true)
  }

  const handleDeleteFaculty = async (facultyId: string) => {
    if (!confirm("Bu fakultetni o'chirishni xohlaysizmi? Barcha kafedralar va o'qituvchilar ham o'chiriladi.")) {
      return
    }

    try {
      const response = await fetch(`/api/faculties?id=${facultyId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete faculty")

      toast({
        title: "Muvaffaqiyat!",
        description: "Fakultet o'chirildi",
      })

      // Refresh data
      const facultiesRes = await fetch("/api/faculties")
      const facultiesData = await facultiesRes.json()
      setFaculties(facultiesData)
      setStats((prev) => ({
        ...prev,
        totalFaculties: facultiesData.length,
      }))
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Xato!",
        description: "Fakultetni o'chirishda xato yuz berdi",
        variant: "destructive",
      })
    }
  }

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!departmentForm.faculty_id) {
      toast({
        title: "Xato!",
        description: "Fakultetni tanlang (majburiy)",
        variant: "destructive",
      })
      return
    }

    try {
      const url = `/api/departments`
      const method = editingDepartmentId ? "PUT" : "POST"
      const body = editingDepartmentId
        ? { id: editingDepartmentId, ...departmentForm }
        : departmentForm

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error(editingDepartmentId ? "Failed to update department" : "Failed to add department")

      toast({
        title: "Muvaffaqiyat!",
        description: editingDepartmentId ? "Kafedra yangilandi" : "Kafedra qo'shildi",
      })

      setDepartmentForm({ faculty_id: "", name_uz: "", name_ru: "", description: "", head_name: "" })
      setEditingDepartmentId(null)
      setShowAddDepartment(false)
      
      // Refresh data
      const deptRes = await fetch("/api/departments")
      const departmentsData = await deptRes.json()
      setDepartments(departmentsData)
      setStats((prev) => ({
        ...prev,
        totalDepartments: departmentsData.length,
      }))
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Xato!",
        description: editingDepartmentId ? "Kafedrani yangilashda xato yuz berdi" : "Kafedrani qo'shishda xato yuz berdi",
        variant: "destructive",
      })
    }
  }

  const handleEditDepartment = (department: any) => {
    setDepartmentForm({
      faculty_id: department.faculty_id || "",
      name_uz: department.name_uz || "",
      name_ru: department.name_ru || "",
      description: department.description || "",
      head_name: department.head_name || "",
    })
    setEditingDepartmentId(department.id)
    setShowAddDepartment(true)
  }

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm("Bu kafedrani o'chirishni xohlaysizmi? Barcha o'qituvchilar ham o'chiriladi.")) {
      return
    }

    try {
      const response = await fetch(`/api/departments?id=${departmentId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete department")

      toast({
        title: "Muvaffaqiyat!",
        description: "Kafedra o'chirildi",
      })

      // Refresh data
      const deptRes = await fetch("/api/departments")
      const departmentsData = await deptRes.json()
      setDepartments(departmentsData)
      setStats((prev) => ({
        ...prev,
        totalDepartments: departmentsData.length,
      }))
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Xato!",
        description: "Kafedrani o'chirishda xato yuz berdi",
        variant: "destructive",
      })
    }
  }

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!teacherForm.department_id || teacherForm.department_id.trim() === "") {
      toast({
        title: "Xato!",
        description: "Kafedrani tanlang (majburiy)",
        variant: "destructive",
      })
      return
    }

    // Validate department_id is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(teacherForm.department_id)) {
      toast({
        title: "Xato!",
        description: "Noto'g'ri kafedra tanlandi. Iltimos, qayta tanlang.",
        variant: "destructive",
      })
      return
    }

    try {
      let photoUrl = ""

      if (teacherForm.photo) {
        const formData = new FormData()
        formData.append("file", teacherForm.photo)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) throw new Error("Failed to upload photo")

        const uploadData = await uploadRes.json()
        photoUrl = uploadData.url
      }

      // Create teacher record
      const teacherData = {
        first_name: teacherForm.first_name,
        last_name: teacherForm.last_name,
        email: teacherForm.email,
        phone: teacherForm.phone,
        specialization_uz: teacherForm.specialization_uz,
        specialization_ru: teacherForm.specialization_ru,
        experience_years: Number.parseInt(String(teacherForm.experience_years)),
        department_id: teacherForm.department_id, // UUID string
        photo_url: photoUrl,
      }

      // Debug: log the data being sent
      console.log("Creating teacher with data:", teacherData)
      console.log("Department ID:", teacherForm.department_id)

      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData),
      })

      if (!response.ok) throw new Error("Failed to add teacher")

      toast({
        title: "Muvaffaqiyat!",
        description: "O'qituvchi qo'shildi",
      })

      setTeacherForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        specialization_uz: "",
        specialization_ru: "",
        experience_years: 0,
        department_id: "",
        photo: null,
      })
      setShowAddTeacher(false)
      
      // Refresh teachers list
      const teachersRes = await fetch("/api/teachers")
      const teachersData = await teachersRes.json()
      setTeachers(teachersData)
      
      // Update stats
      setStats((prev) => ({
        ...prev,
        totalTeachers: teachersData.length,
      }))
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Xato!",
        description: "O'qituvchini qo'shishda xato yuz berdi",
        variant: "destructive",
      })
    }
  }

  const handleUpdateReviewStatus = async (reviewId: string, newStatus: boolean) => {
    try {
      const response = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId, is_verified: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update review status")

      toast({
        title: "Muvaffaqiyat!",
        description: "Sharh statusi yangilandi",
      })

      // Update local state
      setReviews(reviews.map((r) => (r.id === reviewId ? { ...r, is_verified: newStatus } : r)))
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Xato!",
        description: "Statusni yangilashda xato yuz berdi",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Bu sharhni o'chirib tashlamoqchimisiz?")) {
      return
    }

    try {
      const response = await fetch(`/api/reviews?id=${reviewId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete review")

      toast({
        title: "Muvaffaqiyat!",
        description: "Sharh o'chirildi",
      })

      // Update local state
      setReviews(reviews.filter((r) => r.id !== reviewId))
      setStats((prev) => ({ ...prev, totalReviews: prev.totalReviews - 1 }))
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Xato!",
        description: "Sharhni o'chirishda xato yuz berdi",
        variant: "destructive",
      })
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-4">
              <SidebarTrigger />
              <div>
                <h2 className="text-lg font-semibold">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Tizim boshqaruvi</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigatsiya</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("faculties")}
                      isActive={activeSection === "faculties"}
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span>Fakultetlar</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("departments")}
                      isActive={activeSection === "departments"}
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Kafedralar</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("teachers")}
                      isActive={activeSection === "teachers"}
                    >
                      <Users className="h-4 w-4" />
                      <span>O'qituvchilar</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveSection("reviews")}
                      isActive={activeSection === "reviews"}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Sharxlar</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="border-b border-[#14232c] bg-[#0e1a22]">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-slate-200 hover:text-slate-100" />
                <div>
                  <h1 className="text-xl font-semibold text-slate-100">Admin Dashboard</h1>
                  <p className="text-xs text-slate-400">Tizim boshqaruvi</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-transparent bg-[#14232c] text-slate-200 transition hover:bg-[#1b2c37]"
                  aria-label="Tun rejimini yoqish"
                >
                  <Moon className="h-5 w-5" />
                </button>
                <div className="text-right leading-tight">
                  <p className="text-sm font-semibold text-slate-100">admin</p>
                  <p className="text-xs text-slate-400">Superuser</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="h-10 w-10 rounded-lg border border-transparent bg-[#14232c] text-slate-200 hover:bg-[#1b2c37]"
                  aria-label="Chiqish"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {/* Page Title */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold">
                {activeSection === "faculties" && "Fakultetlar"}
                {activeSection === "departments" && "Kafedralar"}
                {activeSection === "teachers" && "O'qituvchilar"}
                {activeSection === "reviews" && "Sharxlar"}
              </h2>
              <p className="text-muted-foreground">Tizimdagi ma'lumotlarni boshqarish</p>
            </div>

            {/* Statistics */}
            {!loading && (
              <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-5">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Fakultetlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalFaculties}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Kafedralar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalDepartments}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">O'qituvchilar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTeachers}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Sharhlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalReviews}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">O'rtacha Reyting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.avgRating}/5</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Faculties Section */}
            {activeSection === "faculties" && (
              <div className="space-y-4">
            {!showAddFaculty ? (
              <Button onClick={() => setShowAddFaculty(true)} size="lg">
                Yangi Fakultet Qo'shish
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{editingFacultyId ? "Fakultetni Tahrirlash" : "Yangi Fakultet Qo'shish"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddFaculty} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fakultet nomi (O'zbek)</label>
                      <Input
                        placeholder="Masalan: Informatika Fakulteti"
                        value={facultyForm.name_uz}
                        onChange={(e) => setFacultyForm({ ...facultyForm, name_uz: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fakultet nomi (Rus)</label>
                      <Input
                        placeholder="Факультет информатики"
                        value={facultyForm.name_ru}
                        onChange={(e) => setFacultyForm({ ...facultyForm, name_ru: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tavsifi</label>
                      <Textarea
                        placeholder="Fakultet haqida ma'lumot"
                        value={facultyForm.description}
                        onChange={(e) => setFacultyForm({ ...facultyForm, description: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit">{editingFacultyId ? "Yangilash" : "Qo'shish"}</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddFaculty(false)
                          setEditingFacultyId(null)
                          setFacultyForm({ name_uz: "", name_ru: "", description: "" })
                        }}
                      >
                        Bekor qilish
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

                {/* Faculties List */}
                <div className="grid gap-4">
                  {faculties.map((faculty) => (
                    <Card key={faculty.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{faculty.name_uz}</CardTitle>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditFaculty(faculty)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteFaculty(faculty.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">{faculty.name_ru}</p>
                        {faculty.description && <p className="text-sm">{faculty.description}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Departments Section */}
            {activeSection === "departments" && (
              <div className="space-y-4">
                {!showAddDepartment ? (
                  <Button onClick={() => setShowAddDepartment(true)} size="lg">
                    Yangi Kafedra Qo'shish
                  </Button>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>{editingDepartmentId ? "Kafedrani Tahrirlash" : "Yangi Kafedra Qo'shish"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddDepartment} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Fakultet <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={departmentForm.faculty_id}
                            onChange={(e) => setDepartmentForm({ ...departmentForm, faculty_id: e.target.value })}
                            required
                          >
                            <option value="">Fakultet tanlang (majburiy)</option>
                            {faculties.map((faculty) => (
                              <option key={faculty.id} value={faculty.id}>
                                {faculty.name_uz}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Kafedra nomi (O'zbek)</label>
                          <Input
                            placeholder="Masalan: Dasturlash Kafedrasi"
                            value={departmentForm.name_uz}
                            onChange={(e) => setDepartmentForm({ ...departmentForm, name_uz: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Kafedra nomi (Rus)</label>
                          <Input
                            placeholder="Кафедра программирования"
                            value={departmentForm.name_ru}
                            onChange={(e) => setDepartmentForm({ ...departmentForm, name_ru: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Kafedra mudiri</label>
                          <Input
                            placeholder="Masalan: Qo'chqorov Abdulloyev"
                            value={departmentForm.head_name}
                            onChange={(e) => setDepartmentForm({ ...departmentForm, head_name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tavsifi</label>
                          <Textarea
                            placeholder="Kafedra haqida ma'lumot"
                            value={departmentForm.description}
                            onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                          />
                        </div>

                        <div className="flex gap-4">
                          <Button type="submit">{editingDepartmentId ? "Yangilash" : "Qo'shish"}</Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowAddDepartment(false)
                              setEditingDepartmentId(null)
                              setDepartmentForm({ faculty_id: "", name_uz: "", name_ru: "", description: "", head_name: "" })
                            }}
                          >
                            Bekor qilish
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Departments List */}
                {!showAddDepartment && (
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center text-muted-foreground py-8">Yuklanmoqda...</div>
                    ) : departments.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                          <p className="mb-2">Hozircha kafedralar yo'q</p>
                          <p className="text-sm">Yangi kafedra qo'shish uchun yuqoridagi tugmani bosing</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {departments.map((department) => {
                          const faculty = faculties.find((f) => f.id === department.faculty_id)
                          return (
                            <Card key={department.id}>
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg">{department.name_uz}</CardTitle>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditDepartment(department)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteDepartment(department.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <p className="text-sm text-muted-foreground">{department.name_ru}</p>
                                {faculty && (
                                  <p className="text-sm font-medium">
                                    Fakultet: <span className="text-muted-foreground">{faculty.name_uz}</span>
                                  </p>
                                )}
                                {department.head_name && (
                                  <p className="text-sm">
                                    Kafedra mudiri: <span className="text-muted-foreground">{department.head_name}</span>
                                  </p>
                                )}
                                {department.description && <p className="text-sm">{department.description}</p>}
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Teachers Section */}
            {activeSection === "teachers" && (
              <div className="space-y-4">
            {!showAddTeacher ? (
              <Button onClick={() => setShowAddTeacher(true)} size="lg">
                Yangi O'qituvchi Qo'shish
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Yangi O'qituvchi Qo'shish</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddTeacher} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Ismi</label>
                        <Input
                          placeholder="Masalan: Ali"
                          value={teacherForm.first_name}
                          onChange={(e) => setTeacherForm({ ...teacherForm, first_name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Familiyasi</label>
                        <Input
                          placeholder="Masalan: Karimov"
                          value={teacherForm.last_name}
                          onChange={(e) => setTeacherForm({ ...teacherForm, last_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          placeholder="ali@example.com"
                          value={teacherForm.email}
                          onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Telefon</label>
                        <Input
                          placeholder="+998 99 123 45 67"
                          value={teacherForm.phone}
                          onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Ixtisosligi (O'zbek)</label>
                        <Input
                          placeholder="Informatika"
                          value={teacherForm.specialization_uz}
                          onChange={(e) => setTeacherForm({ ...teacherForm, specialization_uz: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Ixtisosligi (Rus)</label>
                        <Input
                          placeholder="Информатика"
                          value={teacherForm.specialization_ru}
                          onChange={(e) => setTeacherForm({ ...teacherForm, specialization_ru: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tajriba yillari</label>
                        <Input
                          type="number"
                          placeholder="5"
                          value={teacherForm.experience_years}
                          onChange={(e) =>
                            setTeacherForm({ ...teacherForm, experience_years: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Kafedra <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={teacherForm.department_id}
                          onChange={(e) => setTeacherForm({ ...teacherForm, department_id: e.target.value })}
                          required
                        >
                          <option value="">Kafedra tanlang (majburiy)</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name_uz}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-muted-foreground">O'qituvchi tanlangan kafedraga qo'shiladi</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rasm</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onChange={(e) => setTeacherForm({ ...teacherForm, photo: e.target.files?.[0] || null })}
                      />
                      {teacherForm.photo && <p className="text-sm text-muted-foreground">{teacherForm.photo.name}</p>}
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit">Qo'shish</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddTeacher(false)}>
                        Bekor qilish
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

                {/* Teachers List by Department */}
                {!showAddTeacher && (
                  <div className="space-y-6 mt-8">
                    <h3 className="text-xl font-semibold">O'qituvchilar ro'yxati (Kafedralar bo'yicha)</h3>
                    {loading ? (
                      <div className="text-center text-muted-foreground">Yuklanmoqda...</div>
                    ) : departments.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                          Kafedralar topilmadi. Avval kafedra qo'shing.
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        {departments.map((dept) => {
                          const deptTeachers = teachers.filter((t) => t.department_id === dept.id)
                          return (
                            <Card key={dept.id}>
                              <CardHeader>
                                <CardTitle className="text-lg">
                                  {dept.name_uz}
                                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    ({deptTeachers.length} o'qituvchi)
                                  </span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {deptTeachers.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">Bu kafedrada hali o'qituvchi yo'q</p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {deptTeachers.map((teacher) => (
                                      <div
                                        key={teacher.id}
                                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                      >
                                        <p className="font-semibold">
                                          {teacher.first_name} {teacher.last_name}
                                        </p>
                                        {teacher.specialization_uz && (
                                          <p className="text-sm text-muted-foreground">{teacher.specialization_uz}</p>
                                        )}
                                        {teacher.email && (
                                          <p className="text-xs text-muted-foreground mt-1">{teacher.email}</p>
                                        )}
                                        {teacher.experience_years && (
                                          <p className="text-xs text-muted-foreground">
                                            Tajriba: {teacher.experience_years} yil
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Section */}
            {activeSection === "reviews" && (
              <div className="space-y-4">
                <Tabs defaultValue="sharhlar" className="w-full">
                  <TabsList>
                    <TabsTrigger value="sharhlar">Sharhlar</TabsTrigger>
                  </TabsList>
                  <TabsContent value="sharhlar" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Barcha Sharhlar ({reviews.length})</h3>
                      <div className="text-sm text-muted-foreground">
                        O'rtacha reyting:{" "}
                        {reviews.length > 0
                          ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
                          : "N/A"}
                        /5
                      </div>
                    </div>

                    <div className="space-y-3">
                      {reviews.length === 0 ? (
                        <Card>
                          <CardContent className="pt-6 text-center text-muted-foreground">
                            Sharhlar topilmadi. Foydalanuvchilar sharh yozishlari uchun kutmoqda...
                          </CardContent>
                        </Card>
                      ) : (
                        reviews.map((review) => (
                          <Card key={review.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                              <div className="space-y-3">
                                {/* Header with name and rating */}
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="font-semibold text-foreground">
                                      {review.reviewer_name || "Nomalum foydalanuvchi"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(review.created_at).toLocaleDateString("uz-UZ", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}{" "}
                                      | {new Date(review.created_at).toLocaleTimeString("uz-UZ")}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full mr-2">
                                      <span className="text-sm">⭐</span>
                                      <span className="font-bold text-yellow-700 text-sm">{review.rating}/5</span>
                                    </div>

                                    <div className="relative">
                                      <select
                                        className={`appearance-none h-8 pl-3 pr-8 rounded-md border text-xs font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 ${
                                          review.is_verified
                                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                        }`}
                                        value={review.is_verified ? "active" : "inactive"}
                                        onChange={(e) => handleUpdateReviewStatus(review.id, e.target.value === "active")}
                                      >
                                        <option value="active">Status: Faol</option>
                                        <option value="inactive">Status: Faol emas</option>
                                      </select>
                                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 opacity-50 pointer-events-none" />
                                    </div>

                                    <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                      <Link href={`/teacher/${review.teacher_id}`} target="_blank">
                                        <Eye className="h-4 w-4" />
                                      </Link>
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => handleDeleteReview(review.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Comment */}
                                {review.comment && (
                                  <div className="bg-muted p-3 rounded-lg">
                                    <p className="text-sm text-foreground italic">"{review.comment}"</p>
                                  </div>
                                )}

                                {/* Detailed ratings */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                  <div className="bg-blue-50 p-2 rounded border-l-2 border-blue-500">
                                    <p className="text-blue-700 font-semibold">O'qitish</p>
                                    <p className="text-blue-600">{review.teaching_quality}/5</p>
                                  </div>
                                  <div className="bg-green-50 p-2 rounded border-l-2 border-green-500">
                                    <p className="text-green-700 font-semibold">Muloqat</p>
                                    <p className="text-green-600">{review.communication}/5</p>
                                  </div>
                                  <div className="bg-purple-50 p-2 rounded border-l-2 border-purple-500">
                                    <p className="text-purple-700 font-semibold">Bilim</p>
                                    <p className="text-purple-600">{review.professional_knowledge}/5</p>
                                  </div>
                                  <div className="bg-orange-50 p-2 rounded border-l-2 border-orange-500">
                                    <p className="text-orange-700 font-semibold">Munosabat</p>
                                    <p className="text-orange-600">{review.approachability}/5</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
