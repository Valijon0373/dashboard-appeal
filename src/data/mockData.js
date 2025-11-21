const SCORE_FIELDS = ["overall", "teaching", "communication", "knowledge", "engagement"]

const defaultMockData = {
  faculties: [
    { id: 1, nameUz: "Filologiya Fakulteti", nameRu: "Факультет филологии" },
    { id: 2, nameUz: "Pedagogika Fakulteti", nameRu: "Факультет педагогики" },
    { id: 3, nameUz: "Boshlang'ich Ta'lim Fakulteti", nameRu: "Факультет начального образования" },
    { id: 4, nameUz: "Aniq va Tabiiy Fanlar Fakulteti", nameRu: "Факультет точных и естественных наук" },
    { id: 5, nameUz: "Ijtimoiy va Amaliy Fanlar Fakulteti", nameRu: "Факультет социальных и прикладных наук" },
  ],
  departments: [
    {
      id: 1,
      facultyId: 1,
      nameUz: "Rus Tili va Adabiyoti Kafedrasi",
      nameRu: "Кафедра русского языка и литературы",
      head: "Dr. Alisher Nodira",
    },
    {
      id: 2,
      facultyId: 1,
      nameUz: "O'zbek Tili va Adabiyoti Kafedrasi",
      nameRu: "Кафедра узбекского языка и литературы",
      head: "Prof. Dilmurod Mirkarimov",
    },
    {
      id: 3,
      facultyId: 1,
      nameUz: "Xorij Tillari Kafedrasi",
      nameRu: "Кафедра иностранных языков",
      head: "Dr. Marina Sokolova",
    },
    {
      id: 4,
      facultyId: 2,
      nameUz: "Pedagogika va Psixologiya Kafedrasi",
      nameRu: "Кафедра педагогики и психологии",
      head: "Prof. Gulnora Habibullina",
    },
    {
      id: 5,
      facultyId: 2,
      nameUz: "Maktabgacha Ta'lim Metodikasi Kafedrasi",
      nameRu: "Кафедра методики дошкольного образования",
      head: "Dr. Svetlana Volkova",
    },
    {
      id: 6,
      facultyId: 3,
      nameUz: "Boshlang'ich Ta'lim Metodikasi Kafedrasi",
      nameRu: "Кафедра методики начального образования",
      head: "Prof. Anvar Raxmatullaev",
    },
    { id: 7, facultyId: 3, nameUz: "Matematika Kafedrasi", nameRu: "Кафедра математики", head: "Dr. Elena Solovyeva" },
    {
      id: 8,
      facultyId: 4,
      nameUz: "Matematika va Kompyuter Texnologiyalari Kafedrasi",
      nameRu: "Кафедра математики и компьютерных технологий",
      head: "Prof. Igor Petrov",
    },
    {
      id: 9,
      facultyId: 4,
      nameUz: "Tabiiy Fanlar Kafedrasi",
      nameRu: "Кафедра естественных наук",
      head: "Dr. Anna Volkova",
    },
    {
      id: 10,
      facultyId: 4,
      nameUz: "Fizika va Astronomiya Kafedrasi",
      nameRu: "Кафедра физики и астрономии",
      head: "Prof. Vladimir Sidorov",
    },
    { id: 11, facultyId: 5, nameUz: "Tarix Kafedrasi", nameRu: "Кафедра истории", head: "Dr. Boris Kozlov" },
    {
      id: 12,
      facultyId: 5,
      nameUz: "Milliy G'oya va Falsafa Kafedrasi",
      nameRu: "Кафедра национальной идеи и философии",
      head: "Prof. Karim Usmanov",
    },
    {
      id: 13,
      facultyId: 5,
      nameUz: "San'atshunoslik Kafedrasi",
      nameRu: "Кафедра искусствоведения",
      head: "Dr. Natalia Kozlova",
    },
    {
      id: 14,
      facultyId: 5,
      nameUz: "Jismoniy Tarbiya Kafedrasi",
      nameRu: "Кафедра физической культуры",
      head: "Prof. Dmitry Sergeev",
    },
  ],
  teachers: [],
  reviews: [],
}

const hasBrowserStorage = typeof window !== "undefined" && typeof window.localStorage !== "undefined"

const readStoredData = () => {
  if (!hasBrowserStorage) return null
  try {
    const raw = window.localStorage.getItem("mockData")
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.error("Mock data parse error:", error)
    return null
  }
}

const ensureScoreValue = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const generateId = () => Math.floor(Date.now() + Math.random() * 1_000_000)

const normalizeReview = (review) => {
  const baseScores =
    review && typeof review === "object" && review.scores
      ? review.scores
      : SCORE_FIELDS.reduce((acc, key) => ({ ...acc, [key]: review?.rating ?? 5 }), {})

  const scores = SCORE_FIELDS.reduce(
    (acc, key) => ({ ...acc, [key]: ensureScoreValue(baseScores[key], baseScores.overall ?? 5) }),
    {},
  )

  const average = Number(
    (SCORE_FIELDS.reduce((sum, key) => sum + ensureScoreValue(scores[key], 5), 0) / SCORE_FIELDS.length).toFixed(1),
  )

  return {
    id: review?.id ?? generateId(),
    teacherId: Number(review?.teacherId) || null,
    teacherName: review?.teacherName ?? "",
    studentName: review?.studentName && review.studentName.trim() ? review.studentName : "Anonim talaba",
    anonymous: Boolean(review?.anonymous),
    rating: ensureScoreValue(review?.rating, average),
    scores,
    comment: review?.comment ?? "",
    date: review?.date ?? new Date().toISOString(),
    isActive: review?.isActive ?? true,
  }
}

const normalizeTeacher = (teacher) => ({
  id: Number(teacher?.id) || generateId(),
  name: teacher?.name ?? "O'qituvchi",
  title: teacher?.title ?? "O'qituvchi",
  specialization: teacher?.specialization ?? teacher?.department ?? "",
  departmentId: Number(teacher?.departmentId) || null,
  department: teacher?.department ?? "",
  email: teacher?.email ?? "",
  phone: teacher?.phone ?? "",
  experience: teacher?.experience ?? "",
  bio: teacher?.bio ?? "",
  image: teacher?.image ?? "",
  qrData: teacher?.qrData ?? teacher?.email ?? teacher?.name ?? "",
})

const normalizeMockData = (data) => {
  if (!data) return defaultMockData

  const normalized = {
    faculties: Array.isArray(data.faculties) && data.faculties.length ? data.faculties : defaultMockData.faculties,
    departments: Array.isArray(data.departments) && data.departments.length ? data.departments : defaultMockData.departments,
    teachers: (Array.isArray(data.teachers) && data.teachers.length ? data.teachers : defaultMockData.teachers).map(
      normalizeTeacher,
    ),
    reviews: (Array.isArray(data.reviews) && data.reviews.length ? data.reviews : defaultMockData.reviews)
      .map(normalizeReview)
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
  }

  return normalized
}

const storedData = readStoredData()
export const mockData = normalizeMockData(storedData)

if (hasBrowserStorage) {
  window.localStorage.setItem("mockData", JSON.stringify(mockData))
}
