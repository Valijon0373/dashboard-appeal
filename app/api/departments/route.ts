import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const facultyId = searchParams.get("faculty_id")

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
      },
    )

    let query = supabase.from("departments").select("*, faculties(name_uz, name_ru)")

    if (facultyId) {
      query = query.eq("faculty_id", facultyId)
    }

    const { data, error } = await query.order("name_uz", { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Departments error:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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

    const body = await request.json()
    const { data, error } = await supabase.from("departments").insert([body]).select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Create department error:", error)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
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

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Department ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("departments")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Update department error:", error)
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Department ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("departments").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete department error:", error)
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 })
  }
}
