"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Search,
} from "lucide-react"
import type { FormData } from "./slideshow-generator"
import type { SlideshowResponse } from "@/lib/types/slideshow"

type Slide = {
  id: string
  imageUrl: string
  text: string
  headline: string
  bodyText: string
  speakerNotes: string
  imageMetadata?: {
    photographer?: string
    photographerUrl?: string
    alt?: string
  }
  textPosition: { x: number; y: number }
  textSize: { width: number; height: number }
  fontSize: number
  fontFamily: string
  textColor: string
  textAlign: "left" | "center" | "right"
  brightness: number
  contrast: number
  overlayOpacity: number
  padding: number
}

type SlideshowEditorProps = {
  formData: FormData
  slideshowData: SlideshowResponse | null
  onBack: () => void
}

export default function SlideshowEditor({ formData, slideshowData, onBack }: SlideshowEditorProps) {
  const defaultImages = [
    "/business-presentation.png",
    "/modern-office-space.png",
    "/team-collaboration.png",
    "/technology-workspace.jpg",
    "/abstract-creative-design.png",
    "/professional-meeting.png",
  ]

  // Generate slides from API data or mock data
  const generateSlides = (): Slide[] => {
    if (slideshowData && slideshowData.slides) {
      // Use real data from API
      return slideshowData.slides.map((slide, i) => ({
        id: `slide-${slide.slideNumber}`,
        imageUrl: slide.imageUrl || defaultImages[i % defaultImages.length],
        text: slide.headline,
        headline: slide.headline,
        bodyText: slide.bodyText,
        speakerNotes: slide.speakerNotes,
        imageMetadata: slide.imageMetadata,
        textPosition: { x: 50, y: 400 },
        textSize: { width: 700, height: 100 },
        fontSize: 48,
        fontFamily: "Inter",
        textColor: "#ffffff",
        textAlign: "center",
        brightness: 100,
        contrast: 100,
        overlayOpacity: 40,
        padding: 40,
      }))
    } else {
      // Fallback to mock data
      const count = Number.parseInt(formData.slideCount)
      return Array.from({ length: count }, (_, i) => ({
        id: `slide-${i + 1}`,
        imageUrl: defaultImages[i % defaultImages.length],
        text: i === 0 ? formData.promotion : `Slide ${i + 1} content for ${formData.audience}`,
        headline: i === 0 ? formData.promotion : `Slide ${i + 1} content`,
        bodyText: `Supporting text for ${formData.audience}`,
        speakerNotes: "",
        textPosition: { x: 50, y: 400 },
        textSize: { width: 700, height: 100 },
        fontSize: 48,
        fontFamily: "Inter",
        textColor: "#ffffff",
        textAlign: "center",
        brightness: 100,
        contrast: 100,
        overlayOpacity: 40,
        padding: 40,
      }))
    }
  }

  const [slides, setSlides] = useState<Slide[]>(generateSlides())
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null)
  const [imageSearchOpen, setImageSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const canvasRef = useRef<HTMLDivElement>(null)

  const currentSlide = slides[currentSlideIndex]

  // Mock image search results
  const mockImages = [
    "/business-presentation.png",
    "/modern-office-space.png",
    "/team-collaboration.png",
    "/technology-workspace.jpg",
    "/abstract-creative-design.png",
    "/professional-meeting.png",
  ]

  const updateSlide = (updates: Partial<Slide>) => {
    setSlides((prev) => prev.map((slide, idx) => (idx === currentSlideIndex ? { ...slide, ...updates } : slide)))
  }

  const handleTextMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("resize-handle")) {
      setIsResizing(true)
    } else {
      setIsDragging(true)
    }
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y
        updateSlide({
          textPosition: {
            x: currentSlide.textPosition.x + deltaX,
            y: currentSlide.textPosition.y + deltaY,
          },
        })
        setDragStart({ x: e.clientX, y: e.clientY })
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y
        updateSlide({
          textSize: {
            width: Math.max(200, currentSlide.textSize.width + deltaX),
            height: Math.max(50, currentSlide.textSize.height + deltaY),
          },
        })
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragStart, currentSlide])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSlideIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedSlideIndex === null || draggedSlideIndex === index) return

    const newSlides = [...slides]
    const draggedSlide = newSlides[draggedSlideIndex]
    newSlides.splice(draggedSlideIndex, 1)
    newSlides.splice(index, 0, draggedSlide)

    setSlides(newSlides)
    setDraggedSlideIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedSlideIndex(null)
  }

  const handleReplaceImage = (imageUrl: string) => {
    updateSlide({ imageUrl })
    setImageSearchOpen(false)
  }

  const setTextPreset = (preset: "top" | "center" | "bottom") => {
    const positions = {
      top: { x: 50, y: 100 },
      center: { x: 50, y: 300 },
      bottom: { x: 50, y: 500 },
    }
    updateSlide({ textPosition: positions[preset] })
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <span className="text-sm font-medium">Slideshow Editor</span>
        </div>
        <div className="text-sm font-medium">
          Slide {currentSlideIndex + 1} of {slides.length}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Preview
          </Button>
          <Button size="sm">Export →</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 p-8 overflow-auto">
          {/* Zoom Slider */}
          <div className="mb-4 flex items-center gap-4 w-64">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Zoom: {zoom}%</span>
            <Slider
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
              min={25}
              max={200}
              step={5}
              className="flex-1"
            />
          </div>

          <div
            ref={canvasRef}
            className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
            style={{
              width: `${(800 * zoom) / 100}px`,
              height: `${(800 * zoom) / 100}px`,
            }}
          >
            {/* Background Image */}
            <img
              src={currentSlide.imageUrl || "/placeholder.svg"}
              alt="Slide background"
              className="w-full h-full object-cover"
              style={{
                filter: `brightness(${currentSlide.brightness}%) contrast(${currentSlide.contrast}%)`,
              }}
            />

            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black pointer-events-none"
              style={{ opacity: currentSlide.overlayOpacity / 100 }}
            />

            {/* Grid Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "50px 50px",
              }}
            />

            {/* Draggable Text */}
            <div
              className="absolute cursor-move group"
              style={{
                left: `${(currentSlide.textPosition.x * zoom) / 100}px`,
                top: `${(currentSlide.textPosition.y * zoom) / 100}px`,
                width: `${(currentSlide.textSize.width * zoom) / 100}px`,
                height: `${(currentSlide.textSize.height * zoom) / 100}px`,
              }}
              onMouseDown={handleTextMouseDown}
            >
              <div
                className="w-full h-full flex items-center justify-center border-2 border-dashed border-primary/50 group-hover:border-primary transition-colors"
                style={{
                  padding: `${currentSlide.padding}px`,
                }}
              >
                <p
                  className="w-full"
                  style={{
                    fontSize: `${(currentSlide.fontSize * zoom) / 100}px`,
                    fontFamily: currentSlide.fontFamily,
                    color: currentSlide.textColor,
                    textAlign: currentSlide.textAlign,
                    lineHeight: 1.2,
                  }}
                >
                  {currentSlide.text}
                </p>
              </div>
              {/* Resize Handle */}
              <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-tl cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Right: Properties Panel */}
        <div className="w-[320px] border-l border-border bg-background overflow-y-auto">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>

            <div className="p-4">
              <TabsContent value="text" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select value={currentSlide.fontFamily} onValueChange={(value) => updateSlide({ fontFamily: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Size: {currentSlide.fontSize}px</Label>
                  <Slider
                    value={[currentSlide.fontSize]}
                    onValueChange={([value]) => updateSlide({ fontSize: value })}
                    min={16}
                    max={120}
                    step={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={currentSlide.textColor}
                      onChange={(e) => updateSlide({ textColor: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={currentSlide.textColor}
                      onChange={(e) => updateSlide({ textColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Alignment</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={currentSlide.textAlign === "left" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSlide({ textAlign: "left" })}
                      className="flex-1"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={currentSlide.textAlign === "center" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSlide({ textAlign: "center" })}
                      className="flex-1"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={currentSlide.textAlign === "right" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSlide({ textAlign: "right" })}
                      className="flex-1"
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Text Content</Label>
                  <Textarea
                    value={currentSlide.text}
                    onChange={(e) => updateSlide({ text: e.target.value })}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </TabsContent>

              <TabsContent value="image" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label>Current Image</Label>
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <img
                      src={currentSlide.imageUrl || "/placeholder.svg"}
                      alt="Current"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {currentSlide.imageMetadata && currentSlide.imageMetadata.photographer && (
                    <p className="text-xs text-muted-foreground">
                      Photo by{" "}
                      <a
                        href={currentSlide.imageMetadata.photographerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground"
                      >
                        {currentSlide.imageMetadata.photographer}
                      </a>{" "}
                      on Pexels
                    </p>
                  )}
                </div>

                <Dialog open={imageSearchOpen} onOpenChange={setImageSearchOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Search className="h-4 w-4 mr-2" />
                      Replace Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Search Images</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search Pexels, Unsplash..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                        {mockImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleReplaceImage(img)}
                            className="relative aspect-video rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all"
                          >
                            <img
                              src={img || "/placeholder.svg"}
                              alt={`Result ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Your Own
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="space-y-2">
                  <Label>Brightness: {currentSlide.brightness}%</Label>
                  <Slider
                    value={[currentSlide.brightness]}
                    onValueChange={([value]) => updateSlide({ brightness: value })}
                    min={50}
                    max={150}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contrast: {currentSlide.contrast}%</Label>
                  <Slider
                    value={[currentSlide.contrast]}
                    onValueChange={([value]) => updateSlide({ contrast: value })}
                    min={50}
                    max={150}
                    step={5}
                  />
                </div>
              </TabsContent>

              <TabsContent value="layout" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label>Text Position Presets</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTextPreset("top")}
                      className="flex-col h-auto py-3"
                    >
                      <div className="w-full h-1 bg-primary rounded mb-1" />
                      <div className="w-full h-8 bg-muted rounded" />
                      <span className="text-xs mt-1">Top</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTextPreset("center")}
                      className="flex-col h-auto py-3"
                    >
                      <div className="w-full h-3 bg-muted rounded mb-1" />
                      <div className="w-full h-1 bg-primary rounded mb-1" />
                      <div className="w-full h-3 bg-muted rounded" />
                      <span className="text-xs mt-1">Center</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTextPreset("bottom")}
                      className="flex-col h-auto py-3"
                    >
                      <div className="w-full h-8 bg-muted rounded mb-1" />
                      <div className="w-full h-1 bg-primary rounded" />
                      <span className="text-xs mt-1">Bottom</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Text Padding: {currentSlide.padding}px</Label>
                  <Slider
                    value={[currentSlide.padding]}
                    onValueChange={([value]) => updateSlide({ padding: value })}
                    min={0}
                    max={80}
                    step={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Background Overlay: {currentSlide.overlayOpacity}%</Label>
                  <Slider
                    value={[currentSlide.overlayOpacity]}
                    onValueChange={([value]) => updateSlide({ overlayOpacity: value })}
                    min={0}
                    max={80}
                    step={5}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="h-24 border-t border-border flex items-center justify-center px-4 bg-muted/30">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-2 overflow-x-auto py-2 max-w-[800px]">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => setCurrentSlideIndex(index)}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  index === currentSlideIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/20"
                }`}
              >
                <div className="w-16 h-16 relative">
                  <img
                    src={slide.imageUrl || "/placeholder.svg"}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{index + 1}</span>
                  </div>
                </div>
                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-3 w-3 text-white drop-shadow" />
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlideIndex === slides.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
