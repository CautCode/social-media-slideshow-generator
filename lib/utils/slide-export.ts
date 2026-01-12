import { toBlob } from 'html-to-image'

interface SlideMetadata {
  slideNumber: number
  text: string
  imageUrl?: string
}

interface ExportProgress {
  current: number
  total: number
}

function generateFilename(metadata: SlideMetadata): string {
  const { slideNumber, text } = metadata

  const firstLine = text.split('\n')[0]
  const slug = firstLine
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)

  const filename = slug ? `slide-${slideNumber}-${slug}.png` : `slide-${slideNumber}.png`
  console.log('[Export] Generated filename:', filename)
  return filename
}

export async function exportSlideAsPNG(
  element: HTMLElement,
  metadata: SlideMetadata
): Promise<void> {
  console.log('[Export] Starting export process...')
  console.log('[Export] Element:', element)
  console.log('[Export] Metadata:', metadata)

  console.log('[Export] Waiting for fonts to load...')
  await document.fonts.ready
  console.log('[Export] Fonts loaded')

  try {
    console.log('[Export] Capturing element with html-to-image...')
    const blob = await toBlob(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
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

    console.log('[Export] Blob created, size:', blob.size, 'bytes')

    const url = URL.createObjectURL(blob)
    const filename = generateFilename(metadata)
    console.log('[Export] Creating download link with filename:', filename)

    const link = document.createElement('a')
    link.href = url
    link.download = filename

    console.log('[Export] Triggering download...')
    document.body.appendChild(link)
    link.click()
    console.log('[Export] Download triggered')

    console.log('[Export] Cleaning up...')
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log('[Export] Export completed successfully!')
  } catch (error) {
    console.error('[Export] Error during export:', error)
    throw error
  }
}

async function captureSlideAsBlob(
  element: HTMLElement,
  metadata: SlideMetadata
): Promise<{ blob: Blob; filename: string }> {
  console.log('[Export] Capturing slide', metadata.slideNumber)

  await document.fonts.ready

  const blob = await toBlob(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
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

async function waitForImageSrcToUpdate(
  element: HTMLElement,
  expectedImageUrl: string,
  timeout: number = 10000
): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const img = element.querySelector('img')

    if (img) {
      const srcIncludesExpected = img.src.includes(encodeURIComponent(expectedImageUrl)) ||
                                   img.src.includes(expectedImageUrl)

      if (srcIncludesExpected) {
        console.log('[Export] Image src verified:', img.src.substring(0, 100))
        return
      }
    }

    await new Promise(resolve => setTimeout(resolve, 50))
  }

  console.warn('[Export] Timeout waiting for image src update, continuing anyway')
}

async function forceImageReload(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img')

  images.forEach((img) => {
    const currentSrc = img.src
    img.src = ''
    void img.offsetWidth
    img.src = currentSrc
  })

  await new Promise(resolve => setTimeout(resolve, 100))
}

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
          resolve()
        }

        setTimeout(() => {
          console.warn('[Export] Image load timeout (continuing anyway):', img.src.substring(0, 100))
          resolve()
        }, 5000)
      })
    })
  )

  console.log('[Export] All images loaded')
}

export async function exportAllSlidesAsZip(
  getSlideElement: () => HTMLElement,
  slides: SlideMetadata[],
  onProgress?: (progress: ExportProgress) => void,
  onSlideChange?: (slideIndex: number) => Promise<void>
): Promise<void> {
  console.log('[Export] Starting bulk export of', slides.length, 'slides')

  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  const errors: Array<{ slideNumber: number; error: Error }> = []

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]

    try {
      console.log('[Export] Processing slide', slide.slideNumber)

      if (onSlideChange) {
        await onSlideChange(i)
      }

      if (onProgress) {
        onProgress({ current: i + 1, total: slides.length })
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      const element = getSlideElement()

      await waitForImageSrcToUpdate(element, slide.imageUrl)

      await forceImageReload(element)

      await waitForImagesToLoad(element)

      await new Promise((resolve) => setTimeout(resolve, 500))

      const { blob, filename } = await captureSlideAsBlob(element, slide)

      zip.file(filename, blob)
      console.log('[Export] Added to ZIP:', filename)
    } catch (error) {
      console.error('[Export] Failed to export slide', slide.slideNumber, error)
      errors.push({ slideNumber: slide.slideNumber, error: error as Error })
    }
  }

  const successCount = slides.length - errors.length
  if (successCount === 0) {
    throw new Error('Failed to export any slides')
  }

  if (errors.length > 0) {
    console.warn('[Export] Failed to export', errors.length, 'slides:', errors)
  }

  console.log('[Export] Generating ZIP file...')
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  console.log('[Export] ZIP file generated, size:', zipBlob.size, 'bytes')

  const url = URL.createObjectURL(zipBlob)
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `slideshow-export-${timestamp}.zip`

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  console.log('[Export] Bulk export completed!', successCount, 'of', slides.length, 'slides')

  if (errors.length > 0) {
    const errorMessage = `${successCount} slides exported successfully, but ${errors.length} failed: ${errors.map((e) => `slide ${e.slideNumber}`).join(', ')}`
    throw new Error(errorMessage)
  }
}
