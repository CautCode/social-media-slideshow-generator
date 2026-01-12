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

  return slug ? `slide-${slideNumber}-${slug}.png` : `slide-${slideNumber}.png`
}

export async function exportSlideAsPNG(
  element: HTMLElement,
  metadata: SlideMetadata
): Promise<void> {
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

  const url = URL.createObjectURL(blob)
  const filename = generateFilename(metadata)

  const link = document.createElement('a')
  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function captureSlideAsBlob(
  element: HTMLElement,
  metadata: SlideMetadata
): Promise<{ blob: Blob; filename: string }> {
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
        return
      }
    }

    await new Promise(resolve => setTimeout(resolve, 50))
  }
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

  await Promise.all(
    Array.from(images).map((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        return Promise.resolve()
      }

      return new Promise<void>((resolve) => {
        img.onload = () => {
          resolve()
        }
        img.onerror = () => {
          resolve()
        }

        setTimeout(() => {
          resolve()
        }, 5000)
      })
    })
  )
}

export async function exportAllSlidesAsZip(
  getSlideElement: () => HTMLElement,
  slides: SlideMetadata[],
  onProgress?: (progress: ExportProgress) => void,
  onSlideChange?: (slideIndex: number) => Promise<void>
): Promise<void> {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  const errors: Array<{ slideNumber: number; error: Error }> = []

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]

    try {
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
    } catch (error) {
      errors.push({ slideNumber: slide.slideNumber, error: error as Error })
    }
  }

  const successCount = slides.length - errors.length
  if (successCount === 0) {
    throw new Error('Failed to export any slides')
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

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

  if (errors.length > 0) {
    const errorMessage = `${successCount} slides exported successfully, but ${errors.length} failed: ${errors.map((e) => `slide ${e.slideNumber}`).join(', ')}`
    throw new Error(errorMessage)
  }
}
