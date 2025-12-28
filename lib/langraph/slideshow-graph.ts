import { StateGraph, END, START, Annotation } from "@langchain/langgraph"
import { HumanMessage } from "@langchain/core/messages"
import { ChatOpenAI } from "@langchain/openai"
import {
  LLMSlideshowResponseSchema,
  type GenerateSlideshowRequest,
  type SlideshowResponse,
  type LLMSlideshowResponse,
} from "@/lib/types/slideshow"
import { fetchSlideImages, fetchAlternativeImages } from "@/lib/services/image-service"

// Define the state annotation for our graph
const GraphStateAnnotation = Annotation.Root({
  formData: Annotation<GenerateSlideshowRequest>,
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
    // Image fields will be added later by the enrichWithImages node
    const slideshowContent: SlideshowResponse = {
      slides: llmResponse.slides.map((slide) => ({
        ...slide,
        imageUrl: undefined,
        imageMetadata: undefined,
      })),
      globalSuggestedImageTerm: llmResponse.globalSuggestedImageTerm,
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
- Contain compelling text content (max 500 chars per slide)
- You can use newlines to separate a headline from body text if needed for the template style
- Follow the ${formData.template} template style
- Be optimized for ${formData.tone.toLowerCase()} tone
- Progress logically (hook → value → CTA)
- Include a suggestedImageKeyword field for each slide with a specific image search term${formData.imageOption === "stock" && formData.imageVibe ? ` that matches the vibe: "${formData.imageVibe}"` : ""}

Slide 1 should hook the audience. Middle slides should deliver value. Final slide should include the call-to-action: "${formData.cta}"

IMPORTANT: The text field should contain the complete slide content. You may use newlines (\\n) to create visual separation between a headline and supporting text when appropriate for the template style.

REQUIRED: Each slide object MUST include a "suggestedImageKeyword" field with a specific search term for finding relevant stock photos for that particular slide.

ADDITIONALLY, provide ONE single global search term (globalSuggestedImageTerm) that captures the main theme of this entire slideshow. This should be a concise phrase (1-3 words) that represents the core visual concept for finding alternative images.

Generate the slideshow content now.`
}

// Helper function for template-specific guidance
function getTemplateGuidance(template: string): string {
  const llmGuidance: Record<string, string> = {
    Bold: `Short, punchy statements that build up to a product reveal or strong message. Great for storytelling. Use powerful language that demands attention.

Example JSON response:
{
  "slides": [
    {
      "slideNumber": 1,
      "text": "POV: You're about to enjoy a good meal",
      "suggestedImageKeyword": "healthy meal prep"
    },
    {
      "slideNumber": 2,
      "text": "But you forgot to check the macros",
      "suggestedImageKeyword": "confused person food"
    },
    {
      "slideNumber": 3,
      "text": "Don't worry that's why I'm here",
      "suggestedImageKeyword": "helpful assistant"
    },
    {
      "slideNumber": 4,
      "text": "Cal AI tracks everything for you",
      "suggestedImageKeyword": "nutrition tracking app"
    },
    {
      "slideNumber": 5,
      "text": "Now that's a good meal :)",
      "suggestedImageKeyword": "satisfied eating"
    }
  ],
  "globalSuggestedImageTerm": "healthy eating"
}`,

    Informational: `Detailed breakdowns of multiple items with features and benefits. Perfect for recommendations and reviews. Focus on clear, educational content with data points and facts.

Example JSON response:
{
  "slides": [
    {
      "slideNumber": 1,
      "text": "Journalling apps you'll actually use (all free)",
      "suggestedImageKeyword": "journaling apps smartphone"
    },
    {
      "slideNumber": 2,
      "text": "Cherish\\nSeven journal formats, cozy music, special prompts",
      "suggestedImageKeyword": "cozy journaling"
    },
    {
      "slideNumber": 3,
      "text": "Mood Chonk\\nTrack moods, gratitude journal, super cute",
      "suggestedImageKeyword": "mood tracking journal"
    },
    {
      "slideNumber": 4,
      "text": "Stoic\\nClean UI, morning prep & evening reflection",
      "suggestedImageKeyword": "minimalist journaling"
    },
    {
      "slideNumber": 5,
      "text": "Ghost Diary\\nTag moods & activities, no ads",
      "suggestedImageKeyword": "digital diary"
    }
  ],
  "globalSuggestedImageTerm": "journaling"
}`,

    "Top 10": `Numbered list format with brief descriptions for each item. Ideal for rankings, tips, and must-haves. Each slide should present one item with its number (e.g., '#1: ...', '#2: ...').

Example JSON response:
{
  "slides": [
    {
      "slideNumber": 1,
      "text": "3 Supplements you need to be taking as a natty lifter",
      "suggestedImageKeyword": "supplements fitness"
    },
    {
      "slideNumber": 2,
      "text": "1) Fish Oil\\nRich in omega-3s, reduces inflammation",
      "suggestedImageKeyword": "fish oil capsules"
    },
    {
      "slideNumber": 3,
      "text": "2) Magnesium Glucinate\\nBetter sleep, less cramps",
      "suggestedImageKeyword": "magnesium supplement"
    },
    {
      "slideNumber": 4,
      "text": "3) Vitamin D 10,000 IUs\\nBoosts testosterone & mood",
      "suggestedImageKeyword": "vitamin d sunshine"
    },
    {
      "slideNumber": 5,
      "text": "4) Zinc\\nSupports recovery & immune health",
      "suggestedImageKeyword": "zinc supplement"
    }
  ],
  "globalSuggestedImageTerm": "fitness supplements"
}`,

    "Hard Sell": `Direct, benefit-focused messaging with minimal text per slide. Ends with a clear call-to-action. Emphasize benefits and urgency using persuasive language.

Example JSON response:
{
  "slides": [
    {
      "slideNumber": 1,
      "text": "Cleanest hoodie ever",
      "suggestedImageKeyword": "premium hoodie"
    },
    {
      "slideNumber": 2,
      "text": "So fresh",
      "suggestedImageKeyword": "fresh clean clothing"
    },
    {
      "slideNumber": 3,
      "text": "Cotton only",
      "suggestedImageKeyword": "cotton fabric"
    },
    {
      "slideNumber": 4,
      "text": "Free shipping",
      "suggestedImageKeyword": "fast delivery"
    },
    {
      "slideNumber": 5,
      "text": "Get it in the link in bio",
      "suggestedImageKeyword": "shop now"
    }
  ],
  "globalSuggestedImageTerm": "premium clothing"
}`,
  }

  return llmGuidance[template] || ""
}

// Node function: Enrich slideshow with images from Pexels
async function enrichWithImages(
  state: typeof GraphStateAnnotation.State
): Promise<Partial<typeof GraphStateAnnotation.State>> {
  const { slideshowContent, formData } = state

  if (!slideshowContent) {
    return {}
  }

  try {
    // Fetch slide-specific images using service layer
    const imageResults = await fetchSlideImages(
      slideshowContent.slides,
      formData
    )

    // Merge slides with images
    const slidesWithImages = slideshowContent.slides.map((slide, index) => ({
      ...slide,
      ...imageResults[index],
    }))

    // Fetch alternative images using service layer
    const alternativeImages = await fetchAlternativeImages(
      slideshowContent.globalSuggestedImageTerm,
      formData.imageVibe
    )

    return {
      slideshowContent: {
        ...slideshowContent,
        slides: slidesWithImages,
        suggestedReplacementImages: alternativeImages,
      },
      error: undefined,
    }
  } catch (error) {
    console.error("Error enriching with images:", error)
    // Don't fail - return slides without images
    return { error: undefined }
  }
}

// Build the graph
export function createSlideshowGraph() {
  const workflow = new StateGraph(GraphStateAnnotation)

  // Add nodes: content generation + image enrichment
  workflow.addNode("generate", generateSlideshow)
  workflow.addNode("enrichWithImages", enrichWithImages)

  // Set entry point
  workflow.addEdge(START, "generate")

  // Linear flow: generate content → enrich with images → end
  workflow.addEdge("generate", "enrichWithImages")
  workflow.addEdge("enrichWithImages", END)

  return workflow.compile()
}
