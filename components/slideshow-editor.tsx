"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { flushSync } from "react-dom"
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
  Grid3x3,
} from "lucide-react"
import type { FormData } from "./slideshow-generator"
import type { SlideshowResponse } from "@/lib/types/slideshow"
import { exportSlideAsPNG, exportAllSlidesAsZip } from "@/lib/utils/slide-export"

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
  textBorderWidth: number
  textBorderColor: string
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
        textPosition: { x: 25, y: 200 },
        textSize: { width: 350, height: 50 },
        fontSize: 24,
        fontFamily: "Inter",
        textColor: "#ffffff",
        textAlign: "center",
        brightness: 100,
        contrast: 100,
        overlayOpacity: 0,
        padding: 20,
        textBorderWidth: 0,
        textBorderColor: "#000000",
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
        textPosition: { x: 25, y: 200 },
        textSize: { width: 350, height: 50 },
        fontSize: 24,
        fontFamily: "Inter",
        textColor: "#ffffff",
        textAlign: "center",
        brightness: 100,
        contrast: 100,
        overlayOpacity: 0,
        padding: 20,
        textBorderWidth: 0,
        textBorderColor: "#000000",
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
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingAll, setIsExportingAll] = useState(false)
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 })
  const [slideChangeTimestamp, setSlideChangeTimestamp] = useState(Date.now())
  const [showGrid, setShowGrid] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Regenerate slides when slideshowData or formData changes (new slideshow created)
  useEffect(() => {
    console.log('[SlideshowEditor] Slideshow data changed, regenerating slides')
    const newSlides = generateSlides()
    setSlides(newSlides)
    setCurrentSlideIndex(0) // Reset to first slide
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideshowData, formData])

  // Update timestamp when slide changes to force cache busting
  useEffect(() => {
    setSlideChangeTimestamp(Date.now())
  }, [currentSlideIndex])

  const currentSlide = slides[currentSlideIndex]

  // Return early if no slide is available
  if (!currentSlide) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading slides...</p>
      </div>
    )
  }

  // Mock image search results (fallback)
  const mockImages = [
    "/business-presentation.png",
    "/modern-office-space.png",
    "/team-collaboration.png",
  ]

  // Use real suggested images if available, fallback to mock
  const suggestedImages =
    slideshowData?.suggestedReplacementImages && slideshowData.suggestedReplacementImages.length > 0
      ? slideshowData.suggestedReplacementImages
      : mockImages.map((url) => ({ url, photographer: undefined, photographerUrl: undefined, alt: undefined }))

  // Debug logging
  console.log("🖼️ Suggested Images Debug:", {
    hasSlideshowData: !!slideshowData,
    hasReplacementImages: !!slideshowData?.suggestedReplacementImages,
    replacementImagesCount: slideshowData?.suggestedReplacementImages?.length || 0,
    globalTerm: slideshowData?.globalSuggestedImageTerm,
    usingMockImages: !slideshowData?.suggestedReplacementImages || slideshowData.suggestedReplacementImages.length === 0,
  })

  const updateSlide = (updates: Partial<Slide>) => {
    setSlides((prev) => prev.map((slide, idx) => (idx === currentSlideIndex ? { ...slide, ...updates } : slide)))
  }

  const getCanvasCoordinates = (e: MouseEvent | React.MouseEvent): { x: number; y: number } => {
    if (!canvasRef.current) return { x: 0, y: 0 }

    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = 400 / rect.width
    const scaleY = 400 / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    return { x, y }
  }

  const handleTextMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("resize-handle")) {
      setIsResizing(true)
    } else {
      setIsDragging(true)
    }
    setDragStart(getCanvasCoordinates(e))
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const current = getCanvasCoordinates(e)
        const deltaX = current.x - dragStart.x
        const deltaY = current.y - dragStart.y

        updateSlide({
          textPosition: {
            x: currentSlide.textPosition.x + deltaX,
            y: currentSlide.textPosition.y + deltaY,
          },
        })
        setDragStart(current)
      } else if (isResizing) {
        const current = getCanvasCoordinates(e)
        const deltaX = current.x - dragStart.x
        const deltaY = current.y - dragStart.y

        updateSlide({
          textSize: {
            width: Math.max(100, currentSlide.textSize.width + deltaX),
            height: Math.max(25, currentSlide.textSize.height + deltaY),
          },
        })
        setDragStart(current)
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

  const handleReplaceImage = (
    imageUrl: string,
    metadata?: { photographer?: string; photographerUrl?: string; alt?: string }
  ) => {
    updateSlide({
      imageUrl,
      imageMetadata: metadata
        ? {
            url: imageUrl,
            photographer: metadata.photographer,
            photographerUrl: metadata.photographerUrl,
            alt: metadata.alt,
          }
        : undefined,
    })
    setImageSearchOpen(false)
  }

  const setTextPreset = (preset: "top" | "center" | "bottom") => {
    const positions = {
      top: { x: 25, y: 50 },
      center: { x: 25, y: 150 },
      bottom: { x: 25, y: 250 },
    }
    updateSlide({ textPosition: positions[preset] })
  }

  const handleExport = async () => {
    console.log('[handleExport] Export button clicked')
    console.log('[handleExport] canvasRef.current:', canvasRef.current)
    console.log('[handleExport] currentSlideIndex:', currentSlideIndex)
    console.log('[handleExport] currentSlide:', currentSlide)

    if (!canvasRef.current) {
      console.error('[handleExport] Canvas ref not available')
      return
    }

    console.log('[handleExport] Setting isExporting to true')
    setIsExporting(true)

    try {
      console.log('[handleExport] Calling exportSlideAsPNG...')
      await exportSlideAsPNG(canvasRef.current, {
        slideNumber: currentSlideIndex + 1,
        headline: currentSlide.headline,
        imageUrl: currentSlide.imageUrl,
      })
      console.log('[handleExport] Export completed successfully')
    } catch (error) {
      console.error('[handleExport] Export failed:', error)
      alert('Failed to export slide. Please try again.')
    } finally {
      console.log('[handleExport] Setting isExporting to false')
      setIsExporting(false)
    }
  }

  const handleExportAll = async () => {
    console.log('[handleExportAll] Bulk export button clicked')

    if (!canvasRef.current) {
      console.error('[handleExportAll] Canvas ref not available')
      return
    }

    setIsExportingAll(true)
    setExportProgress({ current: 0, total: slides.length })

    // Save current slide index to restore later
    const originalSlideIndex = currentSlideIndex

    try {
      // Export all slides as ZIP
      await exportAllSlidesAsZip(
        () => {
          if (!canvasRef.current) {
            throw new Error('Canvas ref not available during export')
          }
          return canvasRef.current
        },
        slides.map((slide, index) => ({
          slideNumber: index + 1,
          headline: slide.headline,
          imageUrl: slide.imageUrl,
        })),
        (progress) => {
          console.log('[handleExportAll] Progress:', progress)
          setExportProgress(progress)
        },
        async (slideIndex) => {
          const imgBefore = canvasRef.current?.querySelector('img')
          console.log('[DEBUG] BEFORE state change:')
          console.log('  - Current img.src:', imgBefore?.src.substring(0, 100))
          console.log('  - Expected imageUrl:', slides[slideIndex].imageUrl.substring(0, 100))

          // Force React to immediately flush this state update to the DOM
          flushSync(() => {
            setCurrentSlideIndex(slideIndex)
          })

          // Wait for browser to paint the new content
          await new Promise((resolve) => requestAnimationFrame(resolve))
          await new Promise((resolve) => requestAnimationFrame(resolve)) // Double RAF for layout

          const imgAfter = canvasRef.current?.querySelector('img')
          console.log('[DEBUG] AFTER state change:')
          console.log('  - New img.src:', imgAfter?.src.substring(0, 100))
          console.log('  - Match:', imgAfter?.src.includes(slides[slideIndex].imageUrl))
        }
      )

      console.log('[handleExportAll] Bulk export completed successfully')
      alert(`Successfully exported all ${slides.length} slides as ZIP file!`)
    } catch (error) {
      console.error('[handleExportAll] Bulk export failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Export failed: ${errorMessage}`)
    } finally {
      // Restore original slide
      setCurrentSlideIndex(originalSlideIndex)
      setIsExportingAll(false)
      setExportProgress({ current: 0, total: 0 })
    }
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
          {isExportingAll
            ? `Exporting slide ${exportProgress.current} of ${exportProgress.total}...`
            : `Slide ${currentSlideIndex + 1} of ${slides.length}`}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Preview
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={isExporting || isExportingAll}
          >
            {isExporting ? 'Exporting...' : 'Export Current →'}
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={handleExportAll}
            disabled={isExporting || isExportingAll}
          >
            {isExportingAll ? `Exporting ${exportProgress.current}/${exportProgress.total}...` : 'Export All as ZIP ↓'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 p-8 overflow-auto relative">
          {/* Zoom Slider & Grid Toggle - Sticky */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-3 bg-background/95 backdrop-blur-sm border border-border rounded-md px-3 py-1.5 shadow-md">
            <span className="text-xs font-medium whitespace-nowrap">Zoom: {zoom}%</span>
            <Slider
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
              min={25}
              max={200}
              step={5}
              className="w-24"
            />
            <div className="w-px h-4 bg-border" />
            <Button
              variant={showGrid ? "default" : "outline"}
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className="h-7 w-7 p-0"
              title={showGrid ? "Hide grid" : "Show grid"}
            >
              <Grid3x3 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div
            className="rounded-lg shadow-2xl overflow-hidden"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center'
            }}
          >
            <div
              ref={canvasRef}
              className="relative bg-white overflow-hidden"
              style={{
                width: '400px',
                height: '400px',
              }}
            >
            {/* Background Image */}
            <img
              key={`slide-${currentSlideIndex}-${slideChangeTimestamp}`}
              src={`${currentSlide.imageUrl || "/placeholder.svg"}${(currentSlide.imageUrl || "").includes('?') ? '&' : '?'}cb=${slideChangeTimestamp}`}
              alt="Slide background"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
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
            {showGrid && (
              <div
                data-exclude-from-export
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                  backgroundSize: "50px 50px",
                }}
              />
            )}

            {/* Draggable Text */}
            <div
              className="absolute cursor-move group"
              style={{
                left: `${currentSlide.textPosition.x}px`,
                top: `${currentSlide.textPosition.y}px`,
                width: `${currentSlide.textSize.width}px`,
                height: `${currentSlide.textSize.height}px`,
              }}
              onMouseDown={handleTextMouseDown}
            >
              {/* Dashed border (editing UI only) */}
              <div
                data-exclude-from-export
                className="absolute inset-0 border-2 border-dashed border-primary/50 group-hover:border-primary transition-colors pointer-events-none"
              />

              {/* Text content (included in export) */}
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  padding: `${currentSlide.padding}px`,
                }}
              >
                <p
                  className="w-full"
                  style={{
                    fontSize: `${currentSlide.fontSize}px`,
                    fontFamily: currentSlide.fontFamily,
                    color: currentSlide.textColor,
                    textAlign: currentSlide.textAlign,
                    lineHeight: 1.2,
                    WebkitTextStroke: currentSlide.textBorderWidth > 0
                      ? `${currentSlide.textBorderWidth}px ${currentSlide.textBorderColor}`
                      : 'none',
                    paintOrder: 'stroke fill',
                  }}
                >
                  {currentSlide.text}
                </p>
              </div>

              {/* Resize Handle */}
              <div data-exclude-from-export className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-tl cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
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
                  <Label>Font Size</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={currentSlide.fontSize}
                      onChange={(e) => updateSlide({ fontSize: Number(e.target.value) })}
                      min={16}
                      max={120}
                      step={2}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">px</span>
                  </div>
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
                  <Label>Text Border Width</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={currentSlide.textBorderWidth}
                      onChange={(e) => updateSlide({ textBorderWidth: Number(e.target.value) })}
                      min={0}
                      max={10}
                      step={1}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Text Border Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={currentSlide.textBorderColor}
                      onChange={(e) => updateSlide({ textBorderColor: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={currentSlide.textBorderColor}
                      onChange={(e) => updateSlide({ textBorderColor: e.target.value })}
                      className="flex-1"
                    />
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
                        {suggestedImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const imageUrl = typeof img === "string" ? img : img.url
                              const metadata =
                                typeof img === "string"
                                  ? undefined
                                  : {
                                      photographer: img.photographer,
                                      photographerUrl: img.photographerUrl,
                                      alt: img.alt,
                                    }
                              handleReplaceImage(imageUrl, metadata)
                            }}
                            className="relative aspect-video rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all"
                          >
                            <img
                              src={(typeof img === "string" ? img : img.url) || "/placeholder.svg"}
                              alt={typeof img === "string" ? `Result ${idx + 1}` : img.alt || `Result ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {typeof img !== "string" && img.photographer && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                                by {img.photographer}
                              </div>
                            )}
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
