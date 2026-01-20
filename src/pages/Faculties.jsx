import { useState, useEffect, useRef } from "react"
import {
  X,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react"


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

export default function Faculties({ isDarkMode }) {
  const [facultyForm, setFacultyForm] = useState({ name: "", groupId: "" })
  const [showFacultyForm, setShowFacultyForm] = useState(false)
  const [editingFacultyId, setEditingFacultyId] = useState(null)
  const [viewFaculty, setViewFaculty] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [faculties, setFaculties] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [successMessage, setSuccessMessage] = useState("")
  const successTimeoutRef = useRef(null)

  // Prevent body scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen =
      showFacultyForm ||
      viewFaculty ||
      showDeleteConfirm

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [
    showFacultyForm,
    viewFaculty,
    showDeleteConfirm,
  ])

  const fetchData = async () => {
    try {
      setIsLoadingData(true)

      const response = await fetch(`${API_BASE}/api/faculty/all`, {
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
          console.error("Faculty list fetch failed:", response.status, errorText)
        } catch (e) {
          console.error("Faculty list fetch failed with status:", response.status)
        }
        throw new Error("Fakultetlar ro'yxatini olishda xatolik")
      }
      const data = await response.json()
      setFaculties(
        Array.isArray(data)
            ? data.map((faculty) => ({
              ...faculty,
              name: faculty.name || faculty.nameUz || "",
              groupId: faculty.groupId || "",
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

  const handleAddFaculty = async (event) => {
    event.preventDefault()
    if (!facultyForm.name || !facultyForm.groupId) {
      alert("Iltimos, barcha maydonlarni to'ldiring")
      return
    }

    try {
      const payload = {
        name: facultyForm.name.trim(),
        groupId: facultyForm.groupId.trim(),
      }

      const url = editingFacultyId
        ? `${API_BASE}/api/faculty/update/${editingFacultyId}`
        : `${API_BASE}/api/faculty/save`
      const method = editingFacultyId ? "PUT" : "POST"
  
      // Send to backend
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
          console.error("Faculty save failed:", response.status, errorText)
        } catch (e) {
          console.error("Faculty save failed with status:", response.status)
        }
        throw new Error("Fakultetni saqlashda server xatosi yuz berdi")
      }

      // Server javobi: ba'zi hollarda JSON emas, oddiy matn qaytarishi mumkin
      let savedFaculty = null
      try {
        // Avval text sifatida o'qib, keyin JSON parse qilamiz
        const responseText = await response.text()
        if (responseText && responseText.trim()) {
          try {
            const result = JSON.parse(responseText)
            savedFaculty = Array.isArray(result) ? result[0] : result
          } catch (parseError) {
        
            console.warn("Faculty save response is not valid JSON, refetching list instead.")
            console.log(await response.text());

          }
        }
      } catch (readError) {
        console.warn("Could not read response, refetching list instead.")
      }

      if (editingFacultyId) {
        if (savedFaculty && savedFaculty.id) {
          setFaculties((prev) =>
            prev.map((f) => (f.id === editingFacultyId ? { ...f, ...savedFaculty } : f)),
          )
        } else {
          await fetchData()
        }
        showSuccess("Fakultet muvaffaqiyatli yangilandi")
      } else {
        if (savedFaculty && savedFaculty.id) {
          setFaculties((prev) => [...prev, savedFaculty])
        } else {
          await fetchData()
        }
        showSuccess("Fakultet muvaffaqiyatli qo'shildi")
      }

      setFacultyForm({ name: "", groupId: "" })
      setEditingFacultyId(null)
      setShowFacultyForm(false)
    } catch (error) {
      console.error("Error saving faculty:", error)
      alert("Xatolik: " + (error.message || "Noma'lum xatolik"))
    }
  }

  const handleEditFaculty = (faculty) => {
    setFacultyForm({
      name: faculty.name || faculty.nameUz || "",
      groupId: faculty.groupId || "",
    })
    setEditingFacultyId(faculty.id)
    setShowFacultyForm(true)
  }

  const handleDeleteFaculty = (facultyId) => {
    setDeleteConfirmId(facultyId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteFaculty = async () => {
    if (!deleteConfirmId) return

    try {
      const response = await fetch(`${API_BASE}/api/faculty/delete/${deleteConfirmId}`, {
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
          console.error("Faculty delete failed:", response.status, errorText)
        } catch (e) {
          console.error("Faculty delete failed with status:", response.status)
        }
        throw new Error("Fakultetni o'chirishda xatolik")
      }

      setFaculties((prev) => prev.filter((f) => f.id !== deleteConfirmId))

      showSuccess("Fakultet muvaffaqiyatli o'chirildi")
      await fetchData()
      
      if (editingFacultyId === deleteConfirmId) {
        setFacultyForm({ name: "", groupId: "" })
        setEditingFacultyId(null)
        setShowFacultyForm(false)
      }
    } catch (error) {
      console.error("Error deleting faculty:", error)
      alert("Xatolik yuz berdi")
    } finally {
      setShowDeleteConfirm(false)
      setDeleteConfirmId(null)
    }
  }

  const cancelDeleteFaculty = () => {
    setShowDeleteConfirm(false)
    setDeleteConfirmId(null)
  }

  const handleViewFaculty = (faculty) => {
    setViewFaculty(faculty)
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

      {/* View Faculty Modal */}
      {viewFaculty && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-50 flex items-center justify-center p-4"
          onClick={() => setViewFaculty(null)}
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
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Fakultet ma'lumotlari
              </h2>
              <button
                onClick={() => setViewFaculty(null)}
                className={`transition-colors ${isDarkMode ? "text-[#8b9ba8] hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  Fakultet nomi:
                </p>
                <p
                  className={`font-semibold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  {viewFaculty.name || viewFaculty.nameUz}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium mb-1 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}>
                  Telegram guruh ID:
                </p>
                <p
                  className={`font-semibold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  {viewFaculty.groupId || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
            setFacultyForm({ name: "", groupId: "" })
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
                  setFacultyForm({ name: "", groupId: "" })
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
                  Fakultet nomi
                </label>
                <input
                  type="text"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="Fakultet nomi (name)"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  Telegram guruh ID (groupId)
                </label>
                <input
                  type="text"
                  value={facultyForm.groupId}
                  onChange={(e) => setFacultyForm({ ...facultyForm, groupId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#00d4aa] transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#0e1a22] border-[#1a2d3a] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="Masalan: -1001234567890"
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
                  setFacultyForm({ name: "", groupId: "" })
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
                setFacultyForm({ name: "", groupId: "" })
                setShowFacultyForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#00d4aa] text-white rounded-xl font-medium hover:bg-[#00b894] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Qo'shish
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {faculties.map((faculty) => (
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
                    {faculty.name}
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-[#8b9ba8]" : "text-slate-600"}`}
                  >
                    Group ID: {faculty.groupId || "-"}
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
    </div>
  )
}

