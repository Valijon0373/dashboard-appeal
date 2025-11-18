"use client"

import { useMemo, useState, useEffect } from "react"
import { mockData } from "../data/mockData"
import { CheckCircle, X } from "lucide-react"

const SCORE_FIELDS = [
  { key: "overall", label: "Umumiy" },
  { key: "teaching", label: "O'qitish" },
  { key: "communication", label: "Muloqot" },
  { key: "knowledge", label: "Bilim" },
  { key: "engagement", label: "Yaqinlik" },
]

const createDefaultScores = () =>
  SCORE_FIELDS.reduce((acc, { key }) => {
    acc[key] = 5
    return acc
  }, {})

const computeCategoryAverages = (reviews) => {
  if (!reviews.length) {
    return SCORE_FIELDS.reduce((acc, { key }) => {
      acc[key] = 0
      return acc
    }, {})
  }

  const totals = SCORE_FIELDS.reduce((acc, { key }) => {
    acc[key] = 0
    return acc
  }, {})

  reviews.forEach((review) => {
    SCORE_FIELDS.forEach(({ key }) => {
      const value = review.scores?.[key] ?? review.rating ?? 0
      totals[key] += Number.isFinite(value) ? value : 0
    })
  })

  return SCORE_FIELDS.reduce((acc, { key }) => {
    acc[key] = Number((totals[key] / reviews.length).toFixed(1))
    return acc
  }, {})
}

const formatRating = (value) => Number(value || 0).toFixed(1)

