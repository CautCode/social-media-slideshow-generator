/**
 * Pexels API Integration
 *
 * Provides stock photo search functionality using the Pexels API.
 * API Documentation: https://www.pexels.com/api/documentation/
 *
 * Rate Limits:
 * - Default: 200 requests/hour, 20,000 requests/month
 * - Can request unlimited if attribution provided
 *
 * Commercial Use:
 * - ✅ Fully allowed for commercial use
 * - ⚠️ Must show prominent link to Pexels and contributors in application
 */

// Pexels API response types
export interface PexelsPhoto {
  id: number
  width: number
  height: number
  url: string
  photographer: string
  photographer_url: string
  photographer_id: number
  avg_color: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
  liked: boolean
  alt: string
}

export interface PexelsSearchResponse {
  page: number
  per_page: number
  photos: PexelsPhoto[]
  total_results: number
  next_page?: string
}

export interface PexelsImageResult {
  url: string
  photographer: string
  photographerUrl: string
  alt: string
}

/**
 * Search for photos on Pexels
 *
 * @param query - Search query (e.g., "coffee morning", "business meeting")
 * @param perPage - Number of results to return (max 80)
 * @returns Array of photo results with URLs and attribution
 */
export async function searchPexelsPhotos(
  query: string,
  perPage: number = 1
): Promise<PexelsImageResult[]> {
  const apiKey = process.env.PEXELS_API_KEY

  if (!apiKey) {
    throw new Error("PEXELS_API_KEY is not set in environment variables")
  }

  try {
    const url = new URL("https://api.pexels.com/v1/search")
    url.searchParams.append("query", query)
    url.searchParams.append("per_page", Math.min(perPage, 80).toString())

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`)
    }

    const data: PexelsSearchResponse = await response.json()

    // Map to simplified result format
    return data.photos.map((photo) => ({
      url: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      alt: photo.alt || query,
    }))
  } catch (error) {
    console.error("Error fetching Pexels photos:", error)
    throw error
  }
}

/**
 * Get curated photos from Pexels
 *
 * Returns curated photos that are updated at least once per hour.
 * Useful for fallback when search doesn't return good results.
 *
 * @param perPage - Number of results to return (max 80)
 * @returns Array of photo results with URLs and attribution
 */
export async function getCuratedPexelsPhotos(
  perPage: number = 1
): Promise<PexelsImageResult[]> {
  const apiKey = process.env.PEXELS_API_KEY

  if (!apiKey) {
    throw new Error("PEXELS_API_KEY is not set in environment variables")
  }

  try {
    const url = new URL("https://api.pexels.com/v1/curated")
    url.searchParams.append("per_page", Math.min(perPage, 80).toString())

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`)
    }

    const data: PexelsSearchResponse = await response.json()

    // Map to simplified result format
    return data.photos.map((photo) => ({
      url: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      alt: photo.alt || "Curated photo",
    }))
  } catch (error) {
    console.error("Error fetching curated Pexels photos:", error)
    throw error
  }
}
