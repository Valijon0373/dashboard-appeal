# UrSPI - O'qituvchilar Rating Tizimi

React + Tailwind CSS bilan yasalgan o'qituvchilar va fakultetlarni baholash tizimi.

## O'rnatish

### 1. Paketlarni o'rnatish

\`\`\`bash
npm install
\`\`\`

### 2. Local serverda ishlatish

\`\`\`bash
npm run dev
\`\`\`

Keyin brauzerda `http://localhost:3000` ga kirish.

### 3. Production uchun build qilish

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Foydalanish

### Admin Panelga Kirish

- **Email**: admin@urspi.uz
- **Parol**: Admin123!

### Admin Panel Imkoniyatlari

1. **Fakultetlar** - Yangi fakultet qo'shish
2. **O'qituvchilar** - O'qituvchi qo'shish va rasm yuklash
3. **Sharhlar** - Barcha sharhlarni ko'rish

### Foydalanuvchi Imkoniyatlari

- Fakultetlarni ko'rish
- O'qituvchilarni qidirish
- O'qituvchi profili va sharhlarini ko'rish
- Yangi sharh qoldirish
- Reyting berish

## Ma'lumot Saqlash

Barcha ma'lumotlar `localStorage` da saqlanadi. Brauzer xotirasini tozalasangiz ma'lumotlar o'chadi.

## Texnologiyalar

- **React** 18.2.0
- **Tailwind CSS** 3.3.6
- **Vite** 5.0.8

## Vercel'da Deploy Qilish

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

Yoki GitHub'ga push qiling va Vercel avtomatik deploy qiladi.

## Netlify'da Deploy Qilish

\`\`\`bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
\`\`\`

## Loyiha Tuzilmasi

\`\`\`
urspi-system/
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Faculties.jsx
│   │   ├── Faculty.jsx
│   │   ├── Teachers.jsx
│   │   ├── Teacher.jsx
│   │   ├── AdminLogin.jsx
│   │   └── AdminDashboard.jsx
│   └── data/
│       └── mockData.js
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
\`\`\`

## Fayllarni Tushunish

- **src/App.jsx** - Asosiy app komponent, routing boshqaruvini amalga oshiradi
- **src/pages/** - Barcha sahifalar
- **src/components/Navbar.jsx** - Navigatsion panel
- **src/data/mockData.js** - Mock ma'lumotlar (localStorage'da saqlansa)
- **src/index.css** - Tailwind CSS va global stillar

## Muammo Hal Qilish

### Rasm ko'rinmayapti?
- File input orqali rasm yuklashda base64 formatida localStorage'ga saqlanadi
- Rasm yuklagandan so'ng sahifa refresh qilinadi

### Ma'lumotlar o'chib ketdi?
- Brauzer xotirasini tozalashda localStorage o'chib ketadi
- `mockData.js`'da default ma'lumotlar mavjud

### LocalStorage to'lib ketdi?
- Katta rasmlar localStorage'ni to'ldirishi mumkin
- Rasmlarni kichikroq qilishni tavsiya qilamin

## Litsenziya

MIT

## Muallif

UrSPI Rating System Team
