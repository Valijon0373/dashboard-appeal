import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get("department_id")

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

    // Fetch teachers with related department and reviews
    let query = supabase.from("teachers").select(`
        *,
        departments(
          name_uz
        ),
        reviews(
          id,
          rating,
          teaching_quality,
          communication,
          professional_knowledge,
          approachability
        )
      `)

    if (departmentId) {
      // Ensure department_id is properly filtered
      query = query.eq("department_id", departmentId)
    }

    const { data, error } = await query.order("last_name", { ascending: true })
    
    // Debug logging
    if (departmentId) {
      console.log("Filtering teachers by department_id:", departmentId)
      console.log("Found teachers:", data?.length || 0)
    }

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Teachers error:", error)
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 })
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
    const { data, error } = await supabase.from("teachers").insert([body]).select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Create teacher error:", error)
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 })
  }
}
