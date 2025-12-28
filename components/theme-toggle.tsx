"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-emerald-500/20 border border-emerald-500/40" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-emerald-500/20 hover:bg-emerald-500/30 border-2 border-emerald-500/40 hover:border-emerald-500/60 backdrop-blur-sm transition-all duration-300 flex items-center justify-center group shadow-lg shadow-emerald-500/20"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-emerald-300 group-hover:text-emerald-200 group-hover:rotate-180 transition-all duration-500" />
      ) : (
        <Moon className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700 group-hover:-rotate-12 transition-all duration-300" />
      )}
    </button>
  )
}