const getQrCodeSrc = (teacher) => {
  if (!teacher?.qrData) return "/placeholder.svg"
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(teacher.qrData)}`
}

export default function TeacherProfile({ teacher, onBack, layout = "default" }) {
  const [reviews, setReviews] = useState(() =>
    mockData.reviews.filter((review) => Number(review.teacherId) === Number(teacher.id)),
  )
  const [formState, setFormState] = useState({
    studentName: "",
    anonymous: false,
    comment: "",
    scores: createDefaultScores(),
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const averages = useMemo(() => computeCategoryAverages(reviews), [reviews])
  const totalReviews = reviews.length
  const overallRating = totalReviews ? formatRating(averages.overall || 0) : "0.0"
  const qrSrc = getQrCodeSrc(teacher)

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessModal])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!formState.comment.trim()) {
      alert("Iltimos, izoh qoldiring.")
      return
    }

    const scores = { ...formState.scores }
    const average =
      SCORE_FIELDS.reduce((sum, { key }) => sum + Number(scores[key] || 0), 0) / SCORE_FIELDS.length || 0

    const newReview = {
      id: mockData.reviews.length + 1,
      teacherId: teacher.id,
      teacherName: teacher.name,
      studentName:
        formState.anonymous || !formState.studentName.trim() ? "Anonim talaba" : formState.studentName.trim(),
      anonymous: formState.anonymous,
      rating: Number(average.toFixed(1)),
      scores,
      comment: formState.comment,
      date: new Date().toLocaleDateString("uz-UZ"),
    }

    mockData.reviews.unshift(newReview)
    localStorage.setItem("mockData", JSON.stringify(mockData))
    setReviews((prev) => [newReview, ...prev])
    setFormState({
      studentName: "",
      anonymous: false,
      comment: "",
      scores: createDefaultScores(),
    })
    setShowSuccessModal(true)
  }

  const handleScoreChange = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      scores: { ...prev.scores, [key]: Number(value) },
    }))
  }

  return (
    <div className="space-y-8">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center shadow-xl relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Muvaffaqiyatli Jo'natildi</h3>
            <p className="text-slate-600">Sharhingiz muvaffaqiyatli yuborildi!</p>
          </div>
        </div>
      )}

      {onBack && (
        <button onClick={onBack} className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
          ← Orqaga
        </button>
      )}

      <div
        className={`grid gap-6 ${layout === "embedded" ? "grid-cols-1 lg:grid-cols-[2fr_1fr]" : "grid-cols-1 lg:grid-cols-[2fr_1fr]"}`}
      >
        <div className="card border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{teacher.name}</h1>
              <p className="text-slate-600 mb-4">{teacher.specialization || teacher.title}</p>

              <div className="space-y-2 text-sm text-slate-600 mb-6">
                {teacher.email && (
                  <p>
                    <span className="font-semibold text-slate-800">Email:</span> {teacher.email}
                  </p>
                )}
                {teacher.phone && (
                  <p>
                    <span className="font-semibold text-slate-800">Telefon:</span> {teacher.phone}
                  </p>
                )}
                {teacher.experience && (
                  <p>
                    <span className="font-semibold text-slate-800">Tajriba:</span> {teacher.experience}
                  </p>
                )}
              </div>

              {teacher.bio && <p className="text-sm text-slate-600 mb-6">{teacher.bio}</p>}
            </div>
            
            {/* Teacher Image on Right Side */}
            <div className="flex flex-col items-center justify-start md:pl-6">
              <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-slate-200 shadow-md">
                <img
                  src={teacher.image || "/placeholder-user.jpg"}
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 mt-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= Math.round(parseFloat(overallRating)) ? "text-yellow-500" : "text-gray-300"} style={{ fontSize: '1.3em' }}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm font-semibold text-yellow-700">{overallRating}/5</span>
            </div>
            <p className="text-xs text-yellow-600 text-center">{totalReviews} ta sharh asosida</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {SCORE_FIELDS.map(({ key, label }) => (
              <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{formatRating(averages[key])} / 5</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card border border-slate-200 flex flex-col items-center justify-center text-center gap-4">
          <h3 className="text-lg font-semibold text-slate-900">QR Kod</h3>
          <img src={qrSrc} alt={`${teacher.name} QR`} className="w-40 h-40 object-contain rounded-lg border" />
          <p className="text-xs text-slate-500 px-4">
            Ushbu kodni skaner qilib, o'qituvchi haqida tezda fikr bildirish yoki ma'lumotlarni yuklab olish mumkin.
          </p>
        </div>
      </div>

      <div className="card border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-2">O'qituvchi haqida sharh bering</h2>
        <p className="text-sm text-slate-600 mb-6">Boshqa o'qituvchilar uchun foydali fikr qoldiring</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Ism (ixtiyoriy)</label>
              <input
                type="text"
                value={formState.studentName}
                onChange={(event) => setFormState((prev) => ({ ...prev, studentName: event.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ismingiz"
              />
            </div>
            <div className="flex items-center gap-2 mt-6 md:mt-8">
              <input
                id={`anonymous-${teacher.id}`}
                type="checkbox"
                checked={formState.anonymous}
                onChange={(event) => setFormState((prev) => ({ ...prev, anonymous: event.target.checked }))}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded"
              />
              <label htmlFor={`anonymous-${teacher.id}`} className="text-sm text-slate-600">
                Anonim qoldirish
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {SCORE_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-900 mb-1">{label}</label>
                <select
                  value={formState.scores[key]}
                  onChange={(event) => handleScoreChange(key, event.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5].map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Izoh</label>
            <textarea
              value={formState.comment}
              onChange={(event) => setFormState((prev) => ({ ...prev, comment: event.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Fikringizni yozing..."
              rows="4"
            />
          </div>

          <button type="submit" className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">
            Sharhni yuborish
          </button>
        </form>
      </div>

      <div className="card border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Sharhlar ({totalReviews})</h2>
        {totalReviews === 0 ? (
          <p className="text-slate-600">Hali hech qanday sharh yo'q</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-slate-200 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{review.studentName}</p>
                    <p className="text-xs text-slate-500">{review.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= review.rating ? "text-yellow-500" : "text-gray-300"} style={{ fontSize: '1.1em' }}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-yellow-500 font-semibold text-sm">{formatRating(review.rating)}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">{review.comment}</p>
                <div className="flex flex-wrap gap-2">
                  {SCORE_FIELDS.map(({ key, label }) => (
                    <span
                      key={key}
                      className="text-xs px-2 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-600"
                    >
                      {label}: {review.scores?.[key] ?? review.rating}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

