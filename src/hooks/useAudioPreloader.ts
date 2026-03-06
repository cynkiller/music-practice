import { useState, useEffect, useCallback } from 'react'
import { useAudio } from './useAudio'

export function useAudioPreloader() {
  const [isPreloading, setIsPreloading] = useState(false)
  const [preloadProgress, setPreloadProgress] = useState(0)
  const [isPreloaded, setIsPreloaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getCacheStats } = useAudio()

  const preloadAudio = useCallback(async () => {
    if (isPreloaded) return true

    setIsPreloading(true)
    setError(null)
    setPreloadProgress(0)

    try {
      // Just check if cache system is available
      // Actual loading happens on-demand when samples are first played
      const stats = getCacheStats()
      
      // Simulate preloading progress for UX
      for (let i = 0; i <= 100; i += 10) {
        setPreloadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      setIsPreloaded(true)
      return true
    } catch (err) {
      console.error('Audio preloader failed:', err)
      setError('Failed to initialize audio system')
      return false
    } finally {
      setIsPreloading(false)
    }
  }, [isPreloaded, getCacheStats])

  const preloadWithTimeout = useCallback(async (timeoutMs = 3000) => {
    const preloadPromise = preloadAudio()
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('Preload timeout')), timeoutMs)
    })

    try {
      return await Promise.race([preloadPromise, timeoutPromise])
    } catch (err) {
      console.warn('Audio preload timed out, continuing without preload')
      setError('Audio system ready - samples will load on demand')
      return false
    }
  }, [preloadAudio])

  return {
    isPreloading,
    preloadProgress,
    isPreloaded,
    error,
    preloadAudio: preloadWithTimeout
  }
}
