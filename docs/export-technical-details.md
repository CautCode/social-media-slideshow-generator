# Slideshow Export Technical Documentation

This document explains the complete technical flow of how slide content (images and text) goes from the preview canvas to an exported ZIP file, with special attention to the text border implementation.

## Table of Contents

1. [Overview](#overview)
2. [Canvas Structure](#canvas-structure)
3. [Text Border Implementation](#text-border-implementation)
4. [Single Slide Export](#single-slide-export)
5. [Bulk ZIP Export](#bulk-zip-export)
6. [Image Handling](#image-handling)
7. [Export Exclusions](#export-exclusions)

---

## Overview

The export system uses the `html-to-image` library to capture DOM elements as PNG blobs, then packages them into a ZIP file using `jszip`. The key insight is that **what you see in the preview is exactly what gets exported** - the system captures the actual rendered DOM, not a separate canvas rendering.

### Key Libraries

- **`html-to-image`**: Converts DOM elements to image blobs via `toBlob()`
- **`jszip`**: Creates ZIP archives client-side
- **React's `flushSync`**: Forces synchronous state updates during bulk export

---

## Canvas Structure

The preview canvas is a 400x400px div referenced by `canvasRef`:

```tsx
<div
  ref={canvasRef}
  className="relative bg-white overflow-hidden"
  style={{
    width: '400px',
    height: '400px',
  }}
>
```

### Layer Stack (bottom to top)

1. **Background Image** (`<img>`)
   - Displays `currentSlide.imageUrl`
   - Applies brightness/contrast filters
   - Has `crossOrigin="anonymous"` for CORS compliance

2. **Overlay** (`<div>`)
   - Semi-transparent black overlay
   - Controlled by `overlayOpacity` (0-80%)
   - `pointer-events-none` to allow interaction with layers below

3. **Grid Overlay** (optional, UI only)
   - Marked with `data-exclude-from-export`
   - Not included in exports

4. **Draggable Text Box**
   - Contains the actual text content
   - Includes dashed border (UI only, excluded from export)
   - Includes resize handle (UI only, excluded from export)

---

## Text Border Implementation

The text border (stroke/outline effect) is implemented using **multi-directional CSS `text-shadow`** to create a smooth outline effect without artifacts.

### Why Not `-webkit-text-stroke`?

We previously used `-webkit-text-stroke`, but it has fundamental issues:

1. **Glyph Path Tracing**: It traces the exact Bézier curves of font glyph outlines
2. **Artifact Creation**: Letters like D, F, L have sharp corners in their glyph construction, causing the stroke to extend beyond natural letter boundaries
3. **Centered Stroke**: The stroke is centered on the glyph edge with no control to change this
4. **Font-Specific Issues**: Variable fonts and certain fonts have overlapping glyph components that exacerbate artifacts

### Slide Data Structure

Each slide stores border properties:

```typescript
type Slide = {
  // ... other properties
  textBorderWidth: number     // Default: 5px
  textBorderColor: string     // Default: "#000000"
}
```

### CSS Implementation: 16-Direction Text Shadow

The text element applies the border using a helper function that generates 16 text shadows in a circular pattern:

```tsx
/**
 * Generate a text stroke effect using multiple text shadows in a circular pattern.
 * This avoids the jagged edges and artifacts of -webkit-text-stroke which traces
 * font glyph paths and creates sharp corners on letters like D, F, L.
 */
function generateTextStroke(width: number, color: string): string {
  if (width <= 0) return 'none'

  const shadows: string[] = []
  // 16 directions at 22.5° intervals for smooth coverage at 4-6px widths
  for (let angle = 0; angle < 360; angle += 22.5) {
    const radians = (angle * Math.PI) / 180
    const x = Math.round(Math.cos(radians) * width * 100) / 100
    const y = Math.round(Math.sin(radians) * width * 100) / 100
    shadows.push(`${x}px ${y}px 0 ${color}`)
  }
  return shadows.join(', ')
}
```

Applied to the text element:

```tsx
<p
  style={{
    fontSize: `${currentSlide.fontSize}px`,
    fontFamily: currentSlide.fontFamily,
    color: currentSlide.textColor,
    textAlign: currentSlide.textAlign,
    lineHeight: 1.2,
    textShadow: generateTextStroke(
      currentSlide.textBorderWidth,
      currentSlide.textBorderColor
    ),
  }}
>
  {currentSlide.text}
</p>
```

### How the 16-Direction Shadow Works

1. **Circular Distribution**: Shadows are placed at 16 angles (0°, 22.5°, 45°, 67.5°, ... 337.5°)
2. **Mathematical Positioning**: Uses `cos(angle) * width` and `sin(angle) * width` for each shadow offset
3. **No Blur**: All shadows have `0` blur radius for crisp edges
4. **Uniform Coverage**: 16 shadows at 22.5° intervals provide smooth coverage for 4-6px stroke widths

Example output for `generateTextStroke(5, '#000000')`:
```css
text-shadow:
  5px 0px 0 #000000,      /* 0° */
  4.62px 1.91px 0 #000000, /* 22.5° */
  3.54px 3.54px 0 #000000, /* 45° */
  1.91px 4.62px 0 #000000, /* 67.5° */
  0px 5px 0 #000000,       /* 90° */
  /* ... 11 more directions ... */
```

### Why This Approach Works

1. **No Glyph Tracing**: Shadows don't follow font paths - they offset mathematically
2. **Smooth Coverage**: 16 shadows at 22.5° intervals create a uniform stroke
3. **Export Compatible**: `text-shadow` works perfectly with `html-to-image`
4. **No Artifacts**: No sharp corners or protrusions on problematic letters (D, F, L)
5. **Cross-Browser**: `text-shadow` is supported in all modern browsers

---

## Single Slide Export

Triggered by the "Export Current" button.

### Flow: `handleExport()` → `exportSlideAsPNG()`

```
1. User clicks "Export Current"
         ↓
2. handleExport() in slideshow-editor.tsx
   - Gets canvasRef.current
   - Sets isExporting = true
         ↓
3. exportSlideAsPNG(element, metadata)
   - Waits for document.fonts.ready
   - Calls html-to-image toBlob()
         ↓
4. toBlob() configuration:
   {
     pixelRatio: 2,              // 800x800 output from 400x400 canvas
     backgroundColor: '#ffffff',
     cacheBust: true,
     fetchRequestInit: {
       mode: 'cors',
       credentials: 'omit'
     },
     filter: (node) => {
       // Exclude elements with data-exclude-from-export
       return !node.hasAttribute('data-exclude-from-export')
     }
   }
         ↓
5. Blob created → Object URL → Download triggered
         ↓
6. Cleanup: remove link, revoke URL
```

### Filename Generation

```typescript
function generateFilename(metadata: SlideMetadata): string {
  const slug = text
    .split('\n')[0]                    // First line only
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')       // Non-alphanumeric → hyphens
    .replace(/^-+|-+$/g, '')           // Trim hyphens
    .substring(0, 50)                   // Max 50 chars

  return `slide-${slideNumber}-${slug}.png`
}
```

Example: "Introducing Our Product!" → `slide-1-introducing-our-product.png`

---

## Bulk ZIP Export

Triggered by the "Export All as ZIP" button.

### Flow: `handleExportAll()` → `exportAllSlidesAsZip()`

This is more complex because it must cycle through each slide sequentially.

```
1. User clicks "Export All as ZIP"
         ↓
2. handleExportAll() in slideshow-editor.tsx
   - Saves originalSlideIndex
   - Sets isExportingAll = true
         ↓
3. exportAllSlidesAsZip() called with:
   - getSlideElement: () => canvasRef.current
   - slides: metadata array for all slides
   - onProgress: updates UI progress
   - onSlideChange: switches visible slide
         ↓
4. For each slide (sequential loop):
   │
   ├─→ onSlideChange(slideIndex)
   │   Uses flushSync() to force immediate React state update:
   │
   │   flushSync(() => {
   │     setCurrentSlideIndex(slideIndex)
   │   })
   │
   │   Then waits for 2 animation frames for browser paint
   │
   ├─→ Wait 500ms for DOM update
   │
   ├─→ waitForImageSrcToUpdate()
   │   Polls every 50ms (up to 10s timeout)
   │   Checks if img.src contains expected URL
   │
   ├─→ forceImageReload()
   │   Clears img.src → forces reflow → reassigns src
   │   Bypasses browser cache
   │
   ├─→ waitForImagesToLoad()
   │   Waits for all images to fire onload
   │   5s timeout per image
   │
   ├─→ Wait another 500ms for rendering to settle
   │
   ├─→ captureSlideAsBlob()
   │   Same toBlob() config as single export
   │
   └─→ zip.file(filename, blob)
         ↓
5. After all slides processed:
   - Generate ZIP with DEFLATE compression (level 6)
   - Create download link
   - Trigger download
         ↓
6. Restore originalSlideIndex
```

### Critical: `flushSync` Usage

React normally batches state updates asynchronously. During bulk export, we need the DOM to update **immediately** when switching slides:

```tsx
flushSync(() => {
  setCurrentSlideIndex(slideIndex)
})
```

Without `flushSync`, the export might capture the wrong slide because React hasn't processed the state update yet.

### Double `requestAnimationFrame`

```tsx
await new Promise((resolve) => requestAnimationFrame(resolve))
await new Promise((resolve) => requestAnimationFrame(resolve))
```

Two rAF calls ensure:
1. First rAF: Browser schedules repaint
2. Second rAF: Browser has completed layout

This is a common pattern to wait for the browser's paint cycle.

---

## Image Handling

### CORS Configuration

External images (from Pexels) require CORS handling:

```tsx
// In the DOM:
<img crossOrigin="anonymous" ... />

// In toBlob options:
fetchRequestInit: {
  mode: 'cors',
  credentials: 'omit'
}
```

### Cache Busting

Two mechanisms prevent stale images:

1. **URL parameter**: `?cb=${slideChangeTimestamp}`
   ```tsx
   src={`${currentSlide.imageUrl}${...}cb=${slideChangeTimestamp}`}
   ```

2. **Key prop**: Forces React to remount the img element
   ```tsx
   key={`slide-${currentSlideIndex}-${slideChangeTimestamp}`}
   ```

3. **`cacheBust: true`** in toBlob options

### Image Source Verification

During bulk export, the system verifies the image actually changed:

```typescript
async function waitForImageSrcToUpdate(
  element: HTMLElement,
  expectedImageUrl: string,
  timeout: number = 10000
): Promise<void> {
  while (Date.now() - startTime < timeout) {
    const img = element.querySelector('img')
    if (img?.src.includes(expectedImageUrl)) {
      return // Image source verified
    }
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}
```

---

## Export Exclusions

Elements marked with `data-exclude-from-export` are filtered out:

```tsx
// Grid overlay (UI helper)
<div data-exclude-from-export className="absolute inset-0 pointer-events-none" ... />

// Text box dashed border (editing UI)
<div data-exclude-from-export className="absolute inset-0 border-2 border-dashed ..." />

// Resize handle
<div data-exclude-from-export className="resize-handle ..." />
```

The filter function in `toBlob`:

```typescript
filter: (node) => {
  if (node instanceof HTMLElement) {
    return !node.hasAttribute('data-exclude-from-export')
  }
  return true // Include non-HTML nodes (text nodes, etc.)
}
```

---

## Output Specifications

| Property | Value |
|----------|-------|
| Output dimensions | 800x800 pixels (2x scale) |
| Format | PNG |
| Background | White (#ffffff) |
| ZIP compression | DEFLATE, level 6 |
| ZIP filename | `slideshow-export-YYYY-MM-DD.zip` |

---

## Summary

The export system is elegantly simple: it captures exactly what the browser renders. The text border works using 16-direction `text-shadow` to create smooth outlines without the jagged artifacts of `-webkit-text-stroke`. This approach works because `text-shadow` offsets mathematically rather than tracing font glyph paths, and `html-to-image` preserves this rendering perfectly. The complexity lies in the bulk export synchronization - ensuring React state updates, DOM changes, and image loading all complete before capture.
