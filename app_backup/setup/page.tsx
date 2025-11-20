"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

export default function SetupPage() {
  const [sqlExecuted, setSqlExecuted] = useState(false)

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold">UrSPI - Setup Guide</h1>

        <div className="space-y-8">
          {/* Step 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 1: Database Schema</CardTitle>
              <CardDescription>Supabase'da SQL jadvallarini yaratish</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Supabase dashboard'ga kiring va SQL Editor'da quyidagi kodni run qiling:
              </p>
              <Textarea value={`-- Run scripts/01_create_schema.sql`} readOnly className="font-mono text-xs" rows={2} />
              <Button disabled>SQL ni Run Qiling</Button>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 2: Test Data</CardTitle>
              <CardDescription>Sinov ma'lumotlarini qo'shish</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Quyidagi seed data'ni run qiling:</p>
              <Textarea value={`-- Run scripts/02_seed_data.sql`} readOnly className="font-mono text-xs" rows={2} />
              <Button disabled>Seed Data'ni Run Qiling</Button>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 3: Admin Foydalanuvchi</CardTitle>
              <CardDescription>Admin hisob qo'shish</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="admin@urspi.uz" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parol</label>
                <Input type="password" placeholder="Parolni kiriting" />
              </div>
              <Button disabled>Admin Hisob Yaratish</Button>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 4: Deploy</CardTitle>
              <CardDescription>Vercel'da deploy qilish</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                GitHub'ga push qiling va Vercel integration orqali deploy qiling.
              </p>
              <Button disabled>Deployment Guide'ni Ko'rish</Button>
            </CardContent>
          </Card>
        </div>

        {/* Links */}
        <div className="mt-12 space-y-4">
          <h2 className="text-xl font-bold">Foydalı Havolalar</h2>
          <ul className="space-y-2">
            <li>
              <a href="https://supabase.com" target="_blank" className="text-blue-500 hover:underline" rel="noreferrer">
                Supabase Documentation
              </a>
            </li>
            <li>
              <a href="https://vercel.com" target="_blank" className="text-blue-500 hover:underline" rel="noreferrer">
                Vercel Documentation
              </a>
            </li>
            <li>
              <a href="/DEPLOYMENT.md" className="text-blue-500 hover:underline">
                Full Deployment Guide
              </a>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
