import { useCallback } from 'react'
import Taro from '@tarojs/taro'

// Use our own GitHub-hosted files - 30 known-good files
const AUDIO_BASE_URL = 'https://raw.githubusercontent.com/cynkiller/music-practice/mini-program/public/audio'

// Available sample files with their MIDI numbers
// A(9), C(0), D#(3), F#(6) per octave = evenly spaced ~3 semitones, max pitch shift ~1.5 semitones
const SAMPLE_FILES: Array<{ file: string; midi: number }> = [
  // A notes (pitch class 9)
  { file: 'A0.mp3', midi: 21 },
  { file: 'A1.mp3', midi: 33 }, { file: 'A2.mp3', midi: 45 }, { file: 'A3.mp3', midi: 57 },
  { file: 'A4.mp3', midi: 69 }, { file: 'A5.mp3', midi: 81 }, { file: 'A6.mp3', midi: 93 },
  { file: 'A7.mp3', midi: 105 },
  // C notes (pitch class 0)
  { file: 'C1.mp3', midi: 24 }, { file: 'C2.mp3', midi: 36 }, { file: 'C3.mp3', midi: 48 },
  { file: 'C4.mp3', midi: 60 }, { file: 'C5.mp3', midi: 72 }, { file: 'C6.mp3', midi: 84 },
  { file: 'C7.mp3', midi: 96 }, { file: 'C8.mp3', midi: 108 },
  // D# (Ds) notes (pitch class 3)
  { file: 'Ds1.mp3', midi: 27 }, { file: 'Ds2.mp3', midi: 39 }, { file: 'Ds3.mp3', midi: 51 },
  { file: 'Ds4.mp3', midi: 63 }, { file: 'Ds5.mp3', midi: 75 }, { file: 'Ds6.mp3', midi: 87 },
  { file: 'Ds7.mp3', midi: 99 },
  // F# (Fs) notes (pitch class 6)
  { file: 'Fs1.mp3', midi: 30 }, { file: 'Fs2.mp3', midi: 42 }, { file: 'Fs3.mp3', midi: 54 },
  { file: 'Fs4.mp3', midi: 66 }, { file: 'Fs5.mp3', midi: 78 }, { file: 'Fs6.mp3', midi: 90 },
  { file: 'Fs7.mp3', midi: 102 },
]

const PITCH_CLASS: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
}

function noteToMidi(note: string): number {
  const match = note.match(/^([A-G][#b]?)(\d+)$/)
  if (!match) return 60
  const [, name, octave] = match
  return (parseInt(octave) + 1) * 12 + (PITCH_CLASS[name] ?? 0)
}

function findNearestSample(note: string): { file: string; playbackRate: number } {
  const targetMidi = noteToMidi(note)
  let nearest = SAMPLE_FILES[0]
  let minDist = Infinity
  for (const s of SAMPLE_FILES) {
    const d = Math.abs(s.midi - targetMidi)
    if (d < minDist) { minDist = d; nearest = s }
  }
  const playbackRate = Math.pow(2, (targetMidi - nearest.midi) / 12)
  console.log(`${note}(MIDI ${targetMidi}) → ${nearest.file}(MIDI ${nearest.midi}) rate=${playbackRate.toFixed(4)}`)
  return { file: nearest.file, playbackRate }
}

export class AudioCache {
  private cache = new Map<string, AudioBuffer>()
  private loadingPromises = new Map<string, Promise<AudioBuffer>>()
  private ctx: AudioContext

  constructor(ctx: AudioContext) {
    this.ctx = ctx
  }

  async loadSample(filename: string): Promise<AudioBuffer> {
    if (this.cache.has(filename)) return this.cache.get(filename)!
    if (this.loadingPromises.has(filename)) return this.loadingPromises.get(filename)!

    const promise = this.downloadAndCache(filename)
    this.loadingPromises.set(filename, promise)
    try {
      const buffer = await promise
      this.cache.set(filename, buffer)
      return buffer
    } finally {
      this.loadingPromises.delete(filename)
    }
  }

  private async downloadAndCache(filename: string): Promise<AudioBuffer> {
    // Try local cache first
    try {
      const cached = await this.loadFromLocalStorage(filename)
      if (cached) { console.log(`${filename} loaded from local cache`); return cached }
    } catch {}

    // Download from GitHub
    const url = `${AUDIO_BASE_URL}/${filename}`
    console.log(`Downloading ${url}`)

    let arrayBuffer: ArrayBuffer

    if (Taro?.request) {
      const resp = await Taro.request({ url, method: 'GET', responseType: 'arraybuffer', timeout: 15000 })
      if (resp.statusCode !== 200 || !resp.data) throw new Error(`HTTP ${resp.statusCode}`)
      arrayBuffer = resp.data as ArrayBuffer
    } else {
      const resp = await fetch(url)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      arrayBuffer = await resp.arrayBuffer()
    }

    console.log(`Decoding ${filename} (${arrayBuffer.byteLength} bytes)`)
    const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
      this.ctx.decodeAudioData(
        arrayBuffer,
        (buf: AudioBuffer) => { console.log(`Decoded ${filename} OK`); resolve(buf) },
        (err: any) => reject(new Error(`decodeAudioData failed: ${err}`))
      )
    })

    // Save to local storage non-blocking
    this.saveToLocalStorage(filename, arrayBuffer).catch(e =>
      console.warn(`Cache save failed for ${filename}:`, e)
    )

    return audioBuffer
  }

  private async loadFromLocalStorage(filename: string): Promise<AudioBuffer | null> {
    try {
      const dirPath = `${Taro.env.USER_DATA_PATH}/audio`
      const filePath = `${dirPath}/${filename}`
      const fs = Taro.getFileSystemManager()
      try { fs.statSync(filePath) } catch { return null }

      const data = fs.readFileSync(filePath) as any
      if (!data) return null

      let buffer: ArrayBuffer
      if (data instanceof ArrayBuffer) {
        buffer = data
      } else if (data?.buffer instanceof ArrayBuffer) {
        buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      } else {
        return null
      }

      return await new Promise<AudioBuffer>((resolve, reject) => {
        this.ctx.decodeAudioData(buffer, resolve, (err: any) => reject(err))
      })
    } catch {
      return null
    }
  }

  private async saveToLocalStorage(filename: string, arrayBuffer: ArrayBuffer): Promise<void> {
    const fs = Taro.getFileSystemManager()
    const dirPath = `${Taro.env.USER_DATA_PATH}/audio`
    try { fs.mkdirSync(dirPath, true) } catch {}
    fs.writeFileSync(`${dirPath}/${filename}`, arrayBuffer)
  }

  getStats() {
    return { cached: this.cache.size, loading: this.loadingPromises.size, total: SAMPLE_FILES.length }
  }

  async getSample(note: string): Promise<{ buffer: AudioBuffer; playbackRate: number } | null> {
    const { file, playbackRate } = findNearestSample(note)
    try {
      const buffer = await this.loadSample(file)
      return { buffer, playbackRate }
    } catch (error) {
      console.error(`Failed to load sample for ${note}:`, error)
      return null
    }
  }
}

export function useAudioCache(ctx: AudioContext) {
  const cache = new AudioCache(ctx)
  const getSample = useCallback((note: string) => cache.getSample(note), [cache])
  const getStats = useCallback(() => cache.getStats(), [cache])
  return { getSample, getStats }
}
