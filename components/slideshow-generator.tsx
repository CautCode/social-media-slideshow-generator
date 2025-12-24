"use client"

import { useState } from "react"
import SlideshowForm from "./slideshow-form"
import SlideshowSummary from "./slideshow-summary"
import SlideshowEditor from "./slideshow-editor"

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
    imageOption: "none",
    imageVibe: "",
    uploadedFiles: [],
    tone: "Casual & Friendly",
    cta: "Link in bio",
    slideCount: "7",
    template: "Informational",
  })

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

  const handleGenerate = () => {
    setStep(4)
  }

  const handleBackFromEditor = () => {
    setStep(3)
  }

  return (
    <>
      {(step === 1 || step === 2) && (
        <SlideshowForm initialData={formData} currentStep={step} onStepChange={handleStepChange} />
      )}
      {step === 3 && (
        <SlideshowSummary data={formData} onBack={handleBack} onEdit={handleEdit} onGenerate={handleGenerate} />
      )}
      {step === 4 && <SlideshowEditor formData={formData} onBack={handleBackFromEditor} />}
    </>
  )
}
