import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function Faculty({ id, navigate }) {
  const [faculty, setFaculty] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      setLoading(true)
      
      const { data: facultyData } = await supabase
        .from('faculties')
        .select('*')
        .eq('id', id)
        .single()
        
      const { data: deptData } = await supabase
        .from('departments')
        .select('*')
        .eq('facultyId', id)

      if (facultyData) setFaculty(facultyData)
      if (deptData) setDepartments(deptData)
      
      setLoading(false)
    }
    
    loadData()
  }, [id])

  if (loading) return <div className="text-center text-slate-600">Yuklanmoqda...</div>

  if (!faculty) {
    return <div className="text-center text-slate-600">Fakultet topilmadi</div>
  }

  return (
    <div className="space-y-10">
      <button onClick={() => navigate("faculties")} className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
        ← Orqaga
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {faculty.nameUz} / Kafedralar
        </h1>
        {faculty.nameRu && <p className="text-lg text-slate-600">{faculty.nameRu}</p>}
      </div>

      <div>
        {departments.length === 0 ? (
          <p className="text-center text-slate-600">Bu fakultetga biriktirilgan kafedralar topilmadi</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {departments.map((department) => (
              <div
                key={department.id}
                onClick={() => navigate("department", department.id)}
                className="card cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all transform hover:-translate-y-1"
              >
                <h2 className="text-xl font-bold text-blue-600 mb-2">{department.nameUz}</h2>
                {department.nameRu && <p className="text-sm text-slate-500 mb-2">{department.nameRu}</p>}
                {department.head && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Rahbari:</span> {department.head}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
