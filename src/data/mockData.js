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
  teachers: [
    {
      id: 1,
      name: "Dr. Alisher Nodira",
      title: "Professor, filologiya fanlari doktori",
      specialization: "Rus tili va adabiyoti",
      departmentId: 1,
      department: "Rus Tili va Adabiyoti",
      email: "alisher.nodira@urspi.uz",
      phone: "+998901112233",
      experience: "12 yil",
      bio: "Rus tili va adabiyotini o'qitishda 20 yillik tajribaga ega. Metodik qo'llanmalar muallifi.",
      image: "",
      qrData: "https://urspi.uz/teachers/alisher-nodira",
    },
    {
      id: 2,
      name: "Prof. Dilmurod Mirkarimov",
      title: "Dotsent, filologiya fanlari nomzodi",
      specialization: "O'zbek tili va adabiyoti",
      departmentId: 2,
      department: "O'zbek Tili va Adabiyoti",
      email: "dilmurod.mirkarimov@urspi.uz",
      phone: "+998901234567",
      experience: "15 yil",
      bio: "O'zbek adabiyotining zamonaviy metodikasini ishlab chiqqan.",
      image: "",
      qrData: "https://urspi.uz/teachers/dilmurod-mirkarimov",
    },
    {
      id: 3,
      name: "Dr. Marina Sokolova",
      title: "PhD, chet tillari bo'yicha mutaxassis",
      specialization: "Ingliz tili va lingvistika",
      departmentId: 3,
      department: "Xorij Tillari",
      email: "marina.sokolova@urspi.uz",
      phone: "+998907654321",
      experience: "10 yil",
      bio: "IELTS va CEFR standartlari asosida ingliz tilini o'qitadi.",
      image: "",
      qrData: "https://urspi.uz/teachers/marina-sokolova",
    },
    {
      id: 4,
      name: "Prof. Gulnora Habibullina",
      title: "Professor, psixologiya fanlari doktori",
      specialization: "Pedagogika va psixologiya",
      departmentId: 4,
      department: "Pedagogika va Psixologiya",
      email: "gulnora.habibullina@urspi.uz",
      phone: "+998909876543",
      experience: "18 yil",
      bio: "Ta'lim psixologiyasi bo'yicha xalqaro loyihalar muallifi.",
      image: "",
      qrData: "https://urspi.uz/teachers/gulnora-habibullina",
    },
    {
      id: 5,
      name: "Dr. Svetlana Volkova",
      title: "PhD, maktabgacha ta'lim metodisti",
      specialization: "Maktabgacha ta'lim metodikasi",
      departmentId: 5,
      department: "Maktabgacha Ta'lim",
      email: "svetlana.volkova@urspi.uz",
      phone: "+998933214567",
      experience: "11 yil",
      bio: "Bolalar rivojiga doir interaktiv metodikalarni amaliyotga joriy etgan.",
      image: "",
      qrData: "https://urspi.uz/teachers/svetlana-volkova",
    },
  ],
  reviews: [
    {
      id: 1,
      teacherId: 1,
      teacherName: "Dr. Alisher Nodira",
      studentName: "Firdavs",
      anonymous: false,
      rating: 4.8,
      scores: { overall: 5, teaching: 5, communication: 4, knowledge: 5, engagement: 5 },
      comment: "Juda yaxshi dars beradi, tushunarliroq tushuntiradi.",
      date: "2024-01-15",
    },
    {
      id: 2,
      teacherId: 1,
      teacherName: "Dr. Alisher Nodira",
      studentName: "Oyshahon",
      anonymous: false,
      rating: 4.2,
      scores: { overall: 4, teaching: 4, communication: 4, knowledge: 5, engagement: 4 },
      comment: "Darslar foydali, lekin vaqti ozgina kam.",
      date: "2024-01-16",
    },
    {
      id: 3,
      teacherId: 2,
      teacherName: "Prof. Dilmurod Mirkarimov",
      studentName: "Rustam",
      anonymous: false,
      rating: 4.8,
      scores: { overall: 5, teaching: 5, communication: 4, knowledge: 5, engagement: 5 },
      comment: "Eng yaxshi o'qituvchi!",
      date: "2024-01-17",
    },
    {
      id: 4,
      teacherId: 3,
      teacherName: "Dr. Marina Sokolova",
      studentName: "Alina",
      anonymous: false,
      rating: 4.4,
      scores: { overall: 4, teaching: 4, communication: 5, knowledge: 5, engagement: 4 },
      comment: "Ingliz tilini juda qiziqarli tarzda o'rgatadi.",
      date: "2024-01-18",
    },
    {
      id: 5,
      teacherId: 4,
      teacherName: "Prof. Gulnora Habibullina",
      studentName: "Shamsiddin",
      anonymous: false,
      rating: 4.8,
      scores: { overall: 5, teaching: 5, communication: 5, knowledge: 5, engagement: 4 },
      comment: "Darslar hayotiy misollar bilan boyitilgan.",
      date: "2024-01-19",
    },
  ],
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
