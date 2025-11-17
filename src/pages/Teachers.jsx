"use client"

import { useState } from "react"
import { mockData } from "../data/mockData"

export default function Teachers({ navigate }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = mockData.teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.specialization || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">O'qituvchilar</h1>

      <div className="mb-8">
        <input
          type="text"
          placeholder="O'qituvchi izlash..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((teacher) => {
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
                <h2 className="text-lg font-bold text-slate-900">{teacher.name}</h2>
                <p className="text-sm text-blue-600">{teacher.title}</p>
              </div>
              <p className="text-sm text-slate-600">{teacher.specialization || teacher.department}</p>
              <p className="text-xs text-slate-500">Kafedra: {teacher.department}</p>
              {teacher.experience && <p className="text-xs text-slate-500">Tajriba: {teacher.experience}</p>}
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
    </div>
  )
}
