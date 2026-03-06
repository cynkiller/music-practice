import { useRef, useCallback, useState } from 'react'
import Taro from '@tarojs/taro'
import type { Difficulty } from '../types/index'
import { DIFFICULTY_CONFIGS } from '../lib/musicTheory'
import { noteFromSemitone } from '../lib/musicTheory'

// Map notes to available piano samples
const PIANO_SAMPLES: Record<string, string> = {
  // A notes
  'A0': '/audio/A0.mp3', 'A1': '/audio/A1.mp3', 'A2': '/audio/A2.mp3', 'A3': '/audio/A3.mp3',
  'A4': '/audio/A4.mp3', 'A5': '/audio/A5.mp3', 'A6': '/audio/A6.mp3', 'A7': '/audio/A7.mp3',
  // C notes
  'C1': '/audio/C1.mp3', 'C2': '/audio/C2.mp3', 'C3': '/audio/C3.mp3', 'C4': '/audio/C4.mp3',
  'C5': '/audio/C5.mp3', 'C6': '/audio/C6.mp3', 'C7': '/audio/C7.mp3', 'C8': '/audio/C8.mp3',
  // C#/D♭ notes (using Ds files)
  'C#1': '/audio/Ds1.mp3', 'C#2': '/audio/Ds2.mp3', 'C#3': '/audio/Ds3.mp3', 'C#4': '/audio/Ds4.mp3',
  'C#5': '/audio/Ds5.mp3', 'C#6': '/audio/Ds6.mp3', 'C#7': '/audio/Ds7.mp3',
  'Db1': '/audio/Ds1.mp3', 'Db2': '/audio/Ds2.mp3', 'Db3': '/audio/Ds3.mp3', 'Db4': '/audio/Ds4.mp3',
  'Db5': '/audio/Ds5.mp3', 'Db6': '/audio/Ds6.mp3', 'Db7': '/audio/Ds7.mp3',
  // D♯ notes
  'D#1': '/audio/Ds1.mp3', 'D#2': '/audio/Ds2.mp3', 'D#3': '/audio/Ds3.mp3', 'D#4': '/audio/Ds4.mp3',
  'D#5': '/audio/Ds5.mp3', 'D#6': '/audio/Ds6.mp3', 'D#7': '/audio/Ds7.mp3',
  // E♭ notes (same as D#)
  'Eb1': '/audio/Ds1.mp3', 'Eb2': '/audio/Ds2.mp3', 'Eb3': '/audio/Ds3.mp3', 'Eb4': '/audio/Ds4.mp3',
  'Eb5': '/audio/Ds5.mp3', 'Eb6': '/audio/Ds6.mp3', 'Eb7': '/audio/Ds7.mp3',
  // F♯ notes
  'F#1': '/audio/Fs1.mp3', 'F#2': '/audio/Fs2.mp3', 'F#3': '/audio/Fs3.mp3', 'F#4': '/audio/Fs4.mp3',
  'F#5': '/audio/Fs5.mp3', 'F#6': '/audio/Fs6.mp3', 'F#7': '/audio/Fs7.mp3',
  // G♭ notes (same as F#)
  'Gb1': '/audio/Fs1.mp3', 'Gb2': '/audio/Fs2.mp3', 'Gb3': '/audio/Fs3.mp3', 'Gb4': '/audio/Fs4.mp3',
  'Gb5': '/audio/Fs5.mp3', 'Gb6': '/audio/Fs6.mp3', 'Gb7': '/audio/Fs7.mp3',
}

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

  const getCtx = useCallback((): any => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = (Taro as any).createWebAudioContext()
    }
    return audioCtxRef.current
  }, [])

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
      const normalizedNote = normalizeNoteName(note)
      const samplePath = PIANO_SAMPLES[normalizedNote]

      if (samplePath) {
        // Use piano sample
        try {
          const response = await Taro.request({ url: samplePath, responseType: 'arraybuffer' })
          const audioBuffer = await ctx.decodeAudioData(response.data)
          
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

          return source
        } catch (error) {
          console.warn(`Failed to load sample for ${note}, falling back to oscillator`, error)
        }
      }

      // Fallback to oscillator
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
    [getCtx]
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
    async (note: string, durationMs = 800) => {
      setIsLoading(true)
      try {
        const ctx = getCtx()
        await scheduleTone(note, durationMs / 1000, ctx.currentTime)
      } finally {
        setIsLoading(false)
      }
    },
    [getCtx, scheduleTone]
  )

  return { playInterval, playChord, playArpeggio, playNote, stopAll, isLoading }
}
