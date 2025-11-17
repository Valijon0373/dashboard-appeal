import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Handle cookie setting error
          }
        },
      },
    })

    // Create unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const buffer = await file.arrayBuffer()

    const { data, error } = await supabase.storage.from("teacher_photos").upload(filename, buffer, {
      contentType: file.type,
    })

    if (error) throw error

    // Get public URL
    const { data: publicData } = supabase.storage.from("teacher_photos").getPublicUrl(filename)

    return NextResponse.json({ url: publicData.publicUrl })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
