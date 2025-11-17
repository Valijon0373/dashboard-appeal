"use client"

import { mockData } from "../data/mockData"
import TeacherProfile from "../components/TeacherProfile"

export default function Teacher({ id, navigate }) {
  const teacher = mockData.teachers.find((item) => Number(item.id) === Number(id))

  if (!teacher) {
    return <div className="text-center text-slate-600">O'qituvchi topilmadi</div>
  }

  return <TeacherProfile teacher={teacher} onBack={() => navigate("teachers")} />
}
