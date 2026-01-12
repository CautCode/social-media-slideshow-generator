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

    return data.photos.map((photo) => ({
      url: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      alt: photo.alt || query,
    }))
  } catch (error) {
    throw error
  }
}

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

    return data.photos.map((photo) => ({
      url: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      alt: photo.alt || "Curated photo",
    }))
  } catch (error) {
    throw error
  }
}
