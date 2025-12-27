import { toBlob } from 'html-to-image'

interface SlideMetadata {
  slideNumber: number
  headline: string
  imageUrl?: string
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
 * Replace external image URLs with proxied versions
 * to avoid CORS issues during canvas capture
 */
async function proxyExternalImages(element: HTMLElement): Promise<() => void> {
  const images = element.querySelectorAll('img')
  console.log('[Export] Found images in element:', images.length)
  const originalSrcs: Map<HTMLImageElement, string> = new Map()

  // Replace image sources with proxied URLs
  images.forEach((img) => {
    const src = img.src
    console.log('[Export] Checking image src:', src)

    // Only proxy external URLs (Pexels images)
    if (src && (src.includes('pexels.com') || src.includes('images.pexels.com'))) {
      console.log('[Export] Proxying Pexels image:', src)
      originalSrcs.set(img, src)
      img.src = `/api/proxy-image?url=${encodeURIComponent(src)}`
    } else {
      console.log('[Export] Not proxying (local or non-Pexels image)')
    }
  })

  console.log('[Export] Waiting for', originalSrcs.size, 'proxied images to load...')

  // Wait for all proxied images to load
  await Promise.all(
    Array.from(originalSrcs.keys()).map((img) => {
      if (img.complete) {
        console.log('[Export] Image already loaded:', img.src)
        return Promise.resolve()
      }

      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          console.log('[Export] Image loaded successfully:', img.src)
          resolve()
        }
        img.onerror = () => {
          console.error('[Export] Image failed to load:', img.src)
          reject(new Error(`Failed to load image: ${img.src}`))
        }

        // Timeout after 10 seconds
        setTimeout(() => {
          console.error('[Export] Image load timeout:', img.src)
          reject(new Error('Image load timeout'))
        }, 10000)
      })
    })
  )

  console.log('[Export] All images loaded successfully')

  // Return cleanup function to restore original URLs
  return () => {
    console.log('[Export] Restoring original image URLs')
    originalSrcs.forEach((originalSrc, img) => {
      img.src = originalSrc
    })
  }
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

  // Proxy external images to avoid CORS
  console.log('[Export] Proxying external images...')
  const restoreImages = await proxyExternalImages(element)

  try {
    // Capture element as blob - DIRECT CONVERSION!
    console.log('[Export] Capturing element with html-to-image...')
    const blob = await toBlob(element, {
      pixelRatio: 2, // 2x scale: 400px canvas -> 800px export
      backgroundColor: '#ffffff',
      cacheBust: true, // Helps with image loading
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
  } finally {
    // Restore original image URLs
    restoreImages()
  }
}
