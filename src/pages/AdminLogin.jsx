"use client"

import { useState } from "react"

export default function AdminLogin({ navigate, setIsAdmin }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })

  const adminEmail = "admin@urspi.uz"
  const adminPassword = "Admin123!"

  const handleSubmit = (e) => {
    e.preventDefault()

    if (credentials.email === adminEmail && credentials.password === adminPassword) {
      localStorage.setItem(
        "adminSession",
        JSON.stringify({
          email: credentials.email,
          loginTime: new Date().toISOString(),
        }),
      )
      setIsAdmin(true)
      navigate("admin")
    } else {
      alert("Email yoki parol noto'g'ri!")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Panelga Kirish</h1>
        <p className="text-slate-600 mb-8">Admin foydalanuvchining hissobini kiriting</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="admin@urspi.uz"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Parol</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Parolni kiriting"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Kirish
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-slate-600">Test hisobini ishlatish:</p>
          <p className="text-sm font-medium text-slate-900">Email: {adminEmail}</p>
          <p className="text-sm font-medium text-slate-900">Parol: {adminPassword}</p>
        </div>
      </div>
    </div>
  )
}
