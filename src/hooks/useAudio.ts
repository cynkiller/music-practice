import { useRef, useCallback, useState } from 'react'
import Taro from '@tarojs/taro'
import type { Difficulty } from '../types/index'
import { DIFFICULTY_CONFIGS } from '../lib/musicTheory'
import { noteFromSemitone } from '../lib/musicTheory'
import { AudioCache } from './useAudioCache'

// Convert note name to frequency (for oscillator fallback)
function noteToFrequency(note: string): number {
  const noteNames: Record<string, number> = {
    'C': -9, 'C#': -8, 'Db': -8, 'D': -7, 'D#': -6, 'Eb': -6,
    'E': -5, 'F': -4, 'F#': -3, 'Gb': -3, 'G': -2, 'G#': -1,
    'Ab': -1, 'A': 0, 'A#': 1, 'Bb': 1, 'B': 2
  }
  
  const match = note.match(/^([A-G][#b]?)(\d+)$/)
  if (!match) return 440
  
  const [, noteName, octaveStr] = match
  const octave = parseInt(octaveStr)
  const semitonesFromA4 = noteNames[noteName] + (octave - 4) * 12
  
  return 440 * Math.pow(2, semitonesFromA4 / 12)
}

function normalizeNoteName(note: string): string {
  // Extract note name and octave, handling sharps/flats
  const match = note.match(/^([A-G][#b]?)(\d+)$/)
  if (!match) return note
  
  let [, noteName, octave] = match
  octave = octave.padStart(1, '0') // Ensure single digit
  
  return `${noteName}${octave}`
}

export function useAudio() {
  const audioCtxRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const activeNodesRef = useRef<Array<{ source?: any; oscillator?: any; gain: any; stopTime: number }>>([])
  const cacheRef = useRef<any>(null)
  
  // DEBUG: Force oscillator fallback for testing
  const FORCE_OSCILLATOR = false // Set to true to test oscillator only

  const getCtx = useCallback((): any => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = (Taro as any).createWebAudioContext()
        console.log('Audio context created successfully')
        // Initialize cache instance (not hook) here
        if (!cacheRef.current) {
          cacheRef.current = new AudioCache(audioCtxRef.current)
        }
      } catch (error) {
        console.error('Failed to create audio context:', error)
        throw error
      }
    }
    return audioCtxRef.current
  }, [])

  const getCache = useCallback(() => {
    if (!cacheRef.current) {
      const ctx = getCtx()
      cacheRef.current = new AudioCache(ctx)
    }
    return cacheRef.current
  }, [getCtx])

  const stopAll = useCallback(() => {
    const ctx = audioCtxRef.current
    if (!ctx) return
    activeNodesRef.current.forEach(({ source, oscillator, gain }) => {
      try {
        gain.gain.cancelScheduledValues(ctx.currentTime)
        gain.gain.setValueAtTime(0, ctx.currentTime)
        if (source) {
          source.stop(ctx.currentTime)
        } else if (oscillator) {
          oscillator.stop(ctx.currentTime)
        }
      } catch (_) {}
    })
    activeNodesRef.current = []
  }, [])

  const scheduleSample = useCallback(
    async (note: string, durationSec: number, startTime: number) => {
      const ctx = getCtx()
      
      // DEBUG: Force oscillator fallback if enabled
      if (!FORCE_OSCILLATOR) {
        const cache = getCache()

        // Try to load cached sample
        try {
          console.log(`Attempting to load sample for ${note}...`)
          const audioBuffer = await cache.getSample(note)
          // WeChat Mini Program might have different property access
      const duration = audioBuffer ? ((audioBuffer as any).duration || audioBuffer.length ? audioBuffer.length / ctx.currentTime : 0) : 0
      const channels = audioBuffer ? ((audioBuffer as any).numberOfChannels || (audioBuffer as any).channelCount || 2) : 0
      
      console.log(`Sample loading result for ${note}:`, audioBuffer ? `AudioBuffer (${duration}s, ${channels} channels)` : 'null')
          
          if (audioBuffer) {
            console.log(`Creating BufferSource for ${note}...`)
            const source = ctx.createBufferSource()
            source.buffer = audioBuffer
            
            const gain = ctx.createGain()
            gain.gain.setValueAtTime(0, startTime)
            gain.gain.linearRampToValueAtTime(0.8, startTime + 0.01)
            gain.gain.exponentialRampToValueAtTime(0.15, startTime + durationSec * 0.35)
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec)

            source.connect(gain)
            gain.connect(ctx.destination)
            source.start(startTime)
            source.stop(startTime + durationSec)

            const entry = { source, gain, stopTime: startTime + durationSec }
            activeNodesRef.current.push(entry)

            console.log(`Successfully scheduled sample playback for ${note}`)
            return source
          } else {
            console.log(`No audio buffer returned for ${note}, will use oscillator`)
          }
        } catch (error) {
          console.warn(`Failed to load sample for ${note}, falling back to oscillator`, error)
        }
      }

      // Fallback to oscillator
      console.log(`Using oscillator fallback for ${note}`)
      const freq = noteToFrequency(note)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.8, startTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.15, startTime + durationSec * 0.35)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + durationSec)

      const entry = { oscillator: osc, gain, stopTime: startTime + durationSec }
      activeNodesRef.current.push(entry)

      return osc
    },
    [getCtx, getCache, FORCE_OSCILLATOR]
  )

  const scheduleTone = useCallback(
    async (note: string, durationSec: number, startTime: number) => {
      await scheduleSample(note, durationSec, startTime)
      
      // Clean up old nodes
      const ctx = getCtx()
      const now = ctx.currentTime
      activeNodesRef.current = activeNodesRef.current.filter(node => node.stopTime > now + 0.1)
    },
    [getCtx, scheduleSample]
  )

  const playInterval = useCallback(
    async (rootNote: string, semitones: number, difficulty: Difficulty) => {
      stopAll()
      setIsLoading(true)
      try {
        const config = DIFFICULTY_CONFIGS[difficulty]
        const dur = config.noteDurationMs / 1000
        const gap = config.gapMs / 1000
        const ctx = getCtx()
        const now = ctx.currentTime
        
        await scheduleTone(rootNote, dur, now)
        await scheduleTone(noteFromSemitone(rootNote, semitones), dur, now + dur + gap)
      } finally {
        setIsLoading(false)
      }
    },
    [getCtx, scheduleTone, stopAll]
  )

  const playChord = useCallback(
    async (rootNote: string, intervals: number[], difficulty: Difficulty) => {
      stopAll()
      setIsLoading(true)
      try {
        const config = DIFFICULTY_CONFIGS[difficulty]
        const dur = config.noteDurationMs / 1000
        const ctx = getCtx()
        const now = ctx.currentTime
        
        await Promise.all(intervals.map(s => scheduleTone(noteFromSemitone(rootNote, s), dur, now)))
      } finally {
        setIsLoading(false)
      }
    },
    [getCtx, scheduleTone, stopAll]
  )

  const playArpeggio = useCallback(
    async (rootNote: string, intervals: number[], difficulty: Difficulty) => {
      stopAll()
      setIsLoading(true)
      try {
        const config = DIFFICULTY_CONFIGS[difficulty]
        const dur = config.noteDurationMs / 1000
        const gap = config.gapMs / 1000
        const ctx = getCtx()
        const now = ctx.currentTime
        
        for (let i = 0; i < intervals.length; i++) {
          await scheduleTone(noteFromSemitone(rootNote, intervals[i]), dur, now + i * (dur + gap))
        }
      } finally {
        setIsLoading(false)
      }
    },
    [getCtx, scheduleTone, stopAll]
  )

  const playNote = useCallback(
    async (note: string, durationMs: number) => {
      console.log(`Playing note: ${note} for ${durationMs}ms`)
      setIsLoading(true)
      try {
        const ctx = getCtx()
        await scheduleTone(note, durationMs / 1000, ctx.currentTime)
        console.log(`Successfully scheduled note: ${note}`)
      } catch (error) {
        console.error(`Failed to play note ${note}:`, error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [getCtx, scheduleTone]
  )

  return { 
    playInterval, 
    playChord, 
    playArpeggio, 
    playNote, 
    stopAll, 
    isLoading,
    getCacheStats: () => cacheRef.current?.getStats() || { cached: 0, loading: 0, total: 30 }
  }
}
