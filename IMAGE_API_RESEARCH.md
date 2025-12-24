# Image API Integration Research & Recommendations

## Table of Contents
1. [Pinterest API Analysis](#pinterest-api---not-recommended-)
2. [Stock Photo APIs](#stock-photo-apis---recommended-)
3. [Image Generation APIs](#image-generation-apis---recommended-)
4. [Integration Roadmap](#integration-roadmap)
5. [Cost Analysis](#cost-analysis)
6. [Recommendations](#recommendations)

---

## Pinterest API - NOT RECOMMENDED ❌

### Why Pinterest Won't Work

1. **No Search Endpoint**
   - The official Pinterest API v5 does NOT provide a public search endpoint for discovering pins by keyword
   - Historical v3 API had search functionality, but v3 is now deprecated
   - This is a critical limitation for a slideshow generation tool that needs to find images programmatically

2. **Copyright Issues**
   - Pinterest does not grant commercial usage rights to images on the platform
   - Each pin's image is owned by its original creator, not Pinterest
   - To use any image commercially, you must obtain permission from the original copyright holder
   - Pinterest has no information about who owns copyright to specific pins

3. **Terms of Service Violations**
   - Scraping, collecting, searching, or copying content without express prior permission is prohibited
   - Automated image downloading violates Pinterest's Terms of Service
   - Third-party alternatives exist (RapidAPI, Apify) but may also violate ToS

4. **No Commercial Licensing Mechanism**
   - Pinterest provides no framework for commercial image licensing
   - Cannot legally use downloaded images in a commercial SaaS product

### Pinterest API Details (For Reference Only)

**Authentication**: OAuth 2.0
- Browser-based authorization with redirect to obtain tokens
- Continuous refresh tokens with 60-day expiration

**Rate Limits**:
- 100 calls per second per user per app (universal limit)
- Some sources indicate 1,000 requests per hour for certain use cases
- Cannot be increased

**Primary Use Cases** (Not applicable to our needs):
- Content management (creating/managing pins and boards)
- Analytics and performance metrics
- Ad campaign management
- User account integration

### Conclusion

**Do NOT use Pinterest API** for this slideshow generation application due to:
- Lack of search functionality
- Legal/copyright concerns
- Terms of Service violations
- No commercial licensing path

---

## Stock Photo APIs - RECOMMENDED ✅

All options below are **free for commercial use** and legally safe for SaaS applications.

### 1. Pexels API (PRIMARY RECOMMENDATION)

**Overview**: Professional-quality stock photos and videos, owned by Canva.

**Pricing**:
- Completely FREE for commercial use
- No hidden costs

**Rate Limits**:
- Default: 200 requests/hour, 20,000 requests/month
- Can request unlimited requests for free if attribution is provided
- Requests can be upgraded upon request

**Authentication**:
- Simple API key authentication
- Pass key via `Authorization` header
- Instantly available upon account creation

**Search Capabilities**:
- Photo search endpoint
- Curated photos (real-time updates - at least one per hour)
- Video search endpoint
- Collections support
- Maximum 80 results per request
- Full pagination support

**Commercial Use & Licensing**:
- ✅ Fully allowed for commercial use
- ✅ No attribution required for images themselves
- ⚠️ Must show prominent link to Pexels and contributors in application
- ❌ Cannot replicate core Pexels functionality

**Image Quality**:
- Professional, curated content
- High-resolution images suitable for social media
- Includes both photos and videos

**Library Size**: 3.2M+ photos and videos

**Integration Difficulty**: ⭐ **Easy**
- RESTful API
- Simple JSON responses
- Direct image URLs
- Well-documented

**API Example**:
```bash
curl -H "Authorization: YOUR_API_KEY" \
  "https://api.pexels.com/v1/search?query=coffee+morning&per_page=15"
```

**Response Format**:
```json
{
  "photos": [
    {
      "id": 1234,
      "width": 3000,
      "height": 2000,
      "url": "https://www.pexels.com/photo/...",
      "photographer": "John Doe",
      "src": {
        "original": "https://images.pexels.com/...",
        "large": "https://images.pexels.com/...",
        "medium": "https://images.pexels.com/...",
        "small": "https://images.pexels.com/..."
      }
    }
  ]
}
```

**Best For**:
- Professional quality images
- Projects needing both photos and videos
- SaaS products requiring reliable, legal image sources
- Applications with moderate request volumes

---

### 2. Unsplash API (STRONG ALTERNATIVE)

**Overview**: Community-driven platform with the largest variety of high-quality images.

**Pricing**:
- Completely FREE for commercial use
- No costs

**Rate Limits**:
- Demo mode: 50 requests/hour (for testing)
- Production mode: 5,000 requests/hour (after approval)
- Image file requests don't count against limits

**Authentication**:
- Public authentication via HTTP header or query parameter
- Access key: `Authorization: Client-ID YOUR_ACCESS_KEY`
- Optional OAuth for user-specific features

**Search Capabilities**:
- `GET /search/photos` - Main search endpoint
- `GET /search/collections` - Browse curated collections
- `GET /search/users` - Find photographers
- Supports: query, pagination, sorting, color filtering, orientation
- Returns abbreviated objects by default for performance

**Commercial Use & Licensing**:
- ✅ Fully allowed for commercial use
- ⚠️ Attribution to Unsplash required
- ✅ Used by major brands: Trello, Mailchimp, Google Slides, Zoom
- ⚠️ Must track downloads via dedicated endpoint
- ✅ Must follow content safety guidelines

**Image Quality**:
- High-quality community-contributed content
- Artistic and diverse perspectives
- Regular updates from active community

**Library Size**: 3M+ high-quality photos

**Integration Difficulty**: ⭐ **Easy**
- RESTful API
- Excellent documentation
- Simple authentication
- Well-maintained SDKs available

**API Example**:
```bash
curl -H "Authorization: Client-ID YOUR_ACCESS_KEY" \
  "https://api.unsplash.com/search/photos?query=coffee&per_page=20"
```

**Response Format**:
```json
{
  "results": [
    {
      "id": "abc123",
      "width": 4000,
      "height": 3000,
      "urls": {
        "raw": "https://images.unsplash.com/...",
        "full": "https://images.unsplash.com/...",
        "regular": "https://images.unsplash.com/...",
        "small": "https://images.unsplash.com/...",
        "thumb": "https://images.unsplash.com/..."
      },
      "user": {
        "name": "Jane Smith",
        "username": "janesmith"
      }
    }
  ]
}
```

**Best For**:
- Projects needing the widest variety of content
- High-volume applications (5,000 req/hour)
- Established, production-ready API
- Applications where attribution is acceptable

---

### 3. Pixabay API (BUDGET OPTION)

**Overview**: Large library with images, videos, vectors, and music.

**Pricing**:
- Completely FREE
- No paid tier available

**Rate Limits**:
- 100 requests per 60 seconds per API key
- Caching required: Results must be cached for 24 hours
- No systematic mass downloads allowed

**Authentication**:
- API key required
- Obtain from API documentation portal after login
- Pass as query parameter

**Search Capabilities**:
- Images: `GET https://pixabay.com/api/`
- Videos: `GET https://pixabay.com/api/videos/`
- Query, language, filtering, pagination, and ordering parameters
- Extensive filtering options

**Commercial Use & Licensing**:
- ✅ Fully allowed under Pixabay Content License
- ✅ No attribution required for the content
- ⚠️ Attribution to Pixabay API usage requested when displaying results
- ⚠️ Must download images to your own servers (no hotlinking)
- ✅ Videos may be embedded directly

**Image Quality**:
- Good quality, variable consistency
- Mix of professional and amateur content

**Library Size**: 5.5M+ images, videos, vectors, and music

**Integration Difficulty**: ⭐⭐ **Medium**
- Must download and host images yourself
- Additional storage costs
- More complex implementation

**API Example**:
```bash
curl "https://pixabay.com/api/?key=YOUR_API_KEY&q=coffee+morning&image_type=photo"
```

**Response Format**:
```json
{
  "hits": [
    {
      "id": 12345,
      "pageURL": "https://pixabay.com/...",
      "type": "photo",
      "tags": "coffee, morning, cup",
      "previewURL": "https://cdn.pixabay.com/...",
      "webformatURL": "https://pixabay.com/...",
      "largeImageURL": "https://pixabay.com/..."
    }
  ]
}
```

**Best For**:
- Projects with strict budget requirements
- Applications where no attribution is desired
- Multi-media needs (images + videos + vectors)

---

### Stock Photo API Comparison Table

| Feature | Pexels | Unsplash | Pixabay |
|---------|--------|----------|---------|
| **Cost** | FREE | FREE | FREE |
| **Commercial Use** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Rate Limit (free)** | 200/hr (upgradeable) | 50-5000/hr | 100/60sec |
| **Attribution Required** | Link to Pexels | Unsplash credit | No |
| **Videos Available** | ✅ Yes | ❌ No | ✅ Yes |
| **Hotlinking Allowed** | ✅ Yes | ✅ Yes | ❌ No |
| **Image Hosting** | Pexels CDN | Unsplash CDN | Self-hosted |
| **Integration Difficulty** | ⭐ Easy | ⭐ Easy | ⭐⭐ Medium |
| **Image Quality** | Professional | High-quality | Good |
| **Library Size** | 3.2M+ | 3M+ | 5.5M+ |
| **Best For** | Professional SaaS | High-volume apps | No attribution needed |

---

## Image Generation APIs - RECOMMENDED ✅

### 1. DALL-E 3 API (PRIMARY RECOMMENDATION)

**Overview**: OpenAI's latest image generation model with excellent quality and prompt adherence.

**Pricing**:
- Standard 1024×1024: **$0.04 per image**
- HD 1024×1024: **$0.12 per image**
- HD 1024×1536 (portrait): **$0.08 per image**
- HD 1536×1024 (landscape): **$0.08 per image**
- New users: $5 free credits

**Generation Time**:
- **15-30 seconds** ✅ (meets <30s requirement)
- API direct access is faster than web UI

**Commercial Rights**:
- ✅ Full commercial usage rights for API users
- ✅ You own the images you generate
- ✅ No restrictions on commercial use

**Quality**:
- Excellent overall quality
- Strong prompt adherence
- Good at text rendering (better than SD)
- Consistent style and composition

**Authentication**:
- Uses same OpenAI API key as GPT models
- Bearer token authentication
- Simple REST API

**Integration Difficulty**: ⭐ **Easy**
- Uses existing OpenAI integration
- Same API you're already using for text generation
- Well-documented
- Official SDKs available

**API Example**:
```bash
curl https://api.openai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "dall-e-3",
    "prompt": "A vibrant sunset beach scene with golden hour lighting",
    "n": 1,
    "size": "1024x1024",
    "quality": "standard"
  }'
```

**Response Format**:
```json
{
  "created": 1234567890,
  "data": [
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "revised_prompt": "..."
    }
  ]
}
```

**Supported Sizes**:
- 1024×1024 (square)
- 1024×1792 (portrait)
- 1792×1024 (landscape)

**Best For**:
- Professional quality requirements
- Projects with existing OpenAI integration
- Clear commercial licensing needs
- Reliable, production-ready service

**Limitations**:
- More expensive than some alternatives
- Slower than fastest models (FLUX Schnell)
- Content policy restrictions apply

---

### 2. Google Imagen 4 (STRONG ALTERNATIVE)

**Overview**: Google's latest image generation model with excellent quality and text rendering.

**Pricing**:
- Imagen 4: ~**$0.04 per image**
- Imagen 4 Ultra: ~**$0.06 per image**
- Token-based: 1024×1024 = 1290 tokens (~$0.039)
- Token-based: 2048×2048 = 1120 tokens (~$0.134)

**Free Tier**:
- **500 images/day** (Gemini 2.5 Flash Image Preview)
- Perfect for testing and development

**Generation Time**:
- **10-20 seconds** ✅
- Near real-time performance
- Faster than DALL-E 3

**Commercial Rights**:
- ✅ Commercial rights available on paid tier
- Check specific tier licensing

**Quality**:
- Excellent overall quality
- Outstanding text rendering (best in class)
- Photorealistic results
- Strong prompt adherence

**Authentication**:
- Google Cloud authentication
- Service account credentials
- OAuth 2.0 support

**Integration Difficulty**: ⭐⭐ **Medium**
- Requires Google Cloud setup
- More complex authentication
- Good documentation
- Official SDKs available

**API Example**:
```bash
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/imagen-4:predict \
  -d '{
    "instances": [{
      "prompt": "A vibrant sunset beach scene"
    }],
    "parameters": {
      "sampleCount": 1,
      "aspectRatio": "1:1"
    }
  }'
```

**Supported Sizes**:
- 1:1 (square)
- 9:16 (portrait)
- 16:9 (landscape)
- 3:4, 4:3

**Best For**:
- Cost-effective solution
- Fast generation requirements
- Projects with Google Cloud integration
- Applications needing text in images

**Limitations**:
- Requires Google Cloud account
- More complex setup than OpenAI
- Free tier may have restrictions

---

### 3. Replicate FLUX Schnell (COST-EFFECTIVE)

**Overview**: Fastest and cheapest image generation option via Replicate platform.

**Pricing**:
- FLUX Schnell: **$0.003 per image** (cheapest!)
- FLUX Dev: **$0.025 per image**
- FLUX Pro: **$0.04 per image**
- Stable Diffusion 3.5: **$0.036 per image**

**Generation Time**:
- FLUX Schnell: **3-5 seconds** ✅ (FASTEST!)
- FLUX Dev: ~57 seconds
- Perfect for high-volume applications

**Commercial Rights**:
- Model-dependent (verify per model)
- FLUX Schnell: Check licensing
- Generally permissive for commercial use

**Quality**:
- Good quality for speed tier
- Best text rendering (FLUX models)
- Schnell is optimized for speed over quality
- Dev and Pro offer better quality

**Authentication**:
- Simple API token
- Bearer token authentication

**Integration Difficulty**: ⭐ **Easy**
- Simple REST API
- Good documentation
- Multiple model options on one platform

**API Example**:
```bash
curl -X POST \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  https://api.replicate.com/v1/predictions \
  -d '{
    "version": "FLUX_SCHNELL_VERSION_ID",
    "input": {
      "prompt": "A vibrant sunset beach scene",
      "num_outputs": 1,
      "aspect_ratio": "1:1"
    }
  }'
```

**Supported Sizes**:
- Various aspect ratios
- FLUX supports up to 4 megapixels
- Flexible sizing options

**Best For**:
- High-volume applications
- Cost-sensitive projects
- Fast generation requirements
- Batch processing

**Limitations**:
- Schnell has lower quality than Pro models
- Need to verify commercial licensing per model
- Platform dependency (Replicate)

---

### 4. Stability AI (ALTERNATIVE)

**Overview**: Open-source friendly image generation with Stable Diffusion models.

**Pricing**:
- Community License: FREE (individuals/small businesses <$1M revenue)
- Commercial use: $20+/month subscription
- Via third-party APIs: $0.002-$0.01+ per image

**Generation Time**:
- Stable Diffusion 1.5: 1-2 seconds (local), 3-8 seconds (API)
- Stable Diffusion 3.5: ~5 seconds
- FLUX on Stability: Premium pricing

**Commercial Rights**:
- ✅ Commercial usage included on paid tiers
- Community license restrictions for revenue >$1M

**Quality**:
- Good to excellent (model dependent)
- SD 3.5 offers improved quality
- Customizable with fine-tuning

**Best For**:
- Open-source projects
- Custom model training
- Self-hosting options

---

### Image Generation API Comparison Table

| Feature | DALL-E 3 | Imagen 4 | FLUX Schnell | Stability AI |
|---------|----------|----------|--------------|--------------|
| **Cost/Image** | $0.04-$0.12 | $0.04-$0.06 | $0.003 | $0.002-$0.01 |
| **Generation Time** | 15-30 sec | 10-20 sec | 3-5 sec | 3-8 sec |
| **Commercial Rights** | ✅ Full | ✅ Paid tier | ⚠️ Check model | ✅ Paid tier |
| **Quality** | Excellent | Excellent | Good | Good-Excellent |
| **Text Rendering** | Good | Best | Best | Fair |
| **Integration** | ⭐ Easy | ⭐⭐ Medium | ⭐ Easy | ⭐⭐ Medium |
| **Uses OpenAI Key** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Free Tier** | $5 credits | 500/day | No | Community |
| **Best For** | Professional | Cost-effective | High-volume | Open-source |

---

## Integration Roadmap

### Phase 1: Stock Photos (EASIEST - 1-2 hours)

**Goal**: Replace mock images with real stock photos from Pexels

**Steps**:
1. Get Pexels API key from https://www.pexels.com/api/
2. Add to `.env.local`: `PEXELS_API_KEY=your_key_here`
3. Install HTTP client (already have `fetch`)
4. Create `lib/apis/pexels.ts` helper module
5. Integrate search into LangGraph workflow
6. Update slideshow editor to display real images

**Files to Create/Modify**:
- `.env.local` - Add Pexels API key
- `.env.example` - Document Pexels key
- `lib/apis/pexels.ts` - New API helper
- `lib/types/slideshow.ts` - Add image URL fields
- `lib/langraph/slideshow-graph.ts` - Add Pexels search node
- `components/slideshow-editor.tsx` - Use real image URLs

**Implementation Outline**:

```typescript
// lib/apis/pexels.ts
export async function searchPexelsPhotos(query: string, perPage: number = 1) {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
    {
      headers: {
        Authorization: process.env.PEXELS_API_KEY!,
      },
    }
  );
  const data = await response.json();
  return data.photos.map(photo => ({
    url: photo.src.large,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
  }));
}
```

**Benefits**:
- Quick win (1-2 hours)
- Completely free
- Professional quality images
- Instant value for users

---

### Phase 2: Image Generation (MEDIUM - 2-4 hours)

**Goal**: Add AI-generated custom images using DALL-E 3

**Steps**:
1. Use existing `OPENAI_API_KEY` (already set up!)
2. Create `lib/apis/dalle.ts` helper module
3. Update LangGraph to generate image prompts
4. Add conditional logic: stock photos OR AI generation
5. Generate images based on slide content
6. Handle image URLs in slideshow editor

**Files to Create/Modify**:
- `lib/apis/dalle.ts` - New DALL-E 3 helper
- `lib/types/slideshow.ts` - Add image generation options
- `lib/langraph/slideshow-graph.ts` - Add DALL-E node
- `components/slideshow-form.tsx` - Add AI generation option
- `components/slideshow-editor.tsx` - Handle AI images

**Implementation Outline**:

```typescript
// lib/apis/dalle.ts
export async function generateImage(prompt: string, size: string = "1024x1024") {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      quality: "standard",
    }),
  });
  const data = await response.json();
  return data.data[0].url;
}
```

**Benefits**:
- Premium feature for users
- Uses existing OpenAI integration
- Full commercial rights
- Can charge extra for this feature

---

### Phase 3: Hybrid Approach (BEST - 3-5 hours)

**Goal**: Offer both stock photos and AI generation with user choice

**Approach**:
- Default: Use Pexels (free, fast)
- Premium: Use DALL-E 3 (paid, custom)
- Let users choose per slideshow

**Implementation**:
1. Add radio button in form: "Stock Photos" vs "AI Generated"
2. Route to appropriate API based on selection
3. Show cost estimate for AI generation
4. Allow mixing (some slides stock, some AI)

**Benefits**:
- Flexibility for users
- Cost optimization
- Upsell opportunity
- Best of both worlds

---

## Cost Analysis

### Stock Photos (Pexels)
- Cost per slideshow: **FREE**
- Cost per month (unlimited): **FREE**
- Attribution: Link to Pexels

### AI Generation (DALL-E 3)

**Per 7-Slide Slideshow**:
- Standard quality (1024×1024): **$0.28**
- HD quality (1024×1024): **$0.84**
- HD portrait (1024×1536): **$0.56**

**Per Month**:
- 100 slideshows/month (standard): **$28**
- 100 slideshows/month (HD): **$84**
- 1000 slideshows/month (standard): **$280**

### AI Generation (FLUX Schnell via Replicate)

**Per 7-Slide Slideshow**:
- FLUX Schnell: **$0.021** (13x cheaper than DALL-E!)

**Per Month**:
- 100 slideshows/month: **$2.10**
- 1000 slideshows/month: **$21**

### Hybrid Approach

**5 Stock Photos + 2 AI Images** (per slideshow):
- With DALL-E 3 (standard): **$0.08**
- With DALL-E 3 (HD): **$0.24**
- With FLUX Schnell: **$0.006**

### Break-Even Analysis

If you charge users:
- **$5/slideshow**: Profitable at any volume with all options
- **$1/slideshow**: Profitable with stock photos or FLUX; not with DALL-E HD
- **Free tier**: Use stock photos only

---

## Recommendations

### Immediate Implementation (Week 1)

**1. Integrate Pexels API** ⭐ Priority 1
- **Why**: Free, fast, easy win
- **Time**: 1-2 hours
- **Value**: Instant upgrade from mock images
- **Risk**: Low (free tier, no billing)

**Implementation**:
```bash
# 1. Get API key
Visit https://www.pexels.com/api/

# 2. Add to .env.local
PEXELS_API_KEY=your_key_here

# 3. Create helper
Create lib/apis/pexels.ts

# 4. Update LangGraph
Add Pexels search to workflow

# 5. Update editor
Use real image URLs
```

---

### Near-Term Enhancement (Week 2-3)

**2. Add DALL-E 3 Integration** ⭐ Priority 2
- **Why**: Premium feature, uses existing OpenAI key
- **Time**: 2-4 hours
- **Value**: Monetization opportunity
- **Risk**: Low (same API you're using)

**Implementation**:
```bash
# 1. Create DALL-E helper
Create lib/apis/dalle.ts

# 2. Update form
Add "AI Generated" option

# 3. Update LangGraph
Add conditional image generation

# 4. Show cost to user
Display "$0.28 per slideshow" estimate
```

**Monetization Strategy**:
- Free tier: Stock photos only
- Pro tier ($5/month): 10 AI-generated slideshows
- Premium tier ($15/month): Unlimited AI generation
- Pay-per-use: $1 per AI slideshow

---

### Future Optimization (Month 2)

**3. Add FLUX Schnell for Cost Savings** ⭐ Priority 3
- **Why**: 10x cheaper than DALL-E, faster
- **Time**: 2-3 hours
- **Value**: Cost optimization at scale
- **Risk**: Medium (new platform, verify licensing)

**Use Cases**:
- High-volume users
- Batch processing
- Testing/development
- Cost-sensitive markets

---

### Don't Do (Not Recommended)

❌ **Pinterest API**
- No search functionality
- Legal issues
- ToS violations

❌ **Midjourney**
- No official API
- Unofficial APIs violate ToS
- Risk of account bans

❌ **Self-hosting Stable Diffusion**
- Infrastructure costs
- Maintenance burden
- GPU requirements
- Not worth it at current scale

---

## Technical Integration Examples

### Example 1: Pexels Search in LangGraph

```typescript
// lib/langraph/slideshow-graph.ts

async function fetchImagesForSlides(
  state: typeof GraphStateAnnotation.State
): Promise<Partial<typeof GraphStateAnnotation.State>> {
  const { slideshowContent, formData } = state;

  if (!slideshowContent || formData.imageOption !== "stock") {
    return {};
  }

  try {
    const imageUrls = await Promise.all(
      slideshowContent.slides.map(async (slide, index) => {
        // Use image keywords from AI-generated content
        const query = slideshowContent.suggestedImageKeywords[index] || slide.headline;
        const photos = await searchPexelsPhotos(query, 1);
        return photos[0]?.url || null;
      })
    );

    return {
      slideshowContent: {
        ...slideshowContent,
        slides: slideshowContent.slides.map((slide, i) => ({
          ...slide,
          imageUrl: imageUrls[i],
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching images:", error);
    return { error: "Failed to fetch images" };
  }
}
```

### Example 2: DALL-E 3 Generation in LangGraph

```typescript
// lib/langraph/slideshow-graph.ts

async function generateImagesForSlides(
  state: typeof GraphStateAnnotation.State
): Promise<Partial<typeof GraphStateAnnotation.State>> {
  const { slideshowContent, formData } = state;

  if (!slideshowContent || formData.imageOption !== "ai-generated") {
    return {};
  }

  try {
    const imageUrls = await Promise.all(
      slideshowContent.slides.map(async (slide) => {
        // Create detailed prompt for DALL-E
        const prompt = `Create a professional social media image for: "${slide.headline}".
Style: ${formData.template}. Tone: ${formData.tone}.
Make it visually appealing for ${formData.audience}.`;

        const imageUrl = await generateImage(prompt, "1024x1024");
        return imageUrl;
      })
    );

    return {
      slideshowContent: {
        ...slideshowContent,
        slides: slideshowContent.slides.map((slide, i) => ({
          ...slide,
          imageUrl: imageUrls[i],
        })),
      },
    };
  } catch (error) {
    console.error("Error generating images:", error);
    return { error: "Failed to generate images" };
  }
}
```

### Example 3: Multi-Node LangGraph with Images

```typescript
// lib/langraph/slideshow-graph.ts

export function createSlideshowGraph() {
  const workflow = new StateGraph(GraphStateAnnotation);

  // Existing node: Generate text content
  workflow.addNode("generate", generateSlideshow);

  // New node: Fetch or generate images
  workflow.addNode("images", async (state) => {
    if (state.formData.imageOption === "stock") {
      return fetchImagesForSlides(state);
    } else if (state.formData.imageOption === "ai-generated") {
      return generateImagesForSlides(state);
    }
    return {};
  });

  // Set entry point
  workflow.addEdge(START, "generate");

  // Generate text, then get images
  workflow.addEdge("generate", "images");

  // Images to end
  workflow.addEdge("images", END);

  return workflow.compile();
}
```

---

## Summary

### Quick Decision Matrix

| Requirement | Recommendation | Time | Cost |
|-------------|----------------|------|------|
| Need images NOW | Pexels API | 1-2 hrs | FREE |
| Professional quality | Pexels or DALL-E 3 | 1-4 hrs | FREE or $0.04/img |
| Custom/unique images | DALL-E 3 | 2-4 hrs | $0.04-$0.12/img |
| High volume/low cost | FLUX Schnell | 2-3 hrs | $0.003/img |
| No attribution | Pixabay | 2-3 hrs | FREE |
| Fastest generation | FLUX Schnell | 2-3 hrs | $0.003/img |
| Existing OpenAI setup | DALL-E 3 | 2-4 hrs | $0.04-$0.12/img |

### Final Recommendation

**Phase 1** (This Week):
1. ✅ Integrate Pexels API for stock photos
2. ✅ Replace all mock images
3. ✅ Ship to users immediately

**Phase 2** (Next Week):
1. ✅ Add DALL-E 3 as premium option
2. ✅ Add pricing tier for AI generation
3. ✅ Monitor costs and usage

**Phase 3** (Future):
1. Consider FLUX Schnell for cost optimization
2. Add hybrid mode (mix stock + AI)
3. A/B test image quality vs cost

---

## Resources & Documentation

### Stock Photo APIs
- [Pexels API Docs](https://www.pexels.com/api/documentation/)
- [Unsplash API Docs](https://unsplash.com/documentation)
- [Pixabay API Docs](https://pixabay.com/api/docs/)

### Image Generation APIs
- [DALL-E 3 API Docs](https://platform.openai.com/docs/guides/images)
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [Google Imagen API Docs](https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview)
- [Replicate Docs](https://replicate.com/docs)
- [FLUX Models](https://blackforestlabs.ai/)

### Legal & Licensing
- [Pexels License](https://www.pexels.com/license/)
- [Unsplash License](https://unsplash.com/license)
- [Pixabay License](https://pixabay.com/service/terms/)
- [OpenAI Terms](https://openai.com/policies/terms-of-use)

---

*Last Updated: December 24, 2025*
