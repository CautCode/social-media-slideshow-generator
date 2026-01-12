import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createSlideshowGraph } from "@/lib/langraph/slideshow-graph"
import type { GenerateSlideshowRequest, GenerateSlideshowResponse } from "@/lib/types/slideshow"

const RequestSchema = z.object({
  promotion: z.string().min(1, "Promotion is required").max(500),
  audience: z.string().min(1, "Audience is required").max(100),
  imageOption: z.enum(["none", "upload", "stock"]),
  imageVibe: z.string().max(200).optional(),
  tone: z.string().min(1),
  cta: z.string().min(1),
  slideCount: z.string().transform(Number).pipe(z.number().min(5).max(10)),
  template: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = RequestSchema.parse(body)

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set")
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error: OpenAI API key not found",
        } satisfies GenerateSlideshowResponse,
        { status: 500 }
      )
    }

    const graph = createSlideshowGraph()

    const formData: GenerateSlideshowRequest = {
      promotion: validatedData.promotion,
      audience: validatedData.audience,
      imageOption: validatedData.imageOption,
      imageVibe: validatedData.imageVibe,
      tone: validatedData.tone,
      cta: validatedData.cta,
      slideCount: validatedData.slideCount,
      template: validatedData.template,
    }

    console.log("🎬 Generating slideshow with data:", {
      promotion: formData.promotion.substring(0, 50) + "...",
      audience: formData.audience,
      slideCount: formData.slideCount,
      template: formData.template,
    })

    const result = await graph.invoke({
      formData,
    })

    if (result.error) {
      console.error("❌ Graph execution error:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate slideshow content",
          details: result.error,
        } satisfies GenerateSlideshowResponse,
        { status: 500 }
      )
    }

    if (!result.slideshowContent) {
      console.error("❌ No slideshow content generated")
      return NextResponse.json(
        {
          success: false,
          error: "No content was generated",
        } satisfies GenerateSlideshowResponse,
        { status: 500 }
      )
    }

    console.log("✅ Generated slideshow content:")
    console.log(JSON.stringify(result.slideshowContent, null, 2))

    return NextResponse.json(
      {
        success: true,
        data: result.slideshowContent,
      } satisfies GenerateSlideshowResponse,
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Validation error:", error.errors)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors,
        } satisfies GenerateSlideshowResponse,
        { status: 400 }
      )
    }

    console.error("❌ Unexpected error in generate-slideshow API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      } satisfies GenerateSlideshowResponse,
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Slideshow generation API is running",
    hasApiKey: !!process.env.OPENAI_API_KEY,
  })
}
