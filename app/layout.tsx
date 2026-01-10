import type { Metadata } from 'next'
import { Roboto, Roboto_Mono, TikTok_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import './globals.css'

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-roboto',
})
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-roboto-mono',
})
const tiktokSans = TikTok_Sans({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-tiktok-sans',
})

export const metadata: Metadata = {
  title: 'SlideStudio - AI-Powered Social Media Slideshow Generator',
  description: 'Create stunning carousel posts for Instagram, TikTok, and more. AI-generated copy, stock photos, and a powerful visual editor.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${robotoMono.variable} ${tiktokSans.variable}`} suppressHydrationWarning>
      <body className={`${roboto.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeToggle />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
