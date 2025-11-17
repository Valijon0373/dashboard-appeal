import { useMemo, useState, useEffect, useRef } from "react"
import { mockData } from "../data/mockData"
import {
  LayoutDashboard,
  Users,
  FileText,
  Tag,
  Info,
  LogOut,
  Menu,
  Moon,
  Sun,
  Plus,
  X,
  Eye,
  Pencil,
  Trash2,
  Search,
  GraduationCap,
  Landmark,
  CheckCircle2,
} from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const SCORE_FIELDS = [
  { key: "overall", label: "Umumiy" },
  { key: "teaching", label: "O'qitish" },
  { key: "communication", label: "Muloqot" },
  { key: "knowledge", label: "Bilim" },
  { key: "engagement", label: "Yaqinlik" },
]

const createInitialTeacherForm = () => ({
  name: "",
  title: "",
  specialization: "",
  departmentId: "",
  department: "",
  email: "",
  phone: "",
  experience: "",
  bio: "",
  qrData: "",
})

const calculateTeacherMetrics = (teacherId, reviews) => {
  const teacherReviews = reviews.filter((review) => Number(review.teacherId) === Number(teacherId))
  if (!teacherReviews.length) {
    return {
      total: 0,
      overall: 0,
      averages: SCORE_FIELDS.reduce((acc, { key }) => ({ ...acc, [key]: 0 }), {}),
    }
  }

  const totals = SCORE_FIELDS.reduce((acc, { key }) => ({ ...acc, [key]: 0 }), {})
  teacherReviews.forEach((review) => {
    SCORE_FIELDS.forEach(({ key }) => {
      totals[key] += review.scores?.[key] ?? review.rating ?? 0
    })
  })

  const averages = SCORE_FIELDS.reduce((acc, { key }) => {
    acc[key] = Number((totals[key] / teacherReviews.length).toFixed(1))
    return acc
  }, {})

  return {
    total: teacherReviews.length,
    overall: averages.overall ?? 0,
    averages,
  }
}

