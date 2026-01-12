import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { SimplePasswordGate } from "@/components/simple-password-gate"

export default function LandingPage() {
  return (
    <SimplePasswordGate>
    <main className="h-screen bg-background dark:bg-black text-foreground dark:text-white overflow-hidden flex flex-col">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 via-background to-lime-100/30 dark:from-emerald-950/30 dark:via-black dark:to-lime-950/20" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-lime-500/10 dark:bg-lime-500/15 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/8 dark:bg-green-500/10 rounded-full blur-[150px] animate-pulse-slow animation-delay-4000" />
      </div>

      <div
        className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <nav className="flex items-center justify-center px-6 lg:px-12 py-4">
          <span className="text-3xl font-black tracking-tight text-foreground dark:text-white italic font-[family-name:var(--font-tiktok-sans)]">
            SlideStudio
          </span>
        </nav>

        <section className="flex-1 flex items-center justify-center px-6 lg:px-12 -mt-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 dark:bg-white/5 border border-emerald-500/30 mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="text-sm text-foreground/80 dark:text-white/80">AI-Powered Content Creation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-5">
              <span className="text-foreground dark:text-white">
                Create stunning
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 dark:from-emerald-400 dark:via-green-400 dark:to-lime-400 bg-clip-text text-transparent">
                social media slides
              </span>
              <br />
              <span className="text-foreground/80 dark:text-white/80">
                in seconds
              </span>
            </h1>

            <p className="text-base lg:text-lg text-foreground/60 dark:text-white/50 max-w-2xl mx-auto mb-8 leading-relaxed">
              Describe your product or message, and let AI generate scroll-stopping carousel posts.
              Fine-tune every detail in our powerful editor.
            </p>

            <Link
              href="/editor"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium text-lg shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
            >
              Start Creating
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="mt-3 text-sm text-foreground/30 dark:text-white/30">No account required</p>
          </div>
        </section>
      </div>
    </main>
    </SimplePasswordGate>
  )
}
