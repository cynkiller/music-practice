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

  // Load a sample (async) - returns loaded data without scheduling
  const loadSample = useCallback(
    async (note: string): Promise<{ buffer: AudioBuffer; playbackRate: number } | null> => {
      if (FORCE_OSCILLATOR) return null
      const cache = getCache()
      try {
        return await cache.getSample(note)
      } catch (error) {
        console.warn(`Sample load failed for ${note}:`, error)
        return null
      }
    },
    [getCache, FORCE_OSCILLATOR]
  )

  // Schedule a note (sync) using a pre-loaded sample or oscillator fallback
  const scheduleNote = useCallback(
    (note: string, durationSec: number, startTime: number,
     sample: { buffer: AudioBuffer; playbackRate: number } | null) => {
      const ctx = getCtx()
      const now = ctx.currentTime

      // Validate startTime is in the future
      if (startTime < now) {
        console.warn(`scheduleNote: startTime ${startTime} is in the past (now=${now}), adjusting`)
        startTime = now + 0.05
      }

      try {
        if (sample) {
          // Try sample playback
          try {
            const { buffer, playbackRate } = sample
            const source = ctx.createBufferSource()
            source.buffer = buffer
            source.playbackRate.value = playbackRate

            const gain = ctx.createGain()
            gain.gain.setValueAtTime(0, startTime)
            gain.gain.linearRampToValueAtTime(1.0, startTime + 0.01)
            gain.gain.exponentialRampToValueAtTime(0.2, startTime + durationSec * 0.35)
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec)

            source.connect(gain)
            gain.connect(ctx.destination)
            source.start(startTime)
            source.stop(startTime + durationSec + 0.1)

            activeNodesRef.current.push({ source, gain, stopTime: startTime + durationSec })
            console.log(`✓ ${note} scheduled via sample at t=${startTime.toFixed(3)}`)
            return
          } catch (sampleError) {
            console.warn(`Sample playback failed for ${note}, falling back to oscillator:`, sampleError)
          }
        }

        // Oscillator fallback (always works as last resort)
        const freq = noteToFrequency(note)
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, startTime)
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(1.0, startTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.2, startTime + durationSec * 0.35)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(startTime)
        osc.stop(startTime + durationSec)

        activeNodesRef.current.push({ oscillator: osc, gain, stopTime: startTime + durationSec })
        console.log(`✓ ${note} scheduled via oscillator at t=${startTime.toFixed(3)}`)
      } catch (error) {
        console.error(`CRITICAL: Failed to schedule ${note}:`, error)
        // Last-ditch effort: try immediate oscillator
        try {
          const freq = noteToFrequency(note)
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.value = freq
          gain.gain.value = 0.7
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + durationSec)
          console.log(`✓ ${note} emergency fallback triggered`)
        } catch (lastError) {
          console.error(`FATAL: Cannot play ${note} at all:`, lastError)
        }
      }

      // Clean up finished nodes
      activeNodesRef.current = activeNodesRef.current.filter(n => n.stopTime > now - 0.1)
    },
    [getCtx]
  )

  const playInterval = useCallback(
    async (rootNote: string, semitones: number, difficulty: Difficulty) => {
      stopAll()
      setIsLoading(true)
      const config = DIFFICULTY_CONFIGS[difficulty]
      const dur = config.noteDurationMs / 1000
      const gap = config.gapMs / 1000
      const note2 = noteFromSemitone(rootNote, semitones)

      // Pre-load both samples in parallel
      const [s1, s2] = await Promise.all([loadSample(rootNote), loadSample(note2)])
      setIsLoading(false)

      // Schedule note 1 immediately
      scheduleNote(rootNote, dur, getCtx().currentTime + 0.05, s1)

      // Schedule note 2 just before it should play
      await new Promise(resolve => setTimeout(resolve, (dur + gap) * 1000))
      scheduleNote(note2, dur, getCtx().currentTime + 0.05, s2)
    },
    [getCtx, loadSample, scheduleNote, stopAll]
  )

  const playChord = useCallback(
    async (rootNote: string, intervals: number[], difficulty: Difficulty) => {
      stopAll()
      setIsLoading(true)
      const config = DIFFICULTY_CONFIGS[difficulty]
      const dur = config.noteDurationMs / 1000
      const notes = intervals.map(s => noteFromSemitone(rootNote, s))

      // Pre-load all samples in parallel
      const samples = await Promise.all(notes.map(n => loadSample(n)))
      setIsLoading(false)

      // Schedule all notes simultaneously with fresh timing
      const now = getCtx().currentTime + 0.05
      notes.forEach((n, i) => scheduleNote(n, dur, now, samples[i]))
    },
    [getCtx, loadSample, scheduleNote, stopAll]
  )

  const playArpeggio = useCallback(
    async (rootNote: string, intervals: number[], difficulty: Difficulty) => {
      stopAll()
      setIsLoading(true)
      const config = DIFFICULTY_CONFIGS[difficulty]
      const dur = config.noteDurationMs / 1000
      const gap = config.gapMs / 1000
      const notes = intervals.map(s => noteFromSemitone(rootNote, s))

      // Pre-load all samples in parallel
      const samples = await Promise.all(notes.map(n => loadSample(n)))
      setIsLoading(false)

      // Schedule each note just before it should play (avoids far-future scheduling)
      for (let i = 0; i < notes.length; i++) {
        scheduleNote(notes[i], dur, getCtx().currentTime + 0.05, samples[i])
        if (i < notes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, (dur + gap) * 1000))
        }
      }
    },
    [getCtx, loadSample, scheduleNote, stopAll]
  )

  const playNote = useCallback(
    async (note: string, durationMs: number) => {
      setIsLoading(true)
      const sample = await loadSample(note)
      setIsLoading(false)
      scheduleNote(note, durationMs / 1000, getCtx().currentTime + 0.05, sample)
    },
    [getCtx, loadSample, scheduleNote]
  )

  const preloadAll = useCallback(
    (onProgress: (loaded: number, total: number) => void) => {
      const cache = getCache()
      return cache.preloadAll(onProgress)
    },
    [getCache]
  )

  return { 
    playInterval, 
    playChord, 
    playArpeggio, 
    playNote, 
    stopAll, 
    isLoading,
    preloadAll,
    getCacheStats: () => cacheRef.current?.getStats() || { cached: 0, loading: 0, total: 30 }
  }
}