export default function AdminDashboard({ onLogout, navigate }) {
  const [activeTab, setActiveTab] = useState("faculties")
  const [activeNavItem, setActiveNavItem] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminTheme")
      return saved ? saved === "dark" : true
    }
    return true
  })
  const [facultyForm, setFacultyForm] = useState({ nameUz: "", nameRu: "" })
  const [showFacultyForm, setShowFacultyForm] = useState(false)
  const [editingFacultyId, setEditingFacultyId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [showDeleteTeacherConfirm, setShowDeleteTeacherConfirm] = useState(false)
  const [deleteTeacherId, setDeleteTeacherId] = useState(null)
  const [deleteTeacherName, setDeleteTeacherName] = useState("")
  const [teacherForm, setTeacherForm] = useState(createInitialTeacherForm)
  const [imagePreview, setImagePreview] = useState(null)
  const [editingTeacherId, setEditingTeacherId] = useState(null)
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [teachers, setTeachers] = useState(mockData.teachers)
  const [reviews, setReviews] = useState(mockData.reviews)
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("")
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("")
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState("")
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("")
  const [showDepartmentForm, setShowDepartmentForm] = useState(false)
  const [editingDepartmentId, setEditingDepartmentId] = useState(null)
  const [showDeleteDepartmentConfirm, setShowDeleteDepartmentConfirm] = useState(false)
  const [deleteDepartmentId, setDeleteDepartmentId] = useState(null)
  const [viewDepartment, setViewDepartment] = useState(null)
  const [departmentForm, setDepartmentFormState] = useState({
    nameUz: "",
    nameRu: "",
    facultyId: "",
  })
  const [successMessage, setSuccessMessage] = useState("")
  const successTimeoutRef = useRef(null)

  const showSuccess = (message) => {
    setSuccessMessage(message)
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
    }
    successTimeoutRef.current = setTimeout(() => {
      setSuccessMessage("")
      successTimeoutRef.current = null
    }, 2500)
  }

  const resetTeacherForm = () => {
    setTeacherForm(createInitialTeacherForm())
    setImagePreview(null)
    setEditingTeacherId(null)
    setShowTeacherModal(false)
  }

  const persistData = (updatedTeachers, updatedReviews = reviews) => {
    mockData.teachers = updatedTeachers
    mockData.reviews = updatedReviews
    localStorage.setItem(
      "mockData",
      JSON.stringify({
        ...mockData,
        teachers: updatedTeachers,
        reviews: updatedReviews,
      }),
    )
  }

  const stats = useMemo(
    () => ({
      faculties: mockData.faculties.length,
      departments: mockData.departments.length,
      teachers: teachers.length,
      reviews: reviews.length,
      avgRating:
        reviews.length > 0
          ? (reviews.reduce((sum, review) => sum + (review.scores?.overall ?? review.rating ?? 0), 0) / reviews.length).toFixed(1)
          : "0.0",
    }),
    [teachers.length, reviews],
  )

  // Chart data for Pie Chart - Rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach((review) => {
      const rating = Math.round(review.scores?.overall ?? review.rating ?? 0)
      if (rating >= 1 && rating <= 5) {
        distribution[rating] = (distribution[rating] || 0) + 1
      }
    })
    return [
      { name: "1 yulduz", value: distribution[1], color: "#ef4444" },
      { name: "2 yulduz", value: distribution[2], color: "#f97316" },
      { name: "3 yulduz", value: distribution[3], color: "#eab308" },
      { name: "4 yulduz", value: distribution[4], color: "#22c55e" },
      { name: "5 yulduz", value: distribution[5], color: "#00d4aa" },
    ]
  }, [reviews])

  // Chart data for Bar Chart - Teachers by department
  const teachersByDepartment = useMemo(() => {
    const deptCount = {}
    teachers.forEach((teacher) => {
      const deptName = teacher.department || "Noma'lum"
      deptCount[deptName] = (deptCount[deptName] || 0) + 1
    })
    return Object.entries(deptCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 departments
  }, [teachers])

  // Chart data for Bar Chart - Average ratings by category
  const ratingsByCategory = useMemo(() => {
    if (reviews.length === 0) return []
    const categoryTotals = SCORE_FIELDS.reduce((acc, { key }) => ({ ...acc, [key]: { sum: 0, count: 0 } }), {})
    
    reviews.forEach((review) => {
      SCORE_FIELDS.forEach(({ key }) => {
        const score = review.scores?.[key] ?? (key === "overall" ? review.rating : 0)
        if (score > 0) {
          categoryTotals[key].sum += score
          categoryTotals[key].count += 1
        }
      })
    })

    return SCORE_FIELDS.map(({ key, label }) => ({
      name: label,
      rating: categoryTotals[key].count > 0 
        ? Number((categoryTotals[key].sum / categoryTotals[key].count).toFixed(1))
        : 0,
    }))
  }, [reviews])

  const handleAddFaculty = (event) => {
    event.preventDefault()
    if (!facultyForm.nameUz || !facultyForm.nameRu) {
      alert("Iltimos, barcha maydonlarni to'ldiring")
      return
    }

    if (editingFacultyId) {
      // Update existing faculty
      const facultyIndex = mockData.faculties.findIndex((f) => f.id === editingFacultyId)
      if (facultyIndex !== -1) {
        mockData.faculties[facultyIndex] = {
          ...mockData.faculties[facultyIndex],
          ...facultyForm,
        }
        localStorage.setItem("mockData", JSON.stringify(mockData))
        setFacultyForm({ nameUz: "", nameRu: "" })
        setEditingFacultyId(null)
        setShowFacultyForm(false)
        showSuccess("Fakultet muvaffaqiyatli yangilandi")
        return
      }
    }

    const newFaculty = {
      id: Math.max(...mockData.faculties.map((f) => f.id), 0) + 1,
      ...facultyForm,
    }

    mockData.faculties.push(newFaculty)
    localStorage.setItem("mockData", JSON.stringify(mockData))
    setFacultyForm({ nameUz: "", nameRu: "" })
    setShowFacultyForm(false)
    showSuccess("Fakultet muvaffaqiyatli qo'shildi")
    // State will update automatically, no need to reload
  }

  const handleEditFaculty = (faculty) => {
    setFacultyForm({ nameUz: faculty.nameUz, nameRu: faculty.nameRu })
    setEditingFacultyId(faculty.id)
    setShowFacultyForm(true)
  }

  const handleDeleteFaculty = (facultyId) => {
    setDeleteConfirmId(facultyId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteFaculty = () => {
    if (!deleteConfirmId) return

    mockData.faculties = mockData.faculties.filter((f) => f.id !== deleteConfirmId)
    localStorage.setItem("mockData", JSON.stringify(mockData))
    showSuccess("Fakultet muvaffaqiyatli o'chirildi")
    
    if (editingFacultyId === deleteConfirmId) {
      setFacultyForm({ nameUz: "", nameRu: "" })
      setEditingFacultyId(null)
      setShowFacultyForm(false)
    }

    setShowDeleteConfirm(false)
    setDeleteConfirmId(null)
  }

  const cancelDeleteFaculty = () => {
    setShowDeleteConfirm(false)
    setDeleteConfirmId(null)
  }

  const handleViewFaculty = (faculty) => {
    alert(`Fakultet: ${faculty.nameUz}\n${faculty.nameRu}`)
  }

  const handleAddDepartment = (event) => {
    event.preventDefault()
    if (!departmentForm.nameUz || !departmentForm.nameRu || !departmentForm.facultyId) {
      alert("Iltimos, barcha maydonlarni to'ldiring")
      return
    }

    if (editingDepartmentId) {
      const index = mockData.departments.findIndex((d) => d.id === editingDepartmentId)
      if (index !== -1) {
        mockData.departments[index] = {
          ...mockData.departments[index],
          facultyId: Number.parseInt(departmentForm.facultyId),
          nameUz: departmentForm.nameUz,
          nameRu: departmentForm.nameRu,
        }
        localStorage.setItem("mockData", JSON.stringify(mockData))
        showSuccess("Kafedra muvaffaqiyatli yangilandi")
      }
    } else {
      const newDepartment = {
        id: Math.max(...mockData.departments.map((d) => d.id), 0) + 1,
        facultyId: Number.parseInt(departmentForm.facultyId),
        nameUz: departmentForm.nameUz,
        nameRu: departmentForm.nameRu,
        head: "",
      }

      mockData.departments.push(newDepartment)
      localStorage.setItem("mockData", JSON.stringify(mockData))
      showSuccess("Kafedra muvaffaqiyatli qo'shildi")
    }

    setDepartmentFormState({ nameUz: "", nameRu: "", facultyId: "" })
    setEditingDepartmentId(null)
    setShowDepartmentForm(false)
  }

  const handleViewDepartment = (department, faculty) => {
    setViewDepartment({
      ...department,
      facultyName: faculty ? faculty.nameUz : "",
    })
  }

  const handleEditDepartment = (department) => {
    setDepartmentFormState({
      nameUz: department.nameUz,
      nameRu: department.nameRu,
      facultyId: String(department.facultyId),
    })
    setEditingDepartmentId(department.id)
    setShowDepartmentForm(true)
  }

  const handleDeleteDepartment = (departmentId) => {
    setDeleteDepartmentId(departmentId)
    setShowDeleteDepartmentConfirm(true)
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (readerEvent) => {
        setImagePreview(readerEvent.target?.result ?? null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddOrUpdateTeacher = (event) => {
    event.preventDefault()
    if (!teacherForm.name || !teacherForm.departmentId) {
      alert("Iltimos, o'qituvchi ismi va kafedrasini tanlang")
      return
    }

    if (editingTeacherId) {
      const updatedTeachers = teachers.map((teacher) =>
        Number(teacher.id) === Number(editingTeacherId)
          ? {
              ...teacher,
              name: teacherForm.name,
              title: teacherForm.title || "O'qituvchi",
              specialization: teacherForm.specialization || teacherForm.department,
              departmentId: Number.parseInt(teacherForm.departmentId),
              department: teacherForm.department,
              email: teacherForm.email,
              phone: teacherForm.phone,
              experience: teacherForm.experience,
              bio: teacherForm.bio,
              qrData: teacherForm.qrData || teacherForm.email || teacherForm.name,
              image: imagePreview || "",
            }
          : teacher,
      )

      setTeachers(updatedTeachers)
      persistData(updatedTeachers)
      showSuccess("O'qituvchi ma'lumotlari muvaffaqiyatli yangilandi")
      resetTeacherForm()
      setShowTeacherModal(false)
      return
    }

    const newTeacher = {
      id: Math.max(...teachers.map((t) => t.id), 0) + 1,
      name: teacherForm.name,
      title: teacherForm.title || "O'qituvchi",
      specialization: teacherForm.specialization || teacherForm.department,
      departmentId: Number.parseInt(teacherForm.departmentId),
      department: teacherForm.department,
      email: teacherForm.email,
      phone: teacherForm.phone,
      experience: teacherForm.experience,
      bio: teacherForm.bio,
      qrData: teacherForm.qrData || teacherForm.email || teacherForm.name,
      image: imagePreview || "",
    }

    const updatedTeachers = [...teachers, newTeacher]
    setTeachers(updatedTeachers)
    persistData(updatedTeachers)
    showSuccess("O'qituvchi muvaffaqiyatli qo'shildi")
    resetTeacherForm()
    setShowTeacherModal(false)
  }

  const handleEditTeacher = (teacher) => {
    setActiveTab("teachers")
    setEditingTeacherId(teacher.id)
    setTeacherForm({
      name: teacher.name,
      title: teacher.title,
      specialization: teacher.specialization,
      departmentId: teacher.departmentId ? String(teacher.departmentId) : "",
      department: teacher.department,
      email: teacher.email,
      phone: teacher.phone,
      experience: teacher.experience,
      bio: teacher.bio,
      qrData: teacher.qrData,
    })
    setImagePreview(teacher.image || null)
    setShowTeacherModal(true)
  }

  const handleDeleteTeacher = (teacherId) => {
    const teacher = teachers.find((t) => Number(t.id) === Number(teacherId))
    if (teacher) {
      setDeleteTeacherId(teacherId)
      setDeleteTeacherName(teacher.name)
      setShowDeleteTeacherConfirm(true)
    }
  }

  const confirmDeleteTeacher = () => {
    if (!deleteTeacherId) return

    const updatedTeachers = teachers.filter((teacher) => Number(teacher.id) !== Number(deleteTeacherId))
    const updatedReviews = reviews.filter((review) => Number(review.teacherId) !== Number(deleteTeacherId))

    setTeachers(updatedTeachers)
    setReviews(updatedReviews)
    mockData.reviews = updatedReviews
    persistData(updatedTeachers, updatedReviews)
    showSuccess("O'qituvchi muvaffaqiyatli o'chirildi")

    if (editingTeacherId && Number(editingTeacherId) === Number(deleteTeacherId)) {
      resetTeacherForm()
    }

    setShowDeleteTeacherConfirm(false)
    setDeleteTeacherId(null)
    setDeleteTeacherName("")
  }

  const cancelDeleteTeacher = () => {
    setShowDeleteTeacherConfirm(false)
    setDeleteTeacherId(null)
    setDeleteTeacherName("")
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "categories", label: "Fakultetlar", icon: Landmark },
    { id: "departments", label: "Kafedralar", icon: GraduationCap },
    { id: "doctors", label: "O'qituvchilar", icon: Users },
    { id: "news", label: "Sharhlar", icon: FileText },
    { id: "about", label: "Biz haqimizda", icon: Info },
  ]

  const handleNavClick = (itemId) => {
    setActiveNavItem(itemId)
    if (itemId === "doctors" || itemId === "dashboard" || itemId === "categories") {
      if (itemId === "doctors") {
        setActiveTab("teachers")
      } else {
        setActiveTab("faculties")
      }
    }
  }

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    if (typeof window !== "undefined") {
      localStorage.setItem("adminTheme", newTheme ? "dark" : "light")
      document.documentElement.classList.toggle("dark", newTheme)
    }
  }

  // Apply theme on mount and add modal animations
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", isDarkMode)
      
      // Add modal animations CSS
      const styleId = 'modal-animations'
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = `
          @keyframes fadeIn {
            from {
              opacity: 0;
              background-color: rgba(0, 0, 0, 0);
            }
            to {
              opacity: 1;
              background-color: rgba(0, 0, 0, 0.5);
            }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `
        document.head.appendChild(style)
      }
    }
  }, [isDarkMode])

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? "bg-[#0e1a22]" : "bg-slate-50"}`}
    >
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } ${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border-r transition-all duration-500 flex flex-col fixed h-full z-40`}
      >
        {/* Logo Section */}
        <div
          className={`p-4 border-b transition-colors duration-300 ${isDarkMode ? "border-[#1a2d3a]" : "border-slate-200"}`}
        >
          <div className="flex items-center gap-3">

            {sidebarOpen && (
              <div>
                <h2
                  className={`font-semibold text-sm transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                      UrSPI Admin
                </h2>
                <p
                  className={`text-xs transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}
                >
                  Admin Panel
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeNavItem === item.id
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-[#00d4aa] text-white shadow-lg"
                        : isDarkMode
                          ? "text-[#8b9ba8] hover:bg-[#1a2d3a] hover:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Success toast */}
        {successMessage && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none">
            <div
              className={`mt-6 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border pointer-events-auto ${
                isDarkMode
                  ? "bg-[#14232c] border-[#1a2d3a] text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-sm font-semibold">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Top Navbar */}
        <header
          className={`${isDarkMode ? "bg-[#0e1a22] border-[#14232c]" : "bg-white border-slate-200"} border-b px-6 py-4 transition-colors duration-300`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`transition-colors ${isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1
                  className={`text-xl font-semibold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  Admin Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={toggleTheme}
                className={`transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
                title={isDarkMode ? "Kunduzi rejim" : "Tungi rejim"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  admin
                </p>
                <p
                  className={`text-xs transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}
                >
                  Superuser
                </p>
              </div>
              <button
                onClick={onLogout}
                className={`transition-colors ${isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
                title="Chiqish"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          className={`flex-1 overflow-y-auto p-6 transition-colors duration-300 ${isDarkMode ? "bg-[#0e1a22]" : "bg-slate-50"}`}
        >
          <div className="max-w-7xl mx-auto">

            {activeNavItem !== "categories" &&
              activeNavItem !== "doctors" &&
              activeNavItem !== "news" &&
              activeNavItem !== "departments" && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div
                className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-4 transition-colors duration-300`}
              >
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  Fakultetlar
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                >
                  {stats.faculties}
                </p>
              </div>
              <div
                className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-4 transition-colors duration-300`}
              >
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  Kafedralar
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-green-400" : "text-green-600"}`}
                >
                  {stats.departments}
                </p>
              </div>
              <div
                className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-4 transition-colors duration-300`}
              >
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  O'qituvchilar
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}
                >
                  {stats.teachers}
                </p>
              </div>
              <div
                className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-4 transition-colors duration-300`}
              >
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  Sharhlar
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`}
                >
                  {stats.reviews}
                </p>
              </div>
              <div
                className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-4 transition-colors duration-300`}
              >
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  O'rt. Reyting
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
                >
                  {stats.avgRating}
                </p>
              </div>
            </div>
            )}

            {/* Charts Section */}
            {activeNavItem !== "categories" &&
              activeNavItem !== "doctors" &&
              activeNavItem !== "news" &&
              activeNavItem !== "departments" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pie Chart - Rating Distribution */}
                <div
                  className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-6 transition-colors duration-300`}
                >
                  <h2
                    className={`text-xl font-bold mb-4 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Reytinglar Taqsimoti
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ratingDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ratingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#14232c" : "#fff",
                          border: isDarkMode ? "1px solid #1a2d3a" : "1px solid #e2e8f0",
                          borderRadius: "8px",
                          color: isDarkMode ? "#fff" : "#000",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: isDarkMode ? "#fff" : "#000",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart - Ratings by Category */}
                <div
                  className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-6 transition-colors duration-300`}
                >
                  <h2
                    className={`text-xl font-bold mb-4 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Kategoriyalar Bo'yicha O'rtacha Reytinglar
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ratingsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1a2d3a" : "#e2e8f0"} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: isDarkMode ? "#8b9ba8" : "#64748b", fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        domain={[0, 5]}
                        tick={{ fill: isDarkMode ? "#8b9ba8" : "#64748b", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#14232c" : "#fff",
                          border: isDarkMode ? "1px solid #1a2d3a" : "1px solid #e2e8f0",
                          borderRadius: "8px",
                          color: isDarkMode ? "#fff" : "#000",
                        }}
                      />
                      <Bar dataKey="rating" fill="#00d4aa" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeNavItem === "categories" && (
              <>
                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
                    onClick={cancelDeleteFaculty}
                    style={{
                      animation: 'fadeIn 0.3s ease-in-out forwards'
                    }}
                  >
                    <div
                      className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-xl p-6 w-full max-w-md relative`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        animation: 'slideUp 0.3s ease-out forwards'
                      }}
                    >
                      <div className="mb-6">
                        <h2
                          className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                        >
                          Fakultetni o'chirishni tasdiqlaysizmi?
                        </h2>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={confirmDeleteFaculty}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Ha
                        </button>
                        <button
                          onClick={cancelDeleteFaculty}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Yo'q
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Overlay */}
                {showFacultyForm && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
                    onClick={() => {
                      setShowFacultyForm(false)
                      setFacultyForm({ nameUz: "", nameRu: "" })
                      setEditingFacultyId(null)
                    }}
                    style={{
                      animation: 'fadeIn 0.3s ease-in-out forwards'
                    }}
                  >
                    <div
                      className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-xl p-6 w-full max-w-md relative`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        animation: 'slideUp 0.3s ease-out forwards'
                      }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h2
                          className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                        >
                          {editingFacultyId ? "Fakultetni Tahrirlash" : "Yangi Fakultet Qo'shish"}
                        </h2>
                        <button
                          onClick={() => {
                            setShowFacultyForm(false)
                            setFacultyForm({ nameUz: "", nameRu: "" })
                          }}
                          className={`transition-colors ${isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <form onSubmit={handleAddFaculty} className="space-y-4">
                        <div>
                          <label
                            className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            O'zbek Nomi
                          </label>
                          <input
                            type="text"
                            value={facultyForm.nameUz}
                            onChange={(e) => setFacultyForm({ ...facultyForm, nameUz: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                              isDarkMode
                                ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            }`}
                            placeholder="Fakultet nomi"
                          />
                        </div>
                        <div>
                          <label
                            className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            Rus Nomi
                          </label>
                          <input
                            type="text"
                            value={facultyForm.nameRu}
                            onChange={(e) => setFacultyForm({ ...facultyForm, nameRu: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                              isDarkMode
                                ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            }`}
                            placeholder="Название факультета"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-[#00d4aa] text-white rounded-xl font-medium hover:bg-[#00b894] transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            {editingFacultyId ? "Saqlash" : "Qo'shish"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowFacultyForm(false)
                              setFacultyForm({ nameUz: "", nameRu: "" })
                              setEditingFacultyId(null)
                            }}
                            className={`px-4 py-2 border rounded-xl font-medium transition-all duration-200 ${
                              isDarkMode
                                ? "border-[#1a2d3a] text-white hover:bg-[#1a2d3a]"
                                : "border-slate-300 text-slate-900 hover:bg-slate-100"
                            }`}
                          >
                            Bekor qilish
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Main Content */}
                <div className="w-full">
                  <div
                    className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-6 transition-colors duration-300`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2
                        className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        Mavjud Fakultetlar
                      </h2>
                      <button
                        onClick={() => {
                          setEditingFacultyId(null)
                          setFacultyForm({ nameUz: "", nameRu: "" })
                          setShowFacultyForm(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-white rounded-xl font-medium hover:bg-[#00b894] transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Plus className="w-4 h-4" />
                        Qo'shish
                      </button>
                    </div>
                  <div className="grid grid-cols-1 gap-3">
                    {mockData.faculties.map((faculty) => (
                      <div
                        key={faculty.id}
                        className={`p-4 rounded-lg border transition-colors duration-300 flex items-center justify-between ${
                          isDarkMode ? "bg-[#0e1a22] border-[#1a2d3a]" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex-1">
                          <h3
                            className={`font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                          >
                            {faculty.nameUz}
                          </h3>
                          <p
                            className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}
                          >
                            {faculty.nameRu}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleViewFaculty(faculty)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">Ko'rish</span>
                          </button>
                          <button
                            onClick={() => handleEditFaculty(faculty)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-green-500 border-green-500/30 hover:bg-green-500/10"
                          >
                            <Pencil className="w-4 h-4" />
                            <span className="text-sm">Tahrirlash</span>
                          </button>
                          <button
                            onClick={() => handleDeleteFaculty(faculty.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-red-500 border-red-500/30 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm">O'chirish</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              </>
            )}

            {viewDepartment && (
              <div
                className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
                onClick={() => setViewDepartment(null)}
                style={{
                  animation: "fadeIn 0.3s ease-in-out forwards",
                }}
              >
                <div
                  className={`${
                    isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
                  } border rounded-xl p-6 w-full max-w-md relative`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    animation: "slideUp 0.3s ease-out forwards",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className={`text-xl font-bold transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Kafedra ma'lumotlari
                    </h2>
                    <button
                      onClick={() => setViewDepartment(null)}
                      className={`transition-colors ${
                        isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p
                      className={`font-semibold transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {viewDepartment.nameUz}
                    </p>
                    {viewDepartment.nameRu && (
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                        }`}
                      >
                        {viewDepartment.nameRu}
                      </p>
                    )}
                    {viewDepartment.facultyName && (
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                        }`}
                      >
                        Fakultet: <span className="font-medium">{viewDepartment.facultyName}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {showDepartmentForm && (
              <div
                className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
                onClick={() => {
                  setShowDepartmentForm(false)
                  setDepartmentFormState({ nameUz: "", nameRu: "", facultyId: "" })
                }}
                style={{
                  animation: "fadeIn 0.3s ease-in-out forwards",
                }}
              >
                <div
                  className={`${
                    isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
                  } border rounded-xl p-6 w-full max-w-md relative`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    animation: "slideUp 0.3s ease-out forwards",
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2
                      className={`text-xl font-bold transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {editingDepartmentId ? "Kafedrani Tahrirlash" : "Yangi Kafedra Qo'shish"}
                    </h2>
                    <button
                      onClick={() => {
                        setShowDepartmentForm(false)
                        setEditingDepartmentId(null)
                        setDepartmentFormState({ nameUz: "", nameRu: "", facultyId: "" })
                      }}
                      className={`transition-colors ${
                        isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleAddDepartment} className="space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        Kafedra nomi (O'zbek)
                      </label>
                      <input
                        type="text"
                        value={departmentForm.nameUz}
                        onChange={(e) =>
                          setDepartmentFormState((prev) => ({
                            ...prev,
                            nameUz: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                          isDarkMode
                            ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                        placeholder="Masalan: Dasturlash kafedrasi"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        Kafedra nomi (Rus)
                      </label>
                      <input
                        type="text"
                        value={departmentForm.nameRu}
                        onChange={(e) =>
                          setDepartmentFormState((prev) => ({
                            ...prev,
                            nameRu: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                          isDarkMode
                            ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                        placeholder="Кафедра программирования"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        Fakultetni tanlang
                      </label>
                      <select
                        value={departmentForm.facultyId}
                        onChange={(e) =>
                          setDepartmentFormState((prev) => ({
                            ...prev,
                            facultyId: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                          isDarkMode
                            ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                      >
                        <option value="">Fakultet tanlang</option>
                        {mockData.faculties.map((faculty) => (
                          <option key={faculty.id} value={faculty.id}>
                            {faculty.nameUz}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-[#00d4aa] text-white rounded-xl font-medium hover:bg-[#00b894] transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        {editingDepartmentId ? "Yangilash" : "Saqlash"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDepartmentForm(false)
                          setEditingDepartmentId(null)
                          setDepartmentFormState({ nameUz: "", nameRu: "", facultyId: "" })
                        }}
                        className={`px-4 py-2 border rounded-xl font-medium transition-all duration-200 ${
                          isDarkMode
                            ? "border-[#1a2d3a] text-white hover:bg-[#1a2d3a]"
                            : "border-slate-300 text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        Bekor qilish
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeNavItem === "departments" && (
              <div className="w-full">
                <div
                  className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-6 transition-colors duration-300`}
                >
                  {/* Delete Department Confirmation Modal */}
                  {showDeleteDepartmentConfirm && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
                      onClick={() => {
                        setShowDeleteDepartmentConfirm(false)
                        setDeleteDepartmentId(null)
                      }}
                      style={{
                        animation: "fadeIn 0.3s ease-in-out forwards",
                      }}
                    >
                      <div
                        className={`${
                          isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
                        } border rounded-xl p-6 w-full max-w-md relative`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          animation: "slideUp 0.3s ease-out forwards",
                        }}
                      >
                        <div className="mb-6">
                          <h2
                            className={`text-xl font-bold transition-colors duration-300 ${
                              isDarkMode ? "text-white" : "text-slate-900"
                            }`}
                          >
                            Kafedrani o'chirishni tasdiqlaysizmi?
                          </h2>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              if (!deleteDepartmentId) return
                              mockData.departments = mockData.departments.filter(
                                (d) => d.id !== deleteDepartmentId,
                              )
                              localStorage.setItem("mockData", JSON.stringify(mockData))
                              setShowDeleteDepartmentConfirm(false)
                              setDeleteDepartmentId(null)
                              showSuccess("Kafedra muvaffaqiyatli o'chirildi")
                            }}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            Ha
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteDepartmentConfirm(false)
                              setDeleteDepartmentId(null)
                            }}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            Yo'q
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-6">
                    <h2
                      className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    >
                      Kafedralar Ro'yxati
                    </h2>
                    <button
                      onClick={() => {
                        setDepartmentFormState({ nameUz: "", nameRu: "", facultyId: "" })
                        setShowDepartmentForm(true)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-white rounded-xl font-medium hover:bg-[#00b894] transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Qo'shish
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="mb-6">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Search
                          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                            isDarkMode ? "text-[#8b9ba8]" : "text-slate-400"
                          }`}
                        />
                        <input
                          type="text"
                          value={departmentSearchQuery}
                          onChange={(e) => setDepartmentSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              setDepartmentSearchTerm(departmentSearchQuery)
                            }
                          }}
                          placeholder="Kafedra qidirish..."
                          className={`w-full pl-10 pr-4 py-2.5 border-2 border-blue-500 rounded-full focus:outline-none focus:border-blue-600 transition-colors duration-300 ${
                            isDarkMode
                              ? "bg-[#0e1a22] text-white placeholder:text-[#8b9ba8]"
                              : "bg-white text-slate-900 placeholder:text-slate-400"
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setDepartmentSearchTerm(departmentSearchQuery)}
                        className="px-6 py-2.5 border-2 border-blue-500 text-blue-500 rounded-full font-medium hover:bg-blue-500 hover:text-white transition-all duration-200 whitespace-nowrap"
                      >
                        Qidirish
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {mockData.departments
                      .filter((department) => {
                        if (!departmentSearchTerm.trim()) return true
                        const query = departmentSearchTerm.toLowerCase()
                        const faculty = mockData.faculties.find(
                          (f) => Number(f.id) === Number(department.facultyId),
                        )
                        return (
                          department.nameUz.toLowerCase().includes(query) ||
                          (department.nameRu && department.nameRu.toLowerCase().includes(query)) ||
                          (faculty && faculty.nameUz.toLowerCase().includes(query))
                        )
                      })
                      .map((department) => {
                      const faculty = mockData.faculties.find((f) => Number(f.id) === Number(department.facultyId))
                      return (
                        <div
                          key={department.id}
                          className={`p-4 rounded-lg border transition-colors duration-300 flex items-center justify-between ${
                            isDarkMode ? "bg-[#0e1a22] border-[#1a2d3a]" : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="flex flex-col gap-1 flex-1">
                            <h3
                              className={`font-bold transition-colors duration-300 ${
                                isDarkMode ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {department.nameUz}
                            </h3>
                            {department.nameRu && (
                              <p
                                className={`text-sm transition-colors duration-300 ${
                                  isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                                }`}
                              >
                                {department.nameRu}
                              </p>
                            )}
                            {faculty && (
                              <p
                                className={`text-sm transition-colors duration-300 ${
                                  isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"
                                }`}
                              >
                                Fakultet: <span className="font-medium">{faculty.nameUz}</span>
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleViewDepartment(department, faculty)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">Ko'rish</span>
                            </button>
                            <button
                              onClick={() => handleEditDepartment(department)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-green-500 border-green-500/30 hover:bg-green-500/10"
                            >
                              <Pencil className="w-4 h-4" />
                              <span className="text-sm">Tahrirlash</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(department.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-red-500 border-red-500/30 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-sm">O'chirish</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

          {activeNavItem === "doctors" && (
            <>
              {/* Delete Teacher Confirmation Modal */}
              {showDeleteTeacherConfirm && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
                  onClick={cancelDeleteTeacher}
                  style={{
                    animation: 'fadeIn 0.3s ease-in-out forwards'
                  }}
                >
                  <div
                    className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-xl p-6 w-full max-w-md relative`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      animation: 'slideUp 0.3s ease-out forwards'
                    }}
                  >
                    <div className="mb-6">
                      <h2
                        className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        Siz {deleteTeacherName} o'chirmoqchimisiz?
                      </h2>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={confirmDeleteTeacher}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Ha
                      </button>
                      <button
                        onClick={cancelDeleteTeacher}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Yo'q
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher Modal */}
              {showTeacherModal && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
                  onClick={() => {
                    resetTeacherForm()
                  }}
                  style={{
                    animation: 'fadeIn 0.3s ease-in-out forwards'
                  }}
                >
                  <div
                    className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      animation: 'slideUp 0.3s ease-out forwards'
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2
                        className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        {editingTeacherId ? "O'qituvchini Tahrirlash" : "Yangi O'qituvchi Qo'shish"}
                      </h2>
                      <button
                        onClick={() => {
                          resetTeacherForm()
                        }}
                        className={`transition-colors ${isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <form onSubmit={handleAddOrUpdateTeacher} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>F.I.Sh</label>
                      <input
                        type="text"
                        value={teacherForm.name}
                        onChange={(event) => setTeacherForm({ ...teacherForm, name: event.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                          isDarkMode
                            ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                        placeholder="O'qituvchi ismi"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Lavozim</label>
                      <input
                        type="text"
                        value={teacherForm.title}
                        onChange={(event) => setTeacherForm({ ...teacherForm, title: event.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                          isDarkMode
                            ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                        placeholder="Masalan: Professor"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Mutaxassislik</label>
                      <input
                        type="text"
                        value={teacherForm.specialization}
                        onChange={(event) => setTeacherForm({ ...teacherForm, specialization: event.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                          isDarkMode
                            ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                        placeholder="Masalan: Kompyuter tamoyillari"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Kafedra</label>
                      <select
                        value={teacherForm.departmentId}
                        onChange={(event) => {
                          const dept = mockData.departments.find((d) => d.id === Number.parseInt(event.target.value))
                          setTeacherForm((prev) => ({
                            ...prev,
                            departmentId: event.target.value,
                            department: dept ? dept.nameUz : "",
                          }))
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                          isDarkMode
                            ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                      >
                        <option value="">Kafedra tanlang</option>
                        {mockData.departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.nameUz}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Email</label>
                      <input
                        type="email"
                        value={teacherForm.email}
                        onChange={(event) => setTeacherForm({ ...teacherForm, email: event.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                          isDarkMode
                            ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                        placeholder="name@urspi.uz"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Telefon</label>
                      <input
                        type="tel"
                        value={teacherForm.phone}
                        onChange={(event) => setTeacherForm({ ...teacherForm, phone: event.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                          isDarkMode
                            ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                        placeholder="+99890..."
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Tajriba</label>
                      <input
                        type="text"
                        value={teacherForm.experience}
                        onChange={(event) => setTeacherForm({ ...teacherForm, experience: event.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                          isDarkMode
                            ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                        placeholder="Masalan: 10 yil"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Qisqacha ma'lumot</label>
                      <textarea
                        value={teacherForm.bio}
                        onChange={(event) => setTeacherForm({ ...teacherForm, bio: event.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                          isDarkMode
                            ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                        rows="3"
                        placeholder="Qisqacha ta'rif"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>QR uchun havola</label>
                      <input
                        type="text"
                        value={teacherForm.qrData}
                        onChange={(event) => setTeacherForm({ ...teacherForm, qrData: event.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                          isDarkMode
                            ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Rasm yuklash</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors duration-300 ${
                          isDarkMode
                            ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                      {imagePreview && (
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg mt-2"
                        />
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-[#00d4aa] text-white rounded-xl font-medium hover:bg-[#00b894] transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        {editingTeacherId ? "Saqlash" : "Qo'shish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          resetTeacherForm()
                        }}
                        className={`px-4 py-2 border rounded-xl font-medium transition-all duration-200 ${
                          isDarkMode
                            ? "border-[#1a2d3a] text-white hover:bg-[#1a2d3a]"
                            : "border-slate-300 text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        Bekor qilish
                      </button>
                    </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="w-full">
                <div className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-6 transition-colors duration-300`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>O'qituvchilar Ro'yxati</h2>
                    <button
                      onClick={() => {
                        resetTeacherForm()
                        setShowTeacherModal(true)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-white rounded-xl font-medium hover:bg-[#00b894] transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Qo'shish
                    </button>
                  </div>
                  
                   {/* Search Input */}
                   <div className="mb-6">
                     <div className="flex gap-3">
                       <div className="relative flex-1">
                         <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-400"}`} />
                         <input
                           type="text"
                           value={teacherSearchQuery}
                           onChange={(e) => setTeacherSearchQuery(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               e.preventDefault()
                               setTeacherSearchTerm(teacherSearchQuery)
                             }
                           }}
                           placeholder="O'qituvchi qidirish..."
                           className={`w-full pl-10 pr-4 py-2.5 border-2 border-blue-500 rounded-full focus:outline-none focus:border-blue-600 transition-colors duration-300 ${
                             isDarkMode
                               ? "bg-[#0e1a22] text-white placeholder:text-[#8b9ba8]"
                               : "bg-white text-slate-900 placeholder:text-slate-400"
                           }`}
                         />
                       </div>
                       <button
                         type="button"
                         onClick={() => setTeacherSearchTerm(teacherSearchQuery)}
                         className="px-6 py-2.5 border-2 border-blue-500 text-blue-500 rounded-full font-medium hover:bg-blue-500 hover:text-white transition-all duration-200 whitespace-nowrap"
                       >
                         Qidirish
                       </button>
                     </div>
                   </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teachers
                      .filter((teacher) => {
                        if (!teacherSearchTerm.trim()) return true
                        const query = teacherSearchTerm.toLowerCase()
                        return (
                          teacher.name?.toLowerCase().includes(query) ||
                          teacher.title?.toLowerCase().includes(query) ||
                          teacher.specialization?.toLowerCase().includes(query) ||
                          teacher.department?.toLowerCase().includes(query) ||
                          teacher.email?.toLowerCase().includes(query)
                        )
                      })
                      .map((teacher) => {
                      const metrics = calculateTeacherMetrics(teacher.id, reviews)
                      return (
                        <div
                          key={teacher.id}
                          className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg ${
                            isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"
                          }`}
                        >
                          {/* Gradient Header */}
                          <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                            {/* Profile Picture */}
                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-12">
                              <div className="w-24 h-24 rounded-full border-4 overflow-hidden bg-gray-200"
                                style={{ borderColor: isDarkMode ? "#14232c" : "#fff" }}
                              >
                                {teacher.image ? (
                                  <img
                                    src={teacher.image}
                                    alt={teacher.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-[#1a2d3a]" : "bg-gray-200"}`}>
                                    <Users className={`w-12 h-12 ${isDarkMode ? "text-[#8b9ba8]" : "text-gray-400"}`} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="pt-16 pb-4 px-6">
                            {/* Name and Title */}
                            <div className="text-center mb-4">
                              <h3 className={`text-xl font-bold mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                                {teacher.name}
                              </h3>
                              <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                                {teacher.title || "O'qituvchi"}
                              </p>
                            </div>

                            {/* Experience */}
                            {teacher.experience && (
                              <div className="flex items-center justify-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                                  <span className="font-semibold">{teacher.experience}</span>
                                </p>
                              </div>
                            )}

                            {/* Bio */}
                            {teacher.bio && (
                              <div className="mb-4">
                                <p className={`text-sm leading-relaxed transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                >
                                  {teacher.bio}
                                </p>
                              </div>
                            )}

                            {/* Rating Info */}
                            <div className="mb-4 text-center">
                              <p className="text-sm font-semibold text-yellow-400 mb-1">
                                Reyting: {metrics.overall.toFixed(1)} / 5
                              </p>
                              <p className={`text-xs transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                                {metrics.total} ta sharh
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-6">
                              <button
                                type="button"
                                onClick={() => {
                                  alert(`O'qituvchi: ${teacher.name}\nLavozim: ${teacher.title}\nKafedra: ${teacher.department}\nEmail: ${teacher.email || "N/A"}\nTelefon: ${teacher.phone || "N/A"}\nTajriba: ${teacher.experience || "N/A"}\nReyting: ${metrics.overall.toFixed(1)} / 5\nSharhlar: ${metrics.total} ta`) 
                                }}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-200 text-blue-500 border-blue-500/30 hover:bg-blue-500/10 ${
                                  isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                                }`}
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-sm font-medium">Ko'rish</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditTeacher(teacher)}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-200 text-green-500 border-green-500/30 hover:bg-green-500/10 ${
                                  isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                                }`}
                              >
                                <Pencil className="w-4 h-4" />
                                <span className="text-sm font-medium">Tahrirlash</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTeacher(teacher.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-200 text-red-500 border-red-500/30 hover:bg-red-500/10 ${
                                  isDarkMode ? "bg-[#0e1a22]" : "bg-white"
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm font-medium">O'chirish</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeNavItem === "news" && (
            <div className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-lg p-6 transition-colors duration-300`}>
              <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Barcha Sharhlar</h2>
              <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                {mockData.reviews.length === 0 ? (
                  <p className={`transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>Hali hech qanday sharh yo'q</p>
                ) : (
                  mockData.reviews.map((review, i) => (
                    <div key={i} className={`p-4 rounded-lg border transition-colors duration-300 ${
                      isDarkMode ? "bg-[#0e1a22] border-[#1a2d3a]" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className={`font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>{review.studentName}</p>
                          <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                            {review.teacherName} | {review.date}
                          </p>
                        </div>
                        <span className="text-yellow-400">{"⭐".repeat(review.rating)}</span>
                      </div>
                      <p className={`transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  )
}
