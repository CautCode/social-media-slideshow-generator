import { searchPexelsPhotos } from "@/lib/apis/pexels"
import type { ImageMetadata, GenerateSlideshowRequest, LLMSlideContent } from "@/lib/types/slideshow"

/**
 * Fetch images for each slide from Pexels API
 * Returns array of image results matching slide order
 */
export async function fetchSlideImages(
  slides: LLMSlideContent[],
  formData: GenerateSlideshowRequest
): Promise<Array<{ imageUrl?: string; imageMetadata?: ImageMetadata }>> {
  // Early return if not using stock photos
  if (formData.imageOption !== "stock") {
    return slides.map(() => ({ imageUrl: undefined, imageMetadata: undefined }))
  }

  // Fetch images in parallel for all slides
  const imageResults = await Promise.all(
    slides.map(async (slide) => {
      try {
        // Use suggestedImageKeyword from slide (now always present)
        const query = slide.suggestedImageKeyword

        // Add image vibe to query if provided
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
      } catch (error) {
        console.error(`Error fetching image for slide ${index + 1}:`, error)
        return { imageUrl: undefined, imageMetadata: undefined }
      }
    })
  )

  return imageResults
}

/**
 * Fetch alternative/replacement images using the global suggested term
 * Returns array of 3 images or empty array on failure
 */
export async function fetchAlternativeImages(
  globalSuggestedImageTerm: string | undefined,
  imageVibe: string | undefined
): Promise<ImageMetadata[]> {
  // Early return if no global term
  if (!globalSuggestedImageTerm) {
    return []
  }

  try {
    // Build search query with optional image vibe
    const searchQuery = imageVibe
      ? `${globalSuggestedImageTerm} ${imageVibe}`
      : globalSuggestedImageTerm

    console.log("🔎 Fetching alternative images with query:", searchQuery)
    const photos = await searchPexelsPhotos(searchQuery, 3)

    const alternativeImages = photos.map((photo) => ({
      url: photo.url,
      photographer: photo.photographer,
      photographerUrl: photo.photographerUrl,
      alt: photo.alt,
    }))

    console.log("✅ Fetched", alternativeImages.length, "alternative images")
    return alternativeImages
  } catch (error) {
    console.error("Error fetching alternative images:", error)
    return [] // Non-critical failure, return empty array
  }
}
