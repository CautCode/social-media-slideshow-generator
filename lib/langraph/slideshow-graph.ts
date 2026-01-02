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

  return `You are an expert viral content writer for TikTok and Instagram slideshows. Your job is to create carousel content that stops scrollers, builds engagement through each swipe, and drives action.

=== INPUTS ===
Product/Promotion: ${formData.promotion}
Target Audience: ${formData.audience}
Tone: ${formData.tone}
Call-to-Action: ${formData.cta}
Number of Slides: ${formData.slideCount}
Template Style: ${formData.template}
${formData.imageOption === "stock" && formData.imageVibe ? `Image Vibe: ${formData.imageVibe}` : ""}

=== TEMPLATE STYLES ===

${templateGuidance}

=== WRITING RULES ===

1. **SLIDE 1 MUST HOOK**
   - Use: questions, "POV:", bold claims, relatable scenarios, or "X things you..."
   - Never start with generic introductions
   - Create immediate curiosity or recognition

2. **KEEP IT SHORT**
   - Max 500 characters per slide
   - Prefer fragments over full sentences
   - One idea per slide
   - Use line breaks to create rhythm
   - NEVER use dashes (-) or bullet points in slide text - they don't fit the social media style

3. **SOUND HUMAN**
   - Write like you're texting a friend who asked for advice
   - Use lowercase for casual feel when tone allows
   - Include opinions: "this is a game changer", "trust me on this"
   - Acknowledge pain points: "we've all been there"

4. **BUILD MOMENTUM**
   - Each slide should make them want to swipe
   - End slides with incomplete thoughts or teasers when appropriate
   - Save the best insight or the product reveal for later slides
   - Use "..." to create anticipation

5. **SPEAK DIRECTLY**
   - Heavy use of "you" and "your"
   - Address the audience's identity: "if you're a [type]..."
   - Make them feel seen: reference specific struggles or desires

6. **END WITH PURPOSE**
   - Final slide includes the CTA: "${formData.cta}"
   - Make the action feel natural, not salesy
   - Can add personality: emoji, encouragement, or a closing thought

=== SLIDE STRUCTURE ===

Generate exactly ${formData.slideCount} slides following this arc:
- Slide 1: HOOK - Stop the scroll
- Slides 2 to (n-1): VALUE - Deliver on the hook's promise
- Final Slide: CTA - Drive the action with "${formData.cta}"

=== OUTPUT FORMAT ===

For each slide, provide:
1. slideNumber: The slide position (1 to ${formData.slideCount})
2. text: The complete slide content (max 500 chars, use \\n for line breaks)
3. suggestedImageKeyword: A specific search term for stock photos${formData.imageOption === "stock" && formData.imageVibe ? ` matching "${formData.imageVibe}" vibe` : ""}

Also provide:
- globalSuggestedImageTerm: A 1-3 word theme for the entire slideshow

=== EXAMPLES BY TEMPLATE ===

These examples are already included in the template guidance above.

Now generate slideshow content for the inputs provided above.`
}

// Helper function for template-specific guidance
function getTemplateGuidance(template: string): string {
  const llmGuidance: Record<string, string> = {
    Bold: `**BOLD** (Story-driven reveal)
- Build a mini-narrative across slides
- Use "POV:", scenario setups, or conversation formats
- Short punchy lines that create suspense
- Product/solution appears as the payoff
- Example flow: Setup → Problem → Tension → Solution → Satisfaction

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

    Informational: `**INFORMATIONAL** (Value-packed lists)
- First slide: Hook with number + promise ("5 apps you'll actually use")
- Each item gets 3-4 bullet points max
- Include personal opinions ("my fav is...", "I love this because...")
- Mix features with emotional benefits
- End with soft CTA or recommendation

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
      "text": "Cherish\\nSeven journal formats\\nCozy music while you write\\nSpecial prompts for birthdays",
      "suggestedImageKeyword": "cozy journaling"
    },
    {
      "slideNumber": 3,
      "text": "Mood Chonk\\nTrack moods\\nGratitude journal\\nSuper cute",
      "suggestedImageKeyword": "mood tracking journal"
    },
    {
      "slideNumber": 4,
      "text": "Stoic\\nClean UI\\nMorning + evening reflections\\nWrite your own haiku",
      "suggestedImageKeyword": "minimalist journaling"
    },
    {
      "slideNumber": 5,
      "text": "Ghost Diary\\nTag moods & activities\\nNo ads",
      "suggestedImageKeyword": "digital diary"
    }
  ],
  "globalSuggestedImageTerm": "journaling"
}`,

    "Top 10": `**TOP X** (Ranked/numbered list)
- Open with a specific number and bold claim
- Each slide = one item with clear explanation
- Use second person ("you need", "this helps you")
- Include specific details (dosages, names, statistics)
- Close with strongest item or summary

Example JSON response:
{
  "slides": [
    {
      "slideNumber": 1,
      "text": "3 Supplements you need as a natty lifter",
      "suggestedImageKeyword": "supplements fitness"
    },
    {
      "slideNumber": 2,
      "text": "1) Fish Oil\\nRich in omega-3s, reduces inflammation, supports recovery",
      "suggestedImageKeyword": "fish oil capsules"
    },
    {
      "slideNumber": 3,
      "text": "2) Magnesium Glycinate\\nBetter sleep, less cramps",
      "suggestedImageKeyword": "magnesium supplement"
    },
    {
      "slideNumber": 4,
      "text": "3) Vitamin D 10,000 IUs\\nBoosts testosterone, mood, and immune health",
      "suggestedImageKeyword": "vitamin d sunshine"
    }
  ],
  "globalSuggestedImageTerm": "fitness supplements"
}`,

    "Hard Sell": `**HARD SELL** (Direct product push)
- Ultra-short lines (2-5 words per slide)
- Focus on product benefits, not features
- Create rhythm through repetition
- End with clear CTA and urgency
- Works best with strong visuals

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

    Minimal: `**MINIMAL** (Clean and aesthetic)
- One clear idea per slide
- No fluff, every word earns its place
- Whitespace is your friend
- Let the design carry weight
- Subtle, sophisticated language

Example JSON response:
{
  "slides": [
    {
      "slideNumber": 1,
      "text": "Less is more",
      "suggestedImageKeyword": "minimalist design"
    },
    {
      "slideNumber": 2,
      "text": "Quality over quantity",
      "suggestedImageKeyword": "premium quality"
    },
    {
      "slideNumber": 3,
      "text": "Designed for life",
      "suggestedImageKeyword": "timeless design"
    }
  ],
  "globalSuggestedImageTerm": "minimalism"
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
