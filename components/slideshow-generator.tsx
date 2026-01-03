"use client"

import { useState } from "react"
import SlideshowForm from "./slideshow-form"
import SlideshowSummary from "./slideshow-summary"
import SlideshowEditor from "./slideshow-editor"
import SlideshowLoading from "./slideshow-loading"
import type { SlideshowResponse } from "@/lib/types/slideshow"

export type FormData = {
  promotion: string
  audience: string
  imageOption: "none" | "upload" | "stock"
  imageVibe: string
  uploadedFiles: File[]
  tone: string
  cta: string
  slideCount: string
  template: string
}

export default function SlideshowGenerator() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [formData, setFormData] = useState<FormData>({
    promotion: "",
    audience: "",
    imageOption: "stock",
    imageVibe: "",
    uploadedFiles: [],
    tone: "Casual & Friendly",
    cta: "Link in bio",
    slideCount: "7",
    template: "Informational",
  })
  const [generatedSlideshow, setGeneratedSlideshow] = useState<SlideshowResponse | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleStepChange = (newStep: 1 | 2 | 3 | 4, data: FormData) => {
    setFormData(data)
    setStep(newStep)
  }

  const handleBack = () => {
    setStep(2)
  }

  const handleEdit = (field: string) => {
    if (field === "promotion" || field === "audience") {
      setStep(1)
    } else {
      setStep(2)
    }
  }

  const handleGenerate = async () => {
    console.log("🎬 Calling API to generate slideshow...")
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-slideshow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        console.log("✅ Slideshow generated successfully!")
        console.log("Generated content:", result.data)
        setGeneratedSlideshow(result.data)
        setIsGenerating(false)
        setStep(4)
      } else {
        console.error("❌ Generation failed:", result.error)
        if (result.details) {
          console.error("Error details:", result.details)
        }
        setIsGenerating(false)
        // TODO: Show error to user
      }
    } catch (error) {
      console.error("❌ API call failed:", error)
      setIsGenerating(false)
      // TODO: Show error to user
    }
  }

  const handleBackFromEditor = () => {
    setStep(3)
  }

  return (
    <>
      {(step === 1 || step === 2) && (
        <SlideshowForm initialData={formData} currentStep={step} onStepChange={handleStepChange} />
      )}
      {step === 3 && !isGenerating && (
        <SlideshowSummary data={formData} onBack={handleBack} onEdit={handleEdit} onGenerate={handleGenerate} />
      )}
      {isGenerating && <SlideshowLoading />}
      {step === 4 && (
        <SlideshowEditor formData={formData} slideshowData={generatedSlideshow} onBack={handleBackFromEditor} />
      )}
    </>
  )
}
