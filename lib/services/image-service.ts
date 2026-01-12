import { searchPexelsPhotos } from "@/lib/apis/pexels"
import type { ImageMetadata, GenerateSlideshowRequest, LLMSlideContent } from "@/lib/types/slideshow"

export async function fetchSlideImages(
  slides: LLMSlideContent[],
  formData: GenerateSlideshowRequest
): Promise<Array<{ imageUrl?: string; imageMetadata?: ImageMetadata }>> {
  if (formData.imageOption !== "stock") {
    return slides.map(() => ({ imageUrl: undefined, imageMetadata: undefined }))
  }

  const imageResults = await Promise.all(
    slides.map(async (slide) => {
      try {
        const query = slide.suggestedImageKeyword

        const searchQuery = formData.imageVibe ? `${query} ${formData.imageVibe}` : query

        const photos = await searchPexelsPhotos(searchQuery, 1)

        if (photos.length > 0) {
          return {
            imageUrl: photos[0].url,
            imageMetadata: {
              url: photos[0].url,
              photographer: photos[0].photographer,
              photographerUrl: photos[0].photographerUrl,
              alt: photos[0].alt,
            },
          }
        }

        return { imageUrl: undefined, imageMetadata: undefined }
      } catch {
        return { imageUrl: undefined, imageMetadata: undefined }
      }
    })
  )

  return imageResults
}

export async function fetchAlternativeImages(
  globalSuggestedImageTerm: string | undefined,
  imageVibe: string | undefined
): Promise<ImageMetadata[]> {
  if (!globalSuggestedImageTerm) {
    return []
  }

  try {
    const searchQuery = imageVibe
      ? `${globalSuggestedImageTerm} ${imageVibe}`
      : globalSuggestedImageTerm

    const photos = await searchPexelsPhotos(searchQuery, 3)

    return photos.map((photo) => ({
      url: photo.url,
      photographer: photo.photographer,
      photographerUrl: photo.photographerUrl,
      alt: photo.alt,
    }))
  } catch {
    return []
  }
}
