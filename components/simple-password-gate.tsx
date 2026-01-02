'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock } from 'lucide-react'

interface SimplePasswordGateProps {
  children: React.ReactNode
}

export function SimplePasswordGate({ children }: SimplePasswordGateProps) {
  const [password, setPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if already unlocked in sessionStorage
    if (typeof window !== 'undefined') {
      const unlocked = sessionStorage.getItem('app-unlocked')

      if (unlocked === 'true') {
        setIsUnlocked(true)
      } else if (pathname !== '/') {
        // If not unlocked and not on home page, redirect to home
        router.push('/')
      }

      setIsLoading(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Simple client-side check - just compare with the password
    // Note: This is NOT secure, but since you're using it for a university project
    // where you'll give the password to your lecturer, this approach works fine
    const correctPassword = '220963361' // Your password from .env.local

    if (password === correctPassword) {
      sessionStorage.setItem('app-unlocked', 'true')
      setIsUnlocked(true)
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
    }
  }

  if (isLoading) {
    return null // or a loading spinner
  }

  if (isUnlocked) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background dark:bg-black text-foreground dark:text-white flex items-center justify-center px-4">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 via-background to-lime-100/30 dark:from-emerald-950/30 dark:via-black dark:to-lime-950/20" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-lime-500/10 dark:bg-lime-500/15 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000" />
      </div>

      {/* Grid overlay */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full mb-4">
            <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2 italic font-[family-name:var(--font-tiktok-sans)]">
            SlideStudio
          </h1>
          <p className="text-muted-foreground">
            Enter password to access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-center"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 mt-2 text-center">
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium"
            disabled={!password}
          >
            Unlock
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          This is a university project. Contact the creator for access.
        </p>
      </div>
    </div>
  )
}
