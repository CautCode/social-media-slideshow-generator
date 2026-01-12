"use client"

import { Card } from "@/components/ui/card"

export default function SlideshowLoading() {
  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center">
      <div className="max-w-[680px] mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-foreground italic font-[family-name:var(--font-tiktok-sans)]">
            SlideStudio
          </h1>
        </div>

        <Card className="p-12 shadow-lg">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Crafting your slides
              </h2>
              <p className="text-muted-foreground">
                This may take up to 15 seconds
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
