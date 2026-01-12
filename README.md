# Social Media Slideshow Generator

AI-powered tool for creating Instagram/TikTok carousel slideshows.

## Links

- **Live Demo**: [alex-berard-slide-studio.vercel.app](https://alex-berard-slide-studio.vercel.app/) (password: 220963361)
- **Video Demo**: [Google Drive](https://drive.google.com/file/d/1OtU8fbwK9JlKJB88jKQbpVjRM-L_3b8f/view?usp=drive_link)

## Features

- **AI Content Generation** - Generates headlines, body text, and image keywords using GPT-4o-mini
- **Stock Photo Integration** - Automatic image sourcing from Pexels API
- **Visual Editor** - Drag-and-drop text positioning, font customization, image adjustments
- **Export** - Download slideshows as PNG images

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local` with your API keys:
   ```
   OPENAI_API_KEY=your_key_here
   PEXELS_API_KEY=your_key_here
   ```
4. Run the development server: `npm run dev`

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API
- Pexels API
