import { StateGraph, END, START, Annotation } from "@langchain/langgraph"
import { BaseMessage, HumanMessage } from "@langchain/core/messages"
import { ChatOpenAI } from "@langchain/openai"
import {
  LLMSlideshowResponseSchema,
  type GenerateSlideshowRequest,
  type SlideshowResponse,
  type LLMSlideshowResponse,
} from "@/lib/types/slideshow"
import { searchPexelsPhotos } from "@/lib/apis/pexels"

// Define the state annotation for our graph
const GraphStateAnnotation = Annotation.Root({
  formData: Annotation<GenerateSlideshowRequest>,
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  slideshowContent: Annotation<SlideshowResponse | undefined>,
  error: Annotation<string | undefined>,
})

// Initialize the LLM
function createLLM() {
  return new ChatOpenAI({
    modelName: "gpt-4o-mini", // Cost-effective model for testing
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  })
}

// Create LLM with structured output (using LLM schema without image fields)
function createStructuredLLM() {
  const llm = createLLM()
  return llm.withStructuredOutput(LLMSlideshowResponseSchema)
}

// Node function: Generate slideshow content
async function generateSlideshow(
  state: typeof GraphStateAnnotation.State
): Promise<Partial<typeof GraphStateAnnotation.State>> {
  try {
    const { formData } = state
    const prompt = buildPrompt(formData)

    const structuredLLM = createStructuredLLM()
    const llmResponse = (await structuredLLM.invoke([new HumanMessage(prompt)])) as LLMSlideshowResponse

    // Convert LLM response to full SlideshowResponse format
    // Image fields will be added later by the fetchImagesForSlides node
    const slideshowContent: SlideshowResponse = {
      slides: llmResponse.slides.map((slide) => ({
        ...slide,
        imageUrl: undefined,
        imageMetadata: undefined,
      })),
      suggestedImageKeywords: llmResponse.suggestedImageKeywords,
    }

    return {
      slideshowContent,
      error: undefined,
    }
  } catch (error) {
    console.error("Error in generateSlideshow node:", error)
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Helper function to build the prompt
function buildPrompt(formData: GenerateSlideshowRequest): string {
  const templateGuidance = getTemplateGuidance(formData.template)

  return `You are an expert social media copywriter. Generate compelling slideshow content for Instagram/TikTok.

**Product/Promotion**: ${formData.promotion}

**Target Audience**: ${formData.audience}

**Tone**: ${formData.tone}

**Template Style**: ${formData.template}
${templateGuidance}

**Call-to-Action**: ${formData.cta}

**Number of Slides**: ${formData.slideCount}

${formData.imageOption === "stock" && formData.imageVibe ? `**Image Vibe**: ${formData.imageVibe}` : ""}

Create exactly ${formData.slideCount} slides. Each slide should:
- Have a concise, attention-grabbing headline (max 100 chars)
- Include supporting body text that elaborates (max 300 chars)
- Include speaker notes with tips for presenting this slide
- Follow the ${formData.template} template style
- Be optimized for ${formData.tone.toLowerCase()} tone
- Progress logically (hook → value → CTA)

Slide 1 should hook the audience. Middle slides should deliver value. Final slide should include the call-to-action: "${formData.cta}"

${formData.imageOption === "stock" && formData.imageVibe ? `Also suggest 3-5 image search keywords that match the vibe: "${formData.imageVibe}"` : `Also suggest 3-5 generic image search keywords for the slideshow.`}

ADDITIONALLY, provide ONE single global search term that captures the main theme of this entire slideshow. This should be a concise phrase (1-3 words) that represents the core visual concept for finding alternative images.

Generate the slideshow content now.`
}

// Helper function for template-specific guidance
function getTemplateGuidance(template: string): string {
  const guidance: Record<string, string> = {
    Bold: "Use powerful, action-oriented language. Headlines should be provocative and demand attention. Think big, bold statements.",
    Informational:
      "Focus on clear, educational content. Use data points, facts, and structured information. Professional and straightforward.",
    "Top 10":
      "Structure as a countdown or numbered list. Each slide should present one item with its number (e.g., '#5: ...'). Build anticipation.",
    "Hard Sell":
      "Emphasize benefits and urgency. Use persuasive language focused on transformation and results. Strong CTAs throughout.",
    Minimal: "Keep it simple and elegant. Short, impactful headlines with minimal body text. Less is more.",
  }

  return guidance[template] || ""
}

// Node function: Fetch images for slides from Pexels
async function fetchImagesForSlides(
  state: typeof GraphStateAnnotation.State
): Promise<Partial<typeof GraphStateAnnotation.State>> {
  const { slideshowContent, formData } = state

  // Only fetch images if stock photos option is selected
  if (!slideshowContent || formData.imageOption !== "stock") {
    return {}
  }

  try {
    // Fetch images for each slide using suggested keywords or headlines
    const imageResults = await Promise.all(
      slideshowContent.slides.map(async (slide, index) => {
        try {
          // Use suggested keywords if available, otherwise fall back to headline
          const query =
            slideshowContent.suggestedImageKeywords[index] ||
            slide.headline ||
            formData.promotion

          // Add image vibe to query if provided
          const searchQuery = formData.imageVibe
            ? `${query} ${formData.imageVibe}`
            : query

          const photos = await searchPexelsPhotos(searchQuery, 1)

          if (photos.length > 0) {
            return {
              imageUrl: photos[0].url,
              imageMetadata: {
                url: photos[0].url,
                photographer: photos[0].photographer,
                photographerUrl: photos[0].photographerUrl,
                alt: photos[0].alt,
              },
            }
          }

          return { imageUrl: undefined, imageMetadata: undefined }
        } catch (error) {
          console.error(`Error fetching image for slide ${index + 1}:`, error)
          return { imageUrl: undefined, imageMetadata: undefined }
        }
      })
    )

    // Update slides with image URLs and metadata
    const updatedSlides = slideshowContent.slides.map((slide, index) => ({
      ...slide,
      ...imageResults[index],
    }))

    return {
      slideshowContent: {
        ...slideshowContent,
        slides: updatedSlides,
      },
      error: undefined,
    }
  } catch (error) {
    console.error("Error in fetchImagesForSlides node:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to fetch images",
    }
  }
}

// Node function: Fetch suggested replacement images using global term
async function fetchSuggestedReplacementImages(
  state: typeof GraphStateAnnotation.State
): Promise<Partial<typeof GraphStateAnnotation.State>> {
  const { slideshowContent, formData } = state

  console.log("🔍 fetchSuggestedReplacementImages called:", {
    hasSlideshowContent: !!slideshowContent,
    imageOption: formData.imageOption,
    globalTerm: slideshowContent?.globalSuggestedImageTerm,
  })

  // Only fetch if stock photos option is selected and we have a global term
  if (
    !slideshowContent ||
    formData.imageOption !== "stock" ||
    !slideshowContent.globalSuggestedImageTerm
  ) {
    console.log("⏭️ Skipping suggested images fetch (conditions not met)")
    return {}
  }

  try {
    // Fetch 3 images using the global suggested term
    const searchQuery = formData.imageVibe
      ? `${slideshowContent.globalSuggestedImageTerm} ${formData.imageVibe}`
      : slideshowContent.globalSuggestedImageTerm

    console.log("🔎 Fetching suggested images with query:", searchQuery)
    const photos = await searchPexelsPhotos(searchQuery, 3)

    // Convert to ImageMetadata format
    const suggestedReplacementImages = photos.map((photo) => ({
      url: photo.url,
      photographer: photo.photographer,
      photographerUrl: photo.photographerUrl,
      alt: photo.alt,
    }))

    console.log("✅ Fetched", suggestedReplacementImages.length, "suggested images")

    return {
      slideshowContent: {
        ...slideshowContent,
        suggestedReplacementImages,
      },
      error: undefined,
    }
  } catch (error) {
    console.error("Error fetching suggested replacement images:", error)
    // Don't fail the whole workflow - just log and continue
    return {
      error: undefined, // Don't propagate error, suggested images are optional
    }
  }
}

// Build the graph
export function createSlideshowGraph() {
  const workflow = new StateGraph(GraphStateAnnotation)

  // Add nodes
  workflow.addNode("generate", generateSlideshow)
  workflow.addNode("fetchImages", fetchImagesForSlides)
  workflow.addNode("fetchSuggestedImages", fetchSuggestedReplacementImages)

  // Set entry point
  workflow.addEdge(START, "generate")

  // Generate content first, then fetch images, then fetch suggested images
  workflow.addEdge("generate", "fetchImages")
  workflow.addEdge("fetchImages", "fetchSuggestedImages")

  // Suggested images to end
  workflow.addEdge("fetchSuggestedImages", END)

  return workflow.compile()
}
