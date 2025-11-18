"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { mockData } from "../data/mockData"

export default function Department({ id, navigate }) {
  const departmentId = Number(id)
  const [searchTerm, setSearchTerm] = useState("")

  const { department, teachers, departmentHead } = useMemo(() => {
    const dept = mockData.departments.find((d) => Number(d.id) === departmentId)
    const teachersList = mockData.teachers.filter((t) => Number(t.departmentId) === departmentId)
    const head = teachersList.find((t) => t.title === "Kafedra Mudiri")
    return {
      department: dept,
      teachers: teachersList,
      departmentHead: head,
    }
  }, [departmentId])

  if (!department) {
    return (
      <div className="text-center">
        <p className="text-slate-600 mb-4">Kafedra topilmadi</p>
        <button
          onClick={() => navigate("faculties")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Fakultetlarga qaytish
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => navigate("faculties")}
        className="mb-6 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        ← Fakultetlarga qaytish
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{department.nameUz} kafedrasi o‘qituvchilari</h1>
        <p className="text-slate-600">{department.nameRu}</p>
        {departmentHead && (
          <p className="text-sm text-slate-500 mt-2">Rahbar: {departmentHead.name}</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          O'qituvchilar ({teachers.length})
        </h2>
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Kafedra qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-blue-500 rounded-full focus:outline-none focus:border-blue-600"
            />
          </div>
          <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap">
            Qidirish
          </button>
        </div>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600">Bu kafedrada hozircha o'qituvchilar ro'yxati mavjud emas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => {
            const reviews = mockData.reviews.filter((r) => r.teacherId === teacher.id)
            const avgRating =
              reviews.length > 0
                ? (
                    reviews.reduce((sum, r) => sum + (r.scores?.overall ?? r.rating ?? 0), 0) / reviews.length
                  ).toFixed(1)
                : "0.0"

            return (
              <div
                key={teacher.id}
                onClick={() => navigate("teacher", teacher.id)}
                className="card cursor-pointer hover:shadow-lg transition-all space-y-3"
              >
                {teacher.image && (
                  <img
                    src={teacher.image || "/placeholder.svg"}
                    alt={teacher.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{teacher.name}</h3>
                  <p className="text-sm text-blue-600">{teacher.title}</p>
                </div>
                <p className="text-sm text-slate-600">{teacher.specialization || teacher.department}</p>
                {teacher.experience && (
                  <p className="text-xs text-slate-500">Tajriba: {teacher.experience}</p>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-slate-500">{reviews.length} sharh</span>
                  <span className="font-semibold text-yellow-500">{avgRating}/5 ⭐</span>
                </div>
                <button
                  type="button"
                  className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Batafsil va baxolash
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
