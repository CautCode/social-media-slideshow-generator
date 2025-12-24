import { z } from "zod"

// Zod schema for a single slide's content
export const SlideContentSchema = z.object({
  slideNumber: z.number().min(1).max(10),
  headline: z.string().min(1).max(100),
  bodyText: z.string().min(0).max(300),
  speakerNotes: z.string(),
})

export type SlideContent = z.infer<typeof SlideContentSchema>

// Zod schema for the complete slideshow response
export const SlideshowResponseSchema = z.object({
  slides: z.array(SlideContentSchema),
  suggestedImageKeywords: z.array(z.string()),
})

export type SlideshowResponse = z.infer<typeof SlideshowResponseSchema>

// API Request type (extends FormData from slideshow-generator.tsx)
export type GenerateSlideshowRequest = {
  promotion: string
  audience: string
  imageOption: "none" | "upload" | "stock"
  imageVibe?: string
  tone: string
  cta: string
  slideCount: number
  template: string
}

// API Response type
export type GenerateSlideshowResponse =
  | {
      success: true
      data: SlideshowResponse
    }
  | {
      success: false
      error: string
      details?: unknown
    }
