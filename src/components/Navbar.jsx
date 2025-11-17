"use client"

export default function Navbar({ currentPage, navigate, isAdmin, onLogout }) {
  const isHomePage = currentPage === "home"
  
  return (
    <nav className={`${isHomePage ? "bg-white/10 backdrop-blur-md" : "bg-white"} shadow-sm border-b ${isHomePage ? "border-white/20" : "border-slate-200"} relative z-20`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className={`text-2xl font-bold cursor-pointer ${isHomePage ? "text-white drop-shadow-lg" : "text-blue-600"}`} onClick={() => navigate("home")}>
            UrSPI
          </h1>
          <div className="flex gap-6">
            <button
              onClick={() => navigate("faculties")}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === "faculties" 
                  ? isHomePage 
                    ? "bg-white/20 text-white" 
                    : "bg-blue-100 text-blue-600"
                  : isHomePage
                    ? "text-white/90 hover:bg-white/10"
                    : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Fakultetlar
            </button>
            <button
              onClick={() => navigate("teachers")}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === "teachers" 
                  ? isHomePage 
                    ? "bg-white/20 text-white" 
                    : "bg-blue-100 text-blue-600"
                  : isHomePage
                    ? "text-white/90 hover:bg-white/10"
                    : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              O'qituvchilar
            </button>
          </div>
        </div>
        <div>

        </div>
      </div>
    </nav>
  )
}
