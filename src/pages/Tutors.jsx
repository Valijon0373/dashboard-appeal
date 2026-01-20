import { useState, useEffect, useRef } from "react"
import {
  X,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Search,
  Download,
  Users,
  CheckCircle2,
} from "lucide-react"
import * as XLSX from "xlsx"

// Use same base URL as login (AdminLogin.jsx) by default
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://teacher.urspi.uz"

// Helper: unauthorized bo'lsa admin login sahifasiga qaytarish
const handleUnauthorized = () => {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem("adminSession")
  } catch (e) {
    console.error("Error clearing adminSession:", e)
  }
  alert("Sessiya tugadi. Iltimos, qayta tizimga kiring.")
  window.location.reload()
}

// Helper: get auth headers from adminSession (set in AdminLogin)
const getAuthHeaders = () => {
  if (typeof window === "undefined") return {}
  try {
    const sessionRaw = localStorage.getItem("adminSession")
    if (!sessionRaw) return {}
    const session = JSON.parse(sessionRaw)
    if (!session?.accessToken) return {}
    return {
      Authorization: `Bearer ${session.accessToken}`,
    }
  } catch (error) {
    console.error("Error reading adminSession from localStorage:", error)
    return {}
  }
}

const createInitialTeacherForm = () => ({
  name: "",
  phone: "",
  faculty: "",
})

const calculateTeacherMetrics = (teacherId, reviews) => {
  const teacherReviews = reviews.filter((review) => Number(review.teacherId) === Number(teacherId))
  if (!teacherReviews.length) {
    return {
      total: 0,
      overall: 0,
    }
  }

  const totalRating = teacherReviews.reduce((sum, review) => {
    return sum + (review.rating || review.scores?.overall || 0)
  }, 0)

  const overall = Number((totalRating / teacherReviews.length).toFixed(1))

  return {
    total: teacherReviews.length,
    overall: overall,
  }
}

