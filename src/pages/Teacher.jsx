"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import TeacherProfile from "../components/TeacherProfile"
import LoadingSpinner from "../components/LoadingSpinner"

export default function Teacher({ id, navigate }) {
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const { data: teacherData, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        
        if (teacherData) {
             const { data: dept } = await supabase
                .from('departments')
                .select('nameUz')
                .eq('id', teacherData.departmentId)
                .single()
             
             setTeacher({ ...teacherData, department: dept ? dept.nameUz : "" })
        }
      } catch (error) {
        console.error("Error fetching teacher:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
        fetchTeacher()
    }
  }, [id])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!teacher) {
    return <div className="text-center text-slate-600 mt-12">O'qituvchi topilmadi</div>
  }

  return <TeacherProfile teacher={teacher} onBack={() => navigate("teachers")} />
}
