import { toBlob } from 'html-to-image'

interface SlideMetadata {
  slideNumber: number
  headline: string
  imageUrl?: string
}

interface ExportProgress {
  current: number
  total: number
}

/**
 * Generate filename from slide metadata
 * Format: slide-{number}-{slug}.png
 * Example: slide-1-introducing-our-product.png
 */
function generateFilename(metadata: SlideMetadata): string {
  const { slideNumber, headline } = metadata

  // Create slug from headline
  const slug = headline
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
    .substring(0, 50) // Limit length

  const filename = slug ? `slide-${slideNumber}-${slug}.png` : `slide-${slideNumber}.png`
  console.log('[Export] Generated filename:', filename)
  return filename
}


/**
 * Export slide element as PNG image
 * Downloads to user's device with descriptive filename
 */
export async function exportSlideAsPNG(
  element: HTMLElement,
  metadata: SlideMetadata
): Promise<void> {
  console.log('[Export] Starting export process...')
  console.log('[Export] Element:', element)
  console.log('[Export] Metadata:', metadata)

  // Wait for fonts to load
  console.log('[Export] Waiting for fonts to load...')
  await document.fonts.ready
  console.log('[Export] Fonts loaded')

  try {
    // Capture element as blob - DIRECT CONVERSION!
    console.log('[Export] Capturing element with html-to-image...')
    const blob = await toBlob(element, {
      pixelRatio: 2, // 2x scale: 400px canvas -> 800px export
      backgroundColor: '#ffffff',
      cacheBust: true, // Helps with image loading
      // Add CORS settings to allow cross-origin images (Pexels)
      fetchRequestInit: {
        mode: 'cors',
        credentials: 'omit',
      },
      // Filter replaces ignoreElements
      filter: (node) => {
        if (node instanceof HTMLElement) {
          return !node.hasAttribute('data-exclude-from-export')
        }
        return true // Include non-HTML nodes
      },
      // NO onclone NEEDED - OKLCH works automatically!
    })

    // Null check (html-to-image returns null on failure)
    if (!blob) {
      throw new Error('Failed to create blob')
    }

    console.log('[Export] Blob created, size:', blob.size, 'bytes')

    // Create download link
    const url = URL.createObjectURL(blob)
    const filename = generateFilename(metadata)
    console.log('[Export] Creating download link with filename:', filename)

    const link = document.createElement('a')
    link.href = url
    link.download = filename

    // Trigger download
    console.log('[Export] Triggering download...')
    document.body.appendChild(link)
    link.click()
    console.log('[Export] Download triggered')

    // Cleanup
    console.log('[Export] Cleaning up...')
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log('[Export] Export completed successfully!')
  } catch (error) {
    console.error('[Export] Error during export:', error)
    throw error
  }
}

/**
 * Capture a single slide as a blob without downloading
 * Used internally for bulk export
 */
async function captureSlideAsBlob(
  element: HTMLElement,
  metadata: SlideMetadata
): Promise<{ blob: Blob; filename: string }> {
  console.log('[Export] Capturing slide', metadata.slideNumber)

  // Wait for fonts to load
  await document.fonts.ready

  // Capture element as blob - html-to-image will use CORS mode
  const blob = await toBlob(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
    // Add CORS settings to allow cross-origin images (Pexels)
    fetchRequestInit: {
      mode: 'cors',
      credentials: 'omit',
    },
    filter: (node) => {
      if (node instanceof HTMLElement) {
        return !node.hasAttribute('data-exclude-from-export')
      }
      return true
    },
  })

  if (!blob) {
    throw new Error('Failed to create blob')
  }

  const filename = generateFilename(metadata)
  console.log('[Export] Captured slide:', filename, 'size:', blob.size, 'bytes')

  return { blob, filename }
}

/**
 * Wait until the image element's src attribute matches the expected URL
 */
async function waitForImageSrcToUpdate(
  element: HTMLElement,
  expectedImageUrl: string,
  timeout: number = 10000
): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const img = element.querySelector('img')

    if (img) {
      // Check if src includes the expected URL (accounting for cache busting)
      const srcIncludesExpected = img.src.includes(encodeURIComponent(expectedImageUrl)) ||
                                   img.src.includes(expectedImageUrl)

      if (srcIncludesExpected) {
        console.log('[Export] Image src verified:', img.src.substring(0, 100))
        return
      }
    }

    // Poll every 50ms
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  console.warn('[Export] Timeout waiting for image src update, continuing anyway')
}

