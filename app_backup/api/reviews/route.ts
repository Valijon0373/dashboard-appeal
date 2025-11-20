import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacher_id")
    const status = searchParams.get("status") // 'active' or 'all' (default 'all' or depending on logic)

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

    let query = supabase.from("reviews").select("*")

    if (teacherId) {
      query = query.eq("teacher_id", teacherId)
    }

    if (status === "active") {
      query = query.eq("is_verified", true)
    }
    // if status is not 'active', we return all (default behavior for admin)

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Reviews error:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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

    const body = await request.json()

    // Set is_verified to true by default so reviews appear immediately
    // Admin can hide them later if needed
    const reviewData = {
      ...body,
      is_verified: true,
    }

    const { data, error } = await supabase.from("reviews").insert([reviewData]).select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Create review error:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
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
    const { id, is_verified } = body

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("reviews")
      .update({ is_verified })
      .eq("id", id)
      .select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Update review error:", error)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
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
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("reviews").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete review error:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
