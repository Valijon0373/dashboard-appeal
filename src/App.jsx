"use client"

import { useState, useEffect } from "react"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"

function App() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const adminSession = localStorage.getItem("adminSession")
    const admin = Boolean(adminSession)
    setIsAdmin(admin)

    // Redirect to admin if not on admin path
    if (window.location.pathname !== "/admin" && window.location.pathname !== "/admin/") {
      window.history.pushState(null, "", "/admin")
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("adminSession")
    setIsAdmin(false)
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/admin")
    }
  }

  const navigate = (page) => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/admin")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin ? (
        <AdminLogin navigate={navigate} setIsAdmin={setIsAdmin} />
      ) : (
        <AdminDashboard navigate={navigate} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