export default function Tutors({ isDarkMode }) {
  const [showDeleteTeacherConfirm, setShowDeleteTeacherConfirm] = useState(false)
  const [deleteTeacherId, setDeleteTeacherId] = useState(null)
  const [deleteTeacherName, setDeleteTeacherName] = useState("")
  const [teacherForm, setTeacherForm] = useState(createInitialTeacherForm)
  const [imagePreview, setImagePreview] = useState(null)
  const [editingTeacherId, setEditingTeacherId] = useState(null)
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [viewTeacher, setViewTeacher] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [reviews, setReviews] = useState([])
  const [faculties, setFaculties] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("")
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const successTimeoutRef = useRef(null)

  // Prevent body scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen =
      showDeleteTeacherConfirm ||
      showTeacherModal ||
      viewTeacher

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [
    showDeleteTeacherConfirm,
    showTeacherModal,
    viewTeacher,
  ])

  const fetchData = async () => {
    try {
      setIsLoadingData(true)

      // Reviews hozircha localStorage dan olinadi
      const reviewsData = (() => {
        if (typeof window === "undefined") return []
        try {
          const raw = localStorage.getItem("admin_reviews")
          const parsed = raw ? JSON.parse(raw) : []
          return Array.isArray(parsed) ? parsed : []
        } catch (error) {
          console.error("Error reading admin_reviews from localStorage:", error)
          return []
        }
      })()

      const sortedReviews = [...reviewsData].sort((a, b) => {
        const dateA = new Date(a.date || 0)
        const dateB = new Date(b.date || 0)
        return dateB - dateA
      })

      setReviews(sortedReviews)

      // Backenddan fakultetlar va tyutorlarni olib kelamiz
      const [facultiesResponse, tutorsResponse] = await Promise.all([
        fetch(`${API_BASE}/api/faculty/all`, {
          headers: {
            ...getAuthHeaders(),
          },
        }),
        fetch(`${API_BASE}/api/tutor/all`, {
          headers: {
            ...getAuthHeaders(),
          },
        }),
      ])

      if (!facultiesResponse.ok) {
        if (facultiesResponse.status === 401 || facultiesResponse.status === 403) {
          handleUnauthorized()
          return
        }
        try {
          const errorText = await facultiesResponse.text()
          console.error("Faculty list fetch failed:", facultiesResponse.status, errorText)
        } catch (e) {
          console.error("Faculty list fetch failed with status:", facultiesResponse.status)
        }
        throw new Error("Fakultetlar ro'yxatini olishda xatolik")
      }

      if (!tutorsResponse.ok) {
        if (tutorsResponse.status === 401 || tutorsResponse.status === 403) {
          handleUnauthorized()
          return
        }
        try {
          const errorText = await tutorsResponse.text()
          console.error("Tutor list fetch failed:", tutorsResponse.status, errorText)
        } catch (e) {
          console.error("Tutor list fetch failed with status:", tutorsResponse.status)
        }
        throw new Error("Tyutorlar ro'yxatini olishda xatolik")
      }

      const facultiesData = await facultiesResponse.json()
      const tutorsData = await tutorsResponse.json()

      setFaculties(
        Array.isArray(facultiesData)
          ? facultiesData.map((faculty) => ({
              ...faculty,
              nameUz: faculty.nameUz || faculty.name || "",
            }))
          : [],
      )

      setTeachers(
        Array.isArray(tutorsData)
          ? tutorsData.map((teacher) => ({
              ...teacher,
              name: teacher.fullName || teacher.fullname || teacher.name || "",
              phone: teacher.phone || "",
              faculty: teacher.facultyId || teacher.faculty?.id || "",
            }))
          : [],
      )
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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

  const handleDownloadStatistics = () => {
    const data = teachers.map((teacher) => {
      const metrics = calculateTeacherMetrics(teacher.id, reviews)
      
      return {
        "F.I.O":  teacher.fullName || "",
        "Tel_raqam": teacher.phone || "",
        "Rayting": metrics.overall,
        "Murojaatlar soni": metrics.total
      }
    })

    // Ma'lumotlarni saralash: F.I.O
    data.sort((a, b) => {
      return a["F.I.O"].localeCompare(b["F.I.O"])
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    
    // Ustunlar kengligini sozlash
    const wscols = [
      { wch: 30 }, // F.I.O
      { wch: 20 }, // Tel_raqam
      { wch: 15 }  // Murojaatlar soni
    ]
    worksheet['!cols'] = wscols

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statistika")
    XLSX.writeFile(workbook, "Statistika.xlsx")
  }

  const handleViewTeacher = (teacher) => {
    setViewTeacher(teacher)
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

  const handleAddOrUpdateTeacher = async (event) => {
    event.preventDefault()
    
    const isEditing = Boolean(editingTeacherId)
    const nameTrimmed = teacherForm.name?.trim() || ""
    const phoneTrimmed = teacherForm.phone?.trim() || ""
    const facultyValue = teacherForm.faculty?.trim() || ""

    // When adding, all fields are mandatory. When editing, only validate the fields the user actually changed.
    if (!isEditing) {
      if (!nameTrimmed || !phoneTrimmed || !facultyValue) {
        alert("Iltimos, barcha majburiy maydonlarni to'ldiring: F.I.O, Telefon va Fakultet")
        return
      }
    } else {
      const hasAnyChange = Boolean(nameTrimmed || phoneTrimmed || facultyValue)
      if (!hasAnyChange) {
        alert("Hech bo'lmaganda bitta maydonni o'zgartiring")
        return
      }
    }
    
    // Telefon raqamini tekshirish (kamida 12 ta raqam bo'lishi kerak: +998 XX XXX XX XX).
    // Tahrirlashda faqat telefon kiritilgan bo'lsa tekshiramiz.
    const phoneDigits = phoneTrimmed.replace(/\D/g, '')
    if (!isEditing || phoneTrimmed) {
      if (phoneDigits.length < 12) {
        alert("Iltimos, to'liq telefon raqamini kiriting (masalan: +998 90 123 45 67)")
        return
      }
    }

    const existingTeacher = isEditing
      ? teachers.find((t) => Number(t.id) === Number(editingTeacherId))
      : null

    try {
      // If editing, fill empty fields with the old data so that user can change only one field.
      const payload = {
        fullName: isEditing
          ? (nameTrimmed ||
              existingTeacher?.fullName ||
              existingTeacher?.fullname ||
              existingTeacher?.name ||
              "")
          : nameTrimmed,
        phone: isEditing
          ? (phoneTrimmed || existingTeacher?.phone || "")
          : phoneTrimmed,
        facultyId: isEditing
          ? (facultyValue ||
              existingTeacher?.facultyId ||
              existingTeacher?.faculty?.id ||
              existingTeacher?.faculty ||
              "")
          : facultyValue,
      }

      // Safeguard: ensure payload is still complete
      if (!payload.fullName || !payload.phone || !payload.facultyId) {
        alert("Iltimos, F.I.O, Telefon va Fakultet ma'lumotlari to'liq bo'lishini ta'minlang")
        return
      }

      const url = isEditing
        ? `${API_BASE}/api/tutor/update/${editingTeacherId}`
        : `${API_BASE}/api/tutor/save`
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleUnauthorized()
          return
        }
        try {
          const errorText = await response.text()
          console.error("Tutor save failed:", response.status, errorText)
        } catch (e) {
          console.error("Tutor save failed with status:", response.status)
        }
        throw new Error("Tyutorni saqlashda server xatosi yuz berdi")
      }

      // Ba'zi hollarda server JSON emas, matn qaytarishi mumkin
      let savedTeacher = null
      try {
        const result = await response.json()
        savedTeacher = Array.isArray(result) ? result[0] : result
      } catch (parseError) {
        console.warn("Tutor save response is not JSON, refetching list instead.")
      }

      if (isEditing) {
        if (savedTeacher && savedTeacher.id) {
          setTeachers((prev) =>
            prev.map((t) => (t.id === editingTeacherId ? { ...t, ...savedTeacher } : t)),
          )
        } else {
          await fetchData()
        }
        showSuccess("Tyutor ma'lumotlari muvaffaqiyatli yangilandi")
      } else {
        if (savedTeacher && savedTeacher.id) {
          setTeachers((prev) => [...prev, savedTeacher])
        } else {
          await fetchData()
        }
        showSuccess("Tyutor muvaffaqiyatli qo'shildi")
      }

      resetTeacherForm()
      setShowTeacherModal(false)
    } catch (error) {
      console.error("Error saving teacher:", error)
      alert("Xatolik: " + (error.message || "Noma'lum xatolik"))
    }
  }

  const handleEditTeacher = (teacher) => {
    setEditingTeacherId(teacher.id)
    setTeacherForm({
      name: teacher.name || teacher.fullName || teacher.fullname || "",
      phone: teacher.phone || "",
      faculty: String(teacher.facultyId || teacher.faculty?.id || teacher.faculty || ""),
    })
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

  const confirmDeleteTeacher = async () => {
    if (!deleteTeacherId) return

    try {
      const response = await fetch(`${API_BASE}/api/tutor/delete/${deleteTeacherId}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleUnauthorized()
          return
        }
        try {
          const errorText = await response.text()
          console.error("Tutor delete failed:", response.status, errorText)
        } catch (e) {
          console.error("Tutor delete failed with status:", response.status)
        }
        throw new Error("Tyutorni o'chirishda xatolik")
      }

      setTeachers((prev) => prev.filter((t) => t.id !== deleteTeacherId))

      showSuccess("Tyutor muvaffaqiyatli o'chirildi")
      await fetchData()

      if (editingTeacherId && Number(editingTeacherId) === Number(deleteTeacherId)) {
        resetTeacherForm()
      }
    } catch (error) {
      console.error("Error deleting teacher:", error)
      alert("Xatolik yuz berdi")
    } finally {
      setShowDeleteTeacherConfirm(false)
      setDeleteTeacherId(null)
      setDeleteTeacherName("")
    }
  }

  const cancelDeleteTeacher = () => {
    setShowDeleteTeacherConfirm(false)
    setDeleteTeacherId(null)
    setDeleteTeacherName("")
  }

  // Apply modal animations CSS
  useEffect(() => {
    if (typeof window !== "undefined") {
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
  }, [])

  return (
    <div className="w-full">
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
                {editingTeacherId ? "Tyutorni Tahrirlash" : "Yangi Tyutor Qo'shish"}
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
              <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                F.I.O <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={teacherForm.name}
                onChange={(event) => setTeacherForm({ ...teacherForm, name: event.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                    : "bg-white border-slate-300 text-slate-900"
                }`}
                placeholder="F.I.O"
                required={!editingTeacherId}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={teacherForm.phone}
                onChange={(event) => {
                  const value = event.target.value
                  // Remove all non-digit characters
                  const digits = value.replace(/\D/g, '')
                  
                  // Format: +998 XX XXX XX XX
                  let formatted = '+998'
                  if (digits.length > 3) {
                    formatted += ' ' + digits.slice(3, 5)
                  }
                  if (digits.length > 5) {
                    formatted += ' ' + digits.slice(5, 8)
                  }
                  if (digits.length > 8) {
                    formatted += ' ' + digits.slice(8, 10)
                  }
                  if (digits.length > 10) {
                    formatted += ' ' + digits.slice(10, 12)
                  }
                  
                  setTeacherForm({ ...teacherForm, phone: formatted })
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                    : "bg-white border-slate-300 text-slate-900"
                }`}
                placeholder="+998 90 123 45 67"
                maxLength="17"
                required={!editingTeacherId}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Fakultet <span className="text-red-500">*</span>
              </label>
              <select
                value={teacherForm.faculty}
                onChange={(event) => setTeacherForm({ ...teacherForm, faculty: event.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                    : "bg-white border-slate-300 text-slate-900"
                }`}
                required={!editingTeacherId}
              >
                <option value="">Fakultetni tanlang</option>
                {faculties.length === 0 ? (
                  <option value="" disabled>
                    {isLoadingData ? "Yuklanmoqda..." : "Fakultetlar topilmadi"}
                  </option>
                ) : (
                  faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.nameUz || faculty.name || `Fakultet #${faculty.id}`}
                    </option>
                  ))
                )}
              </select>
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
            <h2 className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Tyutorlar Ro'yxati</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadStatistics}
                className="flex items-center gap-2 px-4 py-2 border border-[#00d4aa] text-[#00d4aa] rounded-xl font-medium hover:bg-[#00d4aa] hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Statistika
              </button>
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
                   placeholder="Tyutor qidirish..."
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
                        {(teacher.fullName && teacher.fullName.trim()) || (teacher.fullname && teacher.fullname.trim()) || (teacher.name && teacher.name.trim()) || ""}
                      </h3>
                      <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                        {teacher.title || "Tyutor"}
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

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-6">
                      <button
                        type="button"
                        onClick={() => handleViewTeacher(teacher)}
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
      
      {viewTeacher && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={() => setViewTeacher(null)}
          style={{
            animation: 'fadeIn 0.3s ease-in-out forwards'
          }}
        >
          <div
            className={`${isDarkMode ? "bg-[#14232c] border-[#1a2d3a]" : "bg-white border-slate-200"} border rounded-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slideUp 0.3s ease-out forwards'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Tyutor ma'lumotlari
              </h2>
              <button
                onClick={() => setViewTeacher(null)}
                className={`transition-colors ${isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>F.I.O:</p>
                <p className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  {((viewTeacher.fullName && viewTeacher.fullName.trim()) || (viewTeacher.fullname && viewTeacher.fullname.trim()) || (viewTeacher.name && viewTeacher.name.trim())) || "-"}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>Telefon:</p>
                <p className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>{viewTeacher.phone || "-"}</p>
              </div>
              <div>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>Fakultet:</p>
                <p className={`font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  {(() => {
                    const facultyId = viewTeacher.facultyId || viewTeacher.faculty || (viewTeacher.faculty?.id)
                    if (!facultyId) return "-"
                    const faculty = faculties.find((f) => Number(f.id) === Number(facultyId))
                    return faculty ? (faculty.nameUz || faculty.name || "-") : "-"
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

