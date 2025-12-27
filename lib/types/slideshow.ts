import { z } from "zod"

// Zod schema for image metadata
export const ImageMetadataSchema = z.object({
  url: z.string().url(),
  photographer: z.string().optional(),
  photographerUrl: z.string().url().optional(),
  alt: z.string().optional(),
})

export type ImageMetadata = z.infer<typeof ImageMetadataSchema>

// Zod schema for LLM-generated slide content (without image fields)
// This is what the LLM generates via structured output
export const LLMSlideContentSchema = z.object({
  slideNumber: z.number().min(1).max(10),
  headline: z.string().min(1).max(100),
  bodyText: z.string().min(0).max(300),
  speakerNotes: z.string(),
})

export type LLMSlideContent = z.infer<typeof LLMSlideContentSchema>

// Zod schema for the LLM response (without images)
export const LLMSlideshowResponseSchema = z.object({
  slides: z.array(LLMSlideContentSchema),
  suggestedImageKeywords: z.array(z.string()),
})

export type LLMSlideshowResponse = z.infer<typeof LLMSlideshowResponseSchema>

// Zod schema for a complete slide (with image fields added later)
export const SlideContentSchema = z.object({
  slideNumber: z.number().min(1).max(10),
  headline: z.string().min(1).max(100),
  bodyText: z.string().min(0).max(300),
  speakerNotes: z.string(),
  imageUrl: z.string().url().optional(),
  imageMetadata: ImageMetadataSchema.optional(),
})

export type SlideContent = z.infer<typeof SlideContentSchema>

// Zod schema for the complete slideshow response (with images)
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
