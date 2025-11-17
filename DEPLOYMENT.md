# UrSPI - Deployment Guide

## O'zbek Kuni Reyting Tizimi

### Quick Start

Bu loyiha **Vercel yoki Render** da osongina joylanishi mumkin. Quyidagi qadamlarni bajaring:

## 1. Database O'rnatish

### Supabase Integration

1. Vercel projectingizga Supabase integrationni qo'shish:
   - Vercel dashboard'ga kiring
   - "Integrations" bo'limiga o'tish
   - Supabase'ni qidirish va qo'shish
   - Supabase projectini tanlash

2. Environment variables avtomatik o'rnatiladi:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - va boshqalar...

3. SQL scriptlarni run qilish:
   - `scripts/01_create_schema.sql` - Database tuzilmasi
   - `scripts/02_seed_data.sql` - Test ma'lumotlari

### Database Seed

1. Supabase SQL editor'dan SQL scriptlarni run qilish:
   - Supabase dashboard'ga kiring
   - SQL Editor'ni ochish
   - `scripts/01_create_schema.sql` kodni kopya qilish va run qilish
   - `scripts/02_seed_data.sql` kodni kopya qilish va run qilish

## 2. Vercel'da Deploy Qilish

### GitHub Integration

1. Repositoriyni GitHub'ga push qilish:
\`\`\`bash
git add .
git commit -m "Initial commit: UrSPI system"
git push origin main
\`\`\`

2. Vercel'da import qilish:
   - https://vercel.com/new'da new project yaratish
   - GitHub repo'ni tanlash
   - Environment variables qo'shish (Supabase keys)
   - Deploy qilish!

### Environment Variables

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

## 3. Admin Foydalanuvchi Yaratish

1. Supabase Authentication'da user qo'shish:
   - Supabase dashboard > Authentication > Users
   - "Add user" tugmasini bosish
   - Email va parol kiritish

2. Admin role'ini belgilash:
   - SQL query'ni run qilish:
\`\`\`sql
UPDATE users SET role = 'admin' WHERE email = 'admin@urspi.uz';
\`\`\`

## 4. URL's

- **Asosiy sayt**: https://yourapp.vercel.app/
- **Admin Panel**: https://yourapp.vercel.app/admin/
- **Login**: https://yourapp.vercel.app/auth/login

## 5. Features

✅ Fakultetlar va kafedralar ro'yxati
✅ O'qituvchilar profillari
✅ QR kod orqali rezenziya qoldirish
✅ Reyting tizimi
✅ Admin dashboard
✅ Supabase authentication

## 6. Troubleshooting

### "CORS Error" xatosi
- Supabase settings'da RLS policies'ni tekshirish
- NEXT_PUBLIC_SUPABASE_URL to'g'ri ekanligini tekshirish

### "Authentication error"
- Supabase keys to'g'ri ekanligini tekshirish
- Middleware.ts to'g'ri o'rnatilganligini tekshirish

### Database bo'sh
- SQL scripts'ni run qilganligini tekshirish
- Seed data scriptlarini run qilish

## 7. O'zbekcha Tizim Sozlamalari

- Barcha UI o'zbek tilida
- O'zbek lokal settinglari (uz-UZ)
- Reyting: 1-5 stars
- QR kod: Google Charts QR API

## 8. Security

- Row Level Security (RLS) mo'jallangan
- Admin faqat admin bo'lgan users
- Public faqat o'qish huquqi
- Service role key faqat server'da

---

Savollar bo'lsa, admin paneldan yoki `/api/reviews` orqali bog'lanish mumkin!
