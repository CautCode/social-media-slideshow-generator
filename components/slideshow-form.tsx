"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowRight, ArrowLeft, FileText, Upload, ImageIcon } from "lucide-react"
import type { FormData } from "./slideshow-generator"

type Props = {
  initialData: FormData
  currentStep: 1 | 2
  onStepChange: (step: 1 | 2 | 3, data: FormData) => void
}

export default function SlideshowForm({ initialData, currentStep, onStepChange }: Props) {
  const [formData, setFormData] = useState<FormData>(initialData)

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isStep1Valid = formData.promotion.trim() !== "" && formData.audience.trim() !== ""

  const goToNextStep = () => {
    if (currentStep === 1 && isStep1Valid) {
      onStepChange(2, formData)
    } else if (currentStep === 2) {
      onStepChange(3, formData)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep === 2) {
      onStepChange(1, formData)
    }
  }

  const templates = [
    {
      name: "Bold",
      description: "Short, punchy statements that build up to a product reveal or strong message. Great for storytelling.",
      example: {
        title: "POV: You're about to enjoy a good meal",
        slides: [
          "But you forgot to check the macros",
          "Don't worry that's why I'm here",
          "Cal AI tracks everything for you",
          "Now that's a good meal :)"
        ]
      }
    },
    {
      name: "Informational",
      description: "Detailed breakdowns of multiple items with features and benefits. Perfect for recommendations and reviews.",
      example: {
        title: "Journalling apps you'll actually use (all free)",
        slides: [
          "Cherish - Seven journal formats, cozy music, special prompts",
          "Mood Chonk - Track moods, gratitude journal, super cute",
          "Stoic - Clean UI, morning prep & evening reflection",
          "Ghost Diary - Tag moods & activities, no ads"
        ]
      }
    },
    {
      name: "Top 10",
      description: "Numbered list format with brief descriptions for each item. Ideal for rankings, tips, and must-haves.",
      example: {
        title: "3 Supplements you need to be taking as a natty lifter",
        slides: [
          "1) Fish Oil - Rich in omega-3s, reduces inflammation",
          "2) Magnesium Glucinate - Better sleep, less cramps",
          "3) Vitamin D 10,000 IUs - Boosts testosterone & mood",
          "4) Zinc - Supports recovery & immune health"
        ]
      }
    },
    {
      name: "Hard Sell",
      description: "Direct, benefit-focused messaging with minimal text per slide. Ends with a clear call-to-action.",
      example: {
        title: "Cleanest hoodie ever",
        slides: [
          "So fresh",
          "Cotton only",
          "Free shipping",
          "Get it in the link in bio"
        ]
      }
    },
  ]

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-[680px] mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-foreground italic font-[family-name:var(--font-tiktok-sans)]">
            SlideGen
          </h1>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Step {currentStep}</span>
            <span>of</span>
            <span>3</span>
          </div>
          <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-lg">
          <div className="space-y-10">
            {currentStep === 1 && (
              <>
                {/* Question 1 */}
                <div className="space-y-3">
                  <Label htmlFor="promotion" className="text-lg font-medium">
                    What are you promoting?
                  </Label>
                  <Textarea
                    id="promotion"
                    placeholder="Handmade ceramic coffee mugs with minimalist designs, $45 each"
                    value={formData.promotion}
                    onChange={(e) => updateField("promotion", e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="resize-none text-base"
                    required
                  />
                  <div className="text-right text-sm text-muted-foreground">{formData.promotion.length}/500</div>
                </div>

                {/* Question 2 */}
                <div className="space-y-3">
                  <Label htmlFor="audience" className="text-lg font-medium">
                    Who is this for?
                  </Label>
                  <Input
                    id="audience"
                    placeholder="Coffee lovers, remote workers, gift shoppers"
                    value={formData.audience}
                    onChange={(e) => updateField("audience", e.target.value)}
                    maxLength={100}
                    className="text-base"
                    required
                  />
                  <div className="text-right text-sm text-muted-foreground">{formData.audience.length}/100</div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                {/* Question 3 */}
                <div className="space-y-4">
                  <Label className="text-lg font-medium">What kind of images should we include?</Label>
                  <RadioGroup
                    value={formData.imageOption}
                    onValueChange={(value: any) => updateField("imageOption", value)}
                    className="space-y-3"
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all ${
                        formData.imageOption === "none" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                      onClick={() => updateField("imageOption", "none")}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="none" id="none" />
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="none" className="cursor-pointer flex-1 font-normal">
                          None (Text-only)
                        </Label>
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all ${
                        formData.imageOption === "upload" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                      onClick={() => updateField("imageOption", "upload")}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="upload" id="upload" />
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="upload" className="cursor-pointer flex-1 font-normal">
                          {"I'll upload my own"}
                        </Label>
                      </div>
                      {formData.imageOption === "upload" && (
                        <div className="mt-4 ml-8 p-6 border-2 border-dashed border-border rounded-lg text-center bg-accent/50">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Drag & drop images here, or click to browse</p>
                        </div>
                      )}
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all ${
                        formData.imageOption === "stock" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                      onClick={() => updateField("imageOption", "stock")}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="stock" id="stock" />
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="stock" className="cursor-pointer flex-1 font-normal">
                          Find stock photos for me
                        </Label>
                      </div>
                      {formData.imageOption === "stock" && (
                        <div className="mt-4 ml-8 space-y-2">
                          <Label htmlFor="imageVibe" className="text-sm">
                            Describe the vibe/imagery
                          </Label>
                          <Input
                            id="imageVibe"
                            placeholder="cozy morning coffee, minimalist aesthetic, warm lighting"
                            value={formData.imageVibe}
                            onChange={(e) => updateField("imageVibe", e.target.value)}
                            maxLength={200}
                            className="text-sm"
                          />
                          <div className="text-right text-xs text-muted-foreground">
                            {formData.imageVibe.length}/200
                          </div>
                        </div>
                      )}
                    </Card>
                  </RadioGroup>
                </div>

                {/* Question 4 */}
                <div className="space-y-3">
                  <Label htmlFor="tone" className="text-lg font-medium">
                    Tone/Vibe
                  </Label>
                  <Select value={formData.tone} onValueChange={(value) => updateField("tone", value)}>
                    <SelectTrigger id="tone" className="text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casual & Friendly">Casual & Friendly</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Bold">Bold</SelectItem>
                      <SelectItem value="Minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question 5 */}
                <div className="space-y-3">
                  <Label htmlFor="cta" className="text-lg font-medium">
                    Call-to-action
                  </Label>
                  <Input
                    id="cta"
                    value={formData.cta}
                    onChange={(e) => updateField("cta", e.target.value)}
                    className="text-base"
                    required
                  />
                </div>

                {/* Question 6 */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">How many slides?</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-semibold text-foreground">{formData.slideCount}</span>
                      <span className="text-sm text-muted-foreground">slides</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="10"
                      step="1"
                      value={formData.slideCount}
                      onChange={(e) => updateField("slideCount", e.target.value)}
                      className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>

                {/* Question 7 */}
                <div className="space-y-4">
                  <Label className="text-lg font-medium">Template style</Label>
                  <Tabs value={formData.template} onValueChange={(value) => updateField("template", value)}>
                    <TabsList className="grid w-full grid-cols-4">
                      {templates.map((template) => (
                        <TabsTrigger key={template.name} value={template.name} className="text-sm">
                          {template.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {templates.map((template) => (
                      <TabsContent key={template.name} value={template.name} className="mt-4">
                        <Card className="p-6 bg-accent/30">
                          <p className="text-sm leading-relaxed text-muted-foreground">{template.description}</p>

                          {template.example && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Example Text</p>
                              <div className="bg-background/60 rounded-lg p-4 space-y-3">
                                <p className="font-semibold text-sm text-foreground">{template.example.title}</p>
                                <div className="space-y-2">
                                  {template.example.slides.map((slide, idx) => (
                                    <div key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                      <span className="text-primary font-medium mt-0.5">→</span>
                                      <span className="flex-1">{slide}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </Card>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </>
            )}

            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={goToPreviousStep}
                  className="flex-1 text-base font-medium h-12 bg-transparent"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
              )}
              <Button
                type="button"
                size="lg"
                onClick={goToNextStep}
                disabled={currentStep === 1 && !isStep1Valid}
                className="flex-1 text-base font-medium h-12 shadow-md hover:shadow-lg transition-all"
              >
                {currentStep === 2 ? "Review" : "Continue"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
