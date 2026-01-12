import { NextRequest, NextResponse } from "next/server"
import { searchPexelsPhotos } from "@/lib/apis/pexels"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, perPage = 3 } = body

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const images = await searchPexelsPhotos(query, perPage)

    return NextResponse.json({ images }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search images", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