/**
 * Force browser to reload image by clearing and reassigning src
 */
async function forceImageReload(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img')

  images.forEach((img) => {
    const currentSrc = img.src
    // Clear src to force browser to reload
    img.src = ''
    // Force reflow
    void img.offsetWidth
    // Reassign src
    img.src = currentSrc
  })

  // Wait for reload to start
  await new Promise(resolve => setTimeout(resolve, 100))
}

/**
 * Wait for all images in an element to load
 */
async function waitForImagesToLoad(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img')
  console.log('[Export] Waiting for', images.length, 'images to load...')

  await Promise.all(
    Array.from(images).map((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        console.log('[Export] Image already loaded:', img.src.substring(0, 100))
        return Promise.resolve()
      }

      return new Promise<void>((resolve) => {
        img.onload = () => {
          console.log('[Export] Image loaded:', img.src.substring(0, 100))
          resolve()
        }
        img.onerror = () => {
          console.warn('[Export] Image failed to load (continuing anyway):', img.src.substring(0, 100))
          resolve() // Don't reject, just continue
        }

        // Timeout after 5 seconds
        setTimeout(() => {
          console.warn('[Export] Image load timeout (continuing anyway):', img.src.substring(0, 100))
          resolve()
        }, 5000)
      })
    })
  )

  console.log('[Export] All images loaded')
}

/**
 * Export all slides as PNG files in a ZIP archive
 * Downloads a single ZIP file containing all slides
 */
export async function exportAllSlidesAsZip(
  getSlideElement: () => HTMLElement,
  slides: SlideMetadata[],
  onProgress?: (progress: ExportProgress) => void,
  onSlideChange?: (slideIndex: number) => Promise<void>
): Promise<void> {
  console.log('[Export] Starting bulk export of', slides.length, 'slides')

  // Dynamic import to ensure JSZip is only loaded on client-side
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  const errors: Array<{ slideNumber: number; error: Error }> = []

  // Export each slide sequentially
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]

    try {
      console.log('[Export] Processing slide', slide.slideNumber)

      // Switch to this slide and wait for the callback
      if (onSlideChange) {
        await onSlideChange(i)
      }

      // Update progress
      if (onProgress) {
        onProgress({ current: i + 1, total: slides.length })
      }

      // Wait for DOM to update (increased from 200ms to 500ms)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Get the current slide element from the DOM
      const element = getSlideElement()

      // Wait for img.src to actually change to the expected URL
      await waitForImageSrcToUpdate(element, slide.imageUrl)

      // Force image reload to bypass browser cache
      await forceImageReload(element)

      // Wait for all images in the slide to load
      await waitForImagesToLoad(element)

      // Wait for rendering to settle (increased from 300ms to 500ms)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Capture slide as blob
      const { blob, filename } = await captureSlideAsBlob(element, slide)

      // Add to ZIP
      zip.file(filename, blob)
      console.log('[Export] Added to ZIP:', filename)
    } catch (error) {
      console.error('[Export] Failed to export slide', slide.slideNumber, error)
      errors.push({ slideNumber: slide.slideNumber, error: error as Error })
      // Continue with remaining slides
    }
  }

  // Check if we have any successful exports
  const successCount = slides.length - errors.length
  if (successCount === 0) {
    throw new Error('Failed to export any slides')
  }

  // Log any errors
  if (errors.length > 0) {
    console.warn('[Export] Failed to export', errors.length, 'slides:', errors)
  }

  // Generate ZIP file
  console.log('[Export] Generating ZIP file...')
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  console.log('[Export] ZIP file generated, size:', zipBlob.size, 'bytes')

  // Download ZIP file
  const url = URL.createObjectURL(zipBlob)
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const filename = `slideshow-export-${timestamp}.zip`

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  console.log('[Export] Bulk export completed!', successCount, 'of', slides.length, 'slides')

  // Throw error if some slides failed (after successful download)
  if (errors.length > 0) {
    const errorMessage = `${successCount} slides exported successfully, but ${errors.length} failed: ${errors.map((e) => `slide ${e.slideNumber}`).join(', ')}`
    throw new Error(errorMessage)
  }
}
