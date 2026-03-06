import { useState, useCallback } from 'react'
import { useAudio } from './useAudio'

export function useAudioPreloader() {
  const [isPreloading, setIsPreloading] = useState(false)
  const [preloadProgress, setPreloadProgress] = useState(0)
  const [loadedCount, setLoadedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isPreloaded, setIsPreloaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { preloadAll } = useAudio()

  const preloadAudio = useCallback(async () => {
    if (isPreloaded) return true

    setIsPreloading(true)
    setError(null)
    setPreloadProgress(0)

    try {
      await preloadAll((loaded, total) => {
        setLoadedCount(loaded)
        setTotalCount(total)
        setPreloadProgress(Math.round((loaded / total) * 100))
      })
      setIsPreloaded(true)
      setPreloadProgress(100)
      return true
    } catch (err) {
      console.error('Audio preloader failed:', err)
      setError('Some samples failed to load')
      setIsPreloaded(true) // proceed anyway
      return false
    } finally {
      setIsPreloading(false)
    }
  }, [isPreloaded, preloadAll])

  return {
    isPreloading,
    preloadProgress,
    loadedCount,
    totalCount,
    isPreloaded,
    error,
    preloadAudio
  }
}
