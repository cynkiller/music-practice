import { useCallback } from 'react'
import Taro from '@tarojs/taro'

// Use jsDelivr CDN for faster China Mainland access - High quality tonejs piano samples
const AUDIO_BASE_URL = 'https://cdn.jsdelivr.net/npm/tonejs-instrument-piano-mp3@1.1.2'

// Available sample files with their MIDI numbers
// tonejs-instrument-piano-mp3 provides proper note names (A4.mp3, C4.mp3, etc.)
// High quality Salamander Grand Piano samples via jsDelivr CDN
// Note: CDN starts from A1, not A0. Use closest available samples.
const SAMPLE_FILES: Array<{ file: string; midi: number }> = [
  // A notes (pitch class 9) - A1-A7 available, no A0
  { file: 'A1.mp3', midi: 33 }, { file: 'A2.mp3', midi: 45 }, { file: 'A3.mp3', midi: 57 },
  { file: 'A4.mp3', midi: 69 }, { file: 'A5.mp3', midi: 81 }, { file: 'A6.mp3', midi: 93 },
  { file: 'A7.mp3', midi: 105 },
  // C notes (pitch class 0) - C1-C8 available
  { file: 'C1.mp3', midi: 24 }, { file: 'C2.mp3', midi: 36 }, { file: 'C3.mp3', midi: 48 },
  { file: 'C4.mp3', midi: 60 }, { file: 'C5.mp3', midi: 72 }, { file: 'C6.mp3', midi: 84 },
  { file: 'C7.mp3', midi: 96 }, { file: 'C8.mp3', midi: 108 },
  // D# notes (pitch class 3) - Ds1-Ds7 available
  { file: 'Ds1.mp3', midi: 27 }, { file: 'Ds2.mp3', midi: 39 }, { file: 'Ds3.mp3', midi: 51 },
  { file: 'Ds4.mp3', midi: 63 }, { file: 'Ds5.mp3', midi: 75 }, { file: 'Ds6.mp3', midi: 87 },
  { file: 'Ds7.mp3', midi: 99 },
  // F# notes (pitch class 6) - Fs1-Fs7 available
  { file: 'Fs1.mp3', midi: 30 }, { file: 'Fs2.mp3', midi: 42 }, { file: 'Fs3.mp3', midi: 54 },
  { file: 'Fs4.mp3', midi: 66 }, { file: 'Fs5.mp3', midi: 78 }, { file: 'Fs6.mp3', midi: 90 },
  { file: 'Fs7.mp3', midi: 102 },
  // Additional notes for better coverage - B, E, F, G
  { file: 'B1.mp3', midi: 23 }, { file: 'B2.mp3', midi: 35 }, { file: 'B3.mp3', midi: 47 },
  { file: 'B4.mp3', midi: 59 }, { file: 'B5.mp3', midi: 71 }, { file: 'B6.mp3', midi: 83 },
  { file: 'B7.mp3', midi: 95 },
  { file: 'E1.mp3', midi: 28 }, { file: 'E2.mp3', midi: 40 }, { file: 'E3.mp3', midi: 52 },
  { file: 'E4.mp3', midi: 64 }, { file: 'E5.mp3', midi: 76 }, { file: 'E6.mp3', midi: 88 },
  { file: 'E7.mp3', midi: 100 },
  { file: 'F1.mp3', midi: 29 }, { file: 'F2.mp3', midi: 41 }, { file: 'F3.mp3', midi: 53 },
  { file: 'F4.mp3', midi: 65 }, { file: 'F5.mp3', midi: 77 }, { file: 'F6.mp3', midi: 89 },
  { file: 'F7.mp3', midi: 101 },
  { file: 'G1.mp3', midi: 31 }, { file: 'G2.mp3', midi: 43 }, { file: 'G3.mp3', midi: 55 },
  { file: 'G4.mp3', midi: 67 }, { file: 'G5.mp3', midi: 79 }, { file: 'G6.mp3', midi: 91 },
  { file: 'G7.mp3', midi: 103 },
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

  async quickStart(onProgress: (loaded: number, total: number) => void): Promise<void> {
    // Load only the most common notes for immediate usability
    const essentialFiles = ['A4.mp3', 'C4.mp3', 'F4.mp3', 'G4.mp3', 'D4.mp3', 'E4.mp3', 'B4.mp3']
    const total = essentialFiles.length
    let loaded = 0
    onProgress(loaded, total)

    // Check what's already cached
    const uncached = essentialFiles.filter(file => !this.cache.has(file))
    
    if (uncached.length === 0) return

    // Load essential files in parallel for fastest startup
    await Promise.allSettled(
      uncached.map(async file => {
        try {
          await this.loadSample(file)
        } catch (e) {
          console.warn(`Quick start failed for ${file}:`, e)
        } finally {
          loaded++
          onProgress(loaded, total)
        }
      })
    )
  }

  async preloadAll(onProgress: (loaded: number, total: number) => void): Promise<void> {
    const files = SAMPLE_FILES.map(s => s.file)
    const total = files.length
    let loaded = 0
    onProgress(loaded, total)

    // Load in batches of 10 to avoid overwhelming the network
    const BATCH_SIZE = 10
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE)
      await Promise.allSettled(
        batch.map(async file => {
          try {
            await this.loadSample(file)
          } catch (e) {
            console.warn(`Preload failed for ${file}:`, e)
          } finally {
            loaded++
            onProgress(loaded, total)
          }
        })
      )
    }
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
