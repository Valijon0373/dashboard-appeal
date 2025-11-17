"use client"
import { mockData } from "../data/mockData"

export default function Faculties({ navigate }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Fakultetlar</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockData.faculties.map((faculty) => {
          const departments = mockData.departments.filter((d) => d.facultyId === faculty.id)
          return (
            <div
              key={faculty.id}
              onClick={() => navigate("faculty", faculty.id)}
              className="card cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold text-blue-600 mb-2">{faculty.nameUz}</h2>
              <p className="text-sm text-slate-500 mb-4">{faculty.nameRu}</p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">{departments.length}</span> ta kafedra
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
