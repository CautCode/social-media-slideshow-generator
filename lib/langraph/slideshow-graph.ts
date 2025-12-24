import { StateGraph, END, START, Annotation } from "@langchain/langgraph"
import { BaseMessage, HumanMessage } from "@langchain/core/messages"
import { ChatOpenAI } from "@langchain/openai"
import {
  SlideshowResponseSchema,
  type GenerateSlideshowRequest,
  type SlideshowResponse,
} from "@/lib/types/slideshow"

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

// Create LLM with structured output
function createStructuredLLM() {
  const llm = createLLM()
  return llm.withStructuredOutput(SlideshowResponseSchema)
}

// Node function: Generate slideshow content
async function generateSlideshow(
  state: typeof GraphStateAnnotation.State
): Promise<Partial<typeof GraphStateAnnotation.State>> {
  try {
    const { formData } = state
    const prompt = buildPrompt(formData)

    const structuredLLM = createStructuredLLM()
    const response = await structuredLLM.invoke([new HumanMessage(prompt)])

    return {
      slideshowContent: response as SlideshowResponse,
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

// Build the graph
export function createSlideshowGraph() {
  const workflow = new StateGraph(GraphStateAnnotation)

  // Add the single node
  workflow.addNode("generate", generateSlideshow)

  // Set entry point
  workflow.addEdge(START, "generate")

  // Define edge to end
  workflow.addEdge("generate", END)

  return workflow.compile()
}
