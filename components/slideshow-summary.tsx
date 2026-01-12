"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Edit2, Clock, FileText, Sparkles } from "lucide-react"
import type { FormData } from "./slideshow-generator"

type Props = {
  data: FormData
  onBack: () => void
  onEdit: (field: string) => void
  onGenerate: () => void
}

export default function SlideshowSummary({ data, onBack, onEdit, onGenerate }: Props) {
  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  const getImageStyleText = () => {
    if (data.imageOption === "none") return "Text-only (no images)"
    if (data.imageOption === "upload") return "Custom uploaded images"
    return `Stock photos: ${data.imageVibe || "Not specified"}`
  }

  const summaryItems = [
    {
      label: "Product/Promotion",
      value: truncate(data.promotion, 120),
      field: "promotion",
    },
    {
      label: "Target Audience",
      value: data.audience,
      field: "audience",
    },
    {
      label: "Image Style",
      value: getImageStyleText(),
      field: "imageOption",
    },
    {
      label: "Tone",
      value: data.tone,
      field: "tone",
    },
    {
      label: "Call-to-action",
      value: data.cta,
      field: "cta",
    },
    {
      label: "Slide Count",
      value: `${data.slideCount} slides`,
      field: "slideCount",
    },
  ]

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-[680px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-foreground italic font-[family-name:var(--font-tiktok-sans)]">
            SlideStudio
          </h1>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Product Info
            </span>
            <span className="text-muted-foreground">›</span>
            <span className="text-muted-foreground">
              Settings
            </span>
            <span className="text-muted-foreground">›</span>
            <span className="font-medium text-primary">
              Review
            </span>
          </div>
        </div>

        <Card className="p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-2 text-balance">Ready to generate your slideshow?</h2>
          <p className="text-muted-foreground mb-8">
            Review your choices below. You can edit any field before generating.
          </p>

          <div className="space-y-4 mb-8">
            {summaryItems.map((item) => (
              <Card key={item.field} className="p-5 bg-accent/30 border-border/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-base text-foreground">{item.value}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item.field)}
                    className="shrink-0 h-8 text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </Card>
            ))}

            <Card className="p-5 bg-accent/30 border-border/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Template Style</p>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-14 bg-secondary rounded border border-border flex items-center justify-center shrink-0">
                      {data.template === "Bold" || data.template === "Hard Sell" ? (
                        <Sparkles className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-base text-foreground">{data.template}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit("template")}
                  className="shrink-0 h-8 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </Card>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8 py-3 px-4 bg-secondary/50 rounded-lg">
            <Clock className="h-4 w-4" />
            <span>Estimated generation time: ~30 seconds</span>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={onBack}
              className="flex-1 h-12 text-base font-medium bg-transparent"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Edit
            </Button>
            <Button
              size="lg"
              onClick={onGenerate}
              className="flex-1 h-12 text-base font-medium shadow-md hover:shadow-lg transition-all"
            >
              Generate Slideshow
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
