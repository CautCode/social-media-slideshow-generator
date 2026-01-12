import { z } from "zod"

export const ImageMetadataSchema = z.object({
  url: z.string().url(),
  photographer: z.string().optional(),
  photographerUrl: z.string().url().optional(),
  alt: z.string().optional(),
})

export type ImageMetadata = z.infer<typeof ImageMetadataSchema>

export const LLMSlideContentSchema = z.object({
  slideNumber: z.number().min(1).max(10),
  text: z.string().min(1).max(500),
  suggestedImageKeyword: z.string(),
})

export type LLMSlideContent = z.infer<typeof LLMSlideContentSchema>

export const LLMSlideshowResponseSchema = z.object({
  slides: z.array(LLMSlideContentSchema),
  globalSuggestedImageTerm: z.string(),
})

export type LLMSlideshowResponse = z.infer<typeof LLMSlideshowResponseSchema>

export const SlideContentSchema = z.object({
  slideNumber: z.number().min(1).max(10),
  text: z.string().min(1).max(500),
  suggestedImageKeyword: z.string(),
  imageUrl: z.string().url().optional(),
  imageMetadata: ImageMetadataSchema.optional(),
})

export type SlideContent = z.infer<typeof SlideContentSchema>

export const SlideshowResponseSchema = z.object({
  slides: z.array(SlideContentSchema),
  globalSuggestedImageTerm: z.string().optional(),
  suggestedReplacementImages: z.array(ImageMetadataSchema).optional(),
})

export type SlideshowResponse = z.infer<typeof SlideshowResponseSchema>

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
