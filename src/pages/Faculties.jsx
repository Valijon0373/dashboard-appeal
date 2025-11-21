"use client"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function Faculties({ navigate }) {
  const [faculties, setFaculties] = useState([])
  const [departmentCounts, setDepartmentCounts] = useState({})

  useEffect(() => {
    const loadData = async () => {
      const { data: f } = await supabase.from('faculties').select('*').order('id')
      const { data: d } = await supabase.from('departments').select('facultyId')
      
      if (f) setFaculties(f)
      if (d) {
        const counts = {}
        d.forEach(dept => {
          counts[dept.facultyId] = (counts[dept.facultyId] || 0) + 1
        })
        setDepartmentCounts(counts)
      }
    }
    loadData()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Fakultetlar</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculties.map((faculty) => {
          return (
            <div
              key={faculty.id}
              onClick={() => navigate("faculty", faculty.id)}
              className="card cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold text-blue-600 mb-2">{faculty.nameUz}</h2>
              <p className="text-sm text-slate-500 mb-4">{faculty.nameRu}</p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">{departmentCounts[faculty.id] || 0}</span> ta kafedra
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
