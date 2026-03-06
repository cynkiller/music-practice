import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'

// List of all piano samples that need to be preloaded
const PIANO_SAMPLE_PATHS = [
  '/audio/A0.mp3', '/audio/A1.mp3', '/audio/A2.mp3', '/audio/A3.mp3',
  '/audio/A4.mp3', '/audio/A5.mp3', '/audio/A6.mp3', '/audio/A7.mp3',
  '/audio/C1.mp3', '/audio/C2.mp3', '/audio/C3.mp3', '/audio/C4.mp3',
  '/audio/C5.mp3', '/audio/C6.mp3', '/audio/C7.mp3', '/audio/C8.mp3',
  '/audio/Ds1.mp3', '/audio/Ds2.mp3', '/audio/Ds3.mp3', '/audio/Ds4.mp3',
  '/audio/Ds5.mp3', '/audio/Ds6.mp3', '/audio/Ds7.mp3',
  '/audio/Fs1.mp3', '/audio/Fs2.mp3', '/audio/Fs3.mp3', '/audio/Fs4.mp3',
  '/audio/Fs5.mp3', '/audio/Fs6.mp3', '/audio/Fs7.mp3'
]

export function useAudioPreloader() {
  const [isPreloading, setIsPreloading] = useState(false)
  const [preloadProgress, setPreloadProgress] = useState(0)
  const [isPreloaded, setIsPreloaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const preloadAudio = useCallback(async () => {
    if (isPreloaded) return true

    setIsPreloading(true)
    setError(null)
    setPreloadProgress(0)

    try {
      const ctx = (Taro as any).createWebAudioContext()
      const totalSamples = PIANO_SAMPLE_PATHS.length
      let loadedCount = 0

      // Load samples in batches to avoid overwhelming the system
      const batchSize = 5
      for (let i = 0; i < PIANO_SAMPLE_PATHS.length; i += batchSize) {
        const batch = PIANO_SAMPLE_PATHS.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(async (path) => {
            try {
              const response = await Taro.request({ 
                url: path, 
                responseType: 'arraybuffer' 
              })
              await ctx.decodeAudioData(response.data)
              loadedCount++
              setPreloadProgress(Math.round((loadedCount / totalSamples) * 100))
            } catch (err) {
              console.warn(`Failed to preload ${path}:`, err)
              // Continue with other samples even if one fails
              loadedCount++
              setPreloadProgress(Math.round((loadedCount / totalSamples) * 100))
            }
          })
        )
      }

      setIsPreloaded(true)
      return true
    } catch (err) {
      console.error('Audio preloading failed:', err)
      setError('Failed to preload audio samples')
      return false
    } finally {
      setIsPreloading(false)
    }
  }, [isPreloaded])

  const preloadWithTimeout = useCallback(async (timeoutMs = 10000) => {
    const preloadPromise = preloadAudio()
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('Preload timeout')), timeoutMs)
    })

    try {
      return await Promise.race([preloadPromise, timeoutPromise])
    } catch (err) {
      console.warn('Audio preload timed out, continuing without preload')
      setError('Preload timed out - using oscillator fallback')
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
