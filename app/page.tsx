import Link from "next/link"
import { ArrowRight, Sparkles, Zap, Palette, Download, ImageIcon, Type } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-[#0a0a0a] to-cyan-950/30" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[150px] animate-pulse-slow animation-delay-4000" />
      </div>

      {/* Grid overlay */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 lg:px-12 py-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">SlideGen</span>
          </div>
          <Link
            href="/editor"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Open Editor
          </Link>
        </nav>

        {/* Hero */}
        <section className="px-6 lg:px-12 pt-20 lg:pt-32 pb-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white/80">AI-Powered Content Creation</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Create stunning
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                social media slides
              </span>
              <br />
              <span className="bg-gradient-to-r from-white/60 via-white to-white bg-clip-text text-transparent">
                in seconds
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg lg:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
              Describe your product or message, and let AI generate scroll-stopping carousel posts.
              Fine-tune every detail in our powerful editor.
            </p>

            {/* CTA */}
            <Link
              href="/editor"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium text-lg shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105"
            >
              Start Creating
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="mt-4 text-sm text-white/30">No account required</p>
          </div>
        </section>

        {/* Preview Section */}
        <section className="px-6 lg:px-12 py-20">
          <div className="max-w-6xl mx-auto">
            {/* Browser mockup */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1.5 rounded-md bg-white/5 text-xs text-white/40">
                    slidegen.app/editor
                  </div>
                </div>
              </div>

              {/* Preview content - slides */}
              <div className="p-8 lg:p-12 bg-gradient-to-br from-zinc-900 to-zinc-950">
                <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                  {[
                    { bg: "from-violet-600 to-purple-700", text: "Boost your productivity with AI-powered workflows", emoji: "🚀" },
                    { bg: "from-cyan-600 to-blue-700", text: "Save 10+ hours every week on content creation", emoji: "⏰" },
                    { bg: "from-fuchsia-600 to-pink-700", text: "Join 50,000+ creators already using SlideGen", emoji: "✨" },
                    { bg: "from-amber-500 to-orange-600", text: "Export in perfect resolution for any platform", emoji: "📱" },
                  ].map((slide, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-[280px] h-[280px] lg:w-[320px] lg:h-[320px] rounded-2xl overflow-hidden snap-center shadow-xl"
                    >
                      <div className={`w-full h-full bg-gradient-to-br ${slide.bg} p-8 flex flex-col justify-center items-center text-center`}>
                        <span className="text-5xl mb-4">{slide.emoji}</span>
                        <p className="text-xl lg:text-2xl font-bold text-white leading-snug">
                          {slide.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating accent */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20 blur-[100px] rounded-full" />
          </div>
        </section>

        {/* Features */}
        <section className="px-6 lg:px-12 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Everything you need to create
                <br />
                <span className="text-white/40">viral carousel content</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Sparkles,
                  title: "AI-Generated Copy",
                  description: "Describe your product and let AI craft compelling slide content with the perfect hook.",
                  gradient: "from-violet-500 to-purple-600"
                },
                {
                  icon: ImageIcon,
                  title: "Stock Photo Search",
                  description: "Search millions of high-quality stock photos directly in the editor. No attribution needed.",
                  gradient: "from-cyan-500 to-blue-600"
                },
                {
                  icon: Palette,
                  title: "Visual Editor",
                  description: "Fine-tune colors, fonts, positions, and effects with our intuitive drag-and-drop editor.",
                  gradient: "from-fuchsia-500 to-pink-600"
                },
                {
                  icon: Type,
                  title: "Typography Controls",
                  description: "Adjust font size, weight, color, stroke, and alignment for perfect text presentation.",
                  gradient: "from-amber-500 to-orange-600"
                },
                {
                  icon: Download,
                  title: "One-Click Export",
                  description: "Export individual slides or batch download all as a ZIP file in perfect resolution.",
                  gradient: "from-emerald-500 to-teal-600"
                },
                {
                  icon: Zap,
                  title: "Multiple Templates",
                  description: "Choose from Bold, Informational, Top 10, or Hard Sell templates for different vibes.",
                  gradient: "from-rose-500 to-red-600"
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 lg:px-12 py-24 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Three steps to
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"> viral content</span>
              </h2>
            </div>

            <div className="space-y-8">
              {[
                { step: "01", title: "Describe Your Content", description: "Tell us about your product, service, or message. Select your target audience and preferred tone." },
                { step: "02", title: "AI Generates Slides", description: "Our AI creates compelling carousel content with hooks, value points, and calls-to-action." },
                { step: "03", title: "Customize & Export", description: "Fine-tune the design in our editor, add images, adjust typography, and export in perfect resolution." },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center font-bold text-xl text-white/60 group-hover:text-white group-hover:border-white/20 transition-all">
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-white/40 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 lg:px-12 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative p-12 lg:p-16 rounded-3xl bg-gradient-to-br from-violet-900/50 via-fuchsia-900/30 to-cyan-900/50 border border-white/10 overflow-hidden">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-cyan-500/10" />

              <div className="relative z-10">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Ready to create scroll-stopping content?
                </h2>
                <p className="text-white/50 mb-8 max-w-lg mx-auto">
                  Start creating professional carousel slides in seconds. No design skills required.
                </p>
                <Link
                  href="/editor"
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-zinc-900 font-medium text-lg shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105"
                >
                  Launch Editor
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 lg:px-12 py-8 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/40">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm">SlideGen</span>
            </div>
            <p className="text-sm text-white/30">
              Create stunning social media carousels with AI
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}
