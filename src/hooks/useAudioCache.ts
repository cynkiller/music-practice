import { useCallback } from 'react'
import Taro from '@tarojs/taro'

// Base URL for piano samples (you can host these anywhere)
// IMPORTANT: Update this URL to point to your audio files
// See AUDIO_HOSTING.md for instructions
const AUDIO_BASE_URL = 'https://tonejs.github.io/audio/salamander' // Using Tone.js samples as fallback

// Additional fallback: Use GitHub Pages (you can replace this)
const FALLBACK_AUDIO_URL = 'https://raw.githubusercontent.com/cynkiller/music-practice/mini-program/public/audio'

// List of all piano samples
const PIANO_SAMPLE_PATHS = [
  'A0.mp3', 'A1.mp3', 'A2.mp3', 'A3.mp3', 'A4.mp3', 'A5.mp3', 'A6.mp3', 'A7.mp3',
  'C1.mp3', 'C2.mp3', 'C3.mp3', 'C4.mp3', 'C5.mp3', 'C6.mp3', 'C7.mp3', 'C8.mp3',
  'Ds1.mp3', 'Ds2.mp3', 'Ds3.mp3', 'Ds4.mp3', 'Ds5.mp3', 'Ds6.mp3', 'Ds7.mp3',
  'Fs1.mp3', 'Fs2.mp3', 'Fs3.mp3', 'Fs4.mp3', 'Fs5.mp3', 'Fs6.mp3', 'Fs7.mp3'
]

// Map notes to available piano samples
const PIANO_SAMPLES: Record<string, string> = {
  // A notes
  'A0': 'A0.mp3', 'A1': 'A1.mp3', 'A2': 'A2.mp3', 'A3': 'A3.mp3',
  'A4': 'A4.mp3', 'A5': 'A5.mp3', 'A6': 'A6.mp3', 'A7': 'A7.mp3',
  // C notes
  'C1': 'C1.mp3', 'C2': 'C2.mp3', 'C3': 'C3.mp3', 'C4': 'C4.mp3',
  'C5': 'C5.mp3', 'C6': 'C6.mp3', 'C7': 'C7.mp3', 'C8': 'C8.mp3',
  // C#/D♭ notes (using Ds files)
  'C#1': 'Ds1.mp3', 'C#2': 'Ds2.mp3', 'C#3': 'Ds3.mp3', 'C#4': 'Ds4.mp3',
  'C#5': 'Ds5.mp3', 'C#6': 'Ds6.mp3', 'C#7': 'Ds7.mp3',
  'Db1': 'Ds1.mp3', 'Db2': 'Ds2.mp3', 'Db3': 'Ds3.mp3', 'Db4': 'Ds4.mp3',
  'Db5': 'Ds5.mp3', 'Db6': 'Ds6.mp3', 'Db7': 'Ds7.mp3',
  // D♯ notes
  'D#1': 'Ds1.mp3', 'D#2': 'Ds2.mp3', 'D#3': 'Ds3.mp3', 'D#4': 'Ds4.mp3',
  'D#5': 'Ds5.mp3', 'D#6': 'Ds6.mp3', 'D#7': 'Ds7.mp3',
  // E♭ notes (same as D#)
  'Eb1': 'Ds1.mp3', 'Eb2': 'Ds2.mp3', 'Eb3': 'Ds3.mp3', 'Eb4': 'Ds4.mp3',
  'Eb5': 'Ds5.mp3', 'Eb6': 'Ds6.mp3', 'Eb7': 'Ds7.mp3',
  // F♯ notes
  'F#1': 'Fs1.mp3', 'F#2': 'Fs2.mp3', 'F#3': 'Fs3.mp3', 'F#4': 'Fs4.mp3',
  'F#5': 'Fs5.mp3', 'F#6': 'Fs6.mp3', 'F#7': 'Fs7.mp3',
  // G♭ notes (same as F#)
  'Gb1': 'Fs1.mp3', 'Gb2': 'Fs2.mp3', 'Gb3': 'Fs3.mp3', 'Gb4': 'Fs4.mp3',
  'Gb5': 'Fs5.mp3', 'Gb6': 'Fs6.mp3', 'Gb7': 'Fs7.mp3',
}

export class AudioCache {
  private cache = new Map<string, AudioBuffer>()
  private loadingPromises = new Map<string, Promise<AudioBuffer>>()
  private ctx: AudioContext

  constructor(ctx: AudioContext) {
    this.ctx = ctx
  }

  async loadSample(filename: string): Promise<AudioBuffer> {
    // Check if already cached
    if (this.cache.has(filename)) {
      return this.cache.get(filename)!
    }

    // Check if currently loading
    if (this.loadingPromises.has(filename)) {
      return this.loadingPromises.get(filename)!
    }

    // Load and cache
    const loadPromise = this.downloadAndCache(filename)
    this.loadingPromises.set(filename, loadPromise)
    
    try {
      const buffer = await loadPromise
      this.cache.set(filename, buffer)
      return buffer
    } finally {
      this.loadingPromises.delete(filename)
    }
  }

  private async downloadAndCache(filename: string): Promise<AudioBuffer> {
    try {
      // Try to load from local cache first
      const cachedBuffer = await this.loadFromLocalStorage(filename)
      if (cachedBuffer) {
        return cachedBuffer
      }
    } catch (e) {
      console.warn(`Failed to load ${filename} from local cache:`, e)
    }

    // Download from internet
    const urls = [
      `${AUDIO_BASE_URL}/${filename}`,
      `${FALLBACK_AUDIO_URL}/${filename}`
    ]
    
    let arrayBuffer: ArrayBuffer | null = null
    let lastError: Error | null = null
    
    for (const url of urls) {
      try {
        console.log(`Downloading audio sample: ${url}`)
        
        // Try Taro.request first, fallback to fetch if not available
        let response: any
        
        if (Taro && Taro.request) {
          // Use Taro's request API for WeChat Mini Program compatibility
          response = await Taro.request({
            url,
            method: 'GET',
            responseType: 'arraybuffer',
            timeout: 10000 // 10 second timeout
          })
        } else {
          // Fallback to regular fetch (for development/testing)
          console.log('Taro.request not available, using fetch fallback')
          const fetchResponse = await fetch(url)
          if (!fetchResponse.ok) {
            throw new Error(`HTTP ${fetchResponse.status}`)
          }
          response = {
            statusCode: fetchResponse.status,
            data: await fetchResponse.arrayBuffer()
          }
        }
        
        console.log(`Response status: ${response.statusCode}, data length: ${response.data?.byteLength || 0}`)
        
        if (response.statusCode === 200 && response.data) {
          arrayBuffer = response.data
          break
        } else {
          throw new Error(`HTTP ${response.statusCode}`)
        }
      } catch (error) {
        console.warn(`Failed to download from ${url}:`, error)
        lastError = error as Error
        continue
      }
    }
    
    if (!arrayBuffer) {
      throw lastError || new Error(`Failed to download ${filename} from all sources`)
    }
    
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer)

    // Save to local cache for future use
    try {
      await this.saveToLocalStorage(filename, arrayBuffer)
    } catch (e) {
      console.warn(`Failed to cache ${filename} locally:`, e)
    }

    return audioBuffer
  }

  private async loadFromLocalStorage(filename: string): Promise<AudioBuffer | null> {
    try {
      const dirPath = `${Taro.env.USER_DATA_PATH}/audio`
      const filePath = `${dirPath}/${filename}`
      
      // Check if file exists
      try {
        const fs = Taro.getFileSystemManager()
        const stats = fs.statSync(filePath)
        if (!stats) return null
      } catch (e) {
        // File doesn't exist
        return null
      }

      // Read file
      const fs = Taro.getFileSystemManager()
      const data = fs.readFileSync(filePath)
      if (data) {
        console.log(`Loading ${filename} from cache, data type: ${typeof data}, length: ${(data as any)?.byteLength || (data as any)?.length || 'unknown'}`)
        
        // Handle different data formats that might have been saved
        let buffer: ArrayBuffer
        
        if (data instanceof ArrayBuffer) {
          buffer = data
        } else if (data instanceof Uint8Array) {
          buffer = data.buffer
        } else if (typeof data === 'string') {
          // Handle base64 string
          try {
            const binaryString = atob(data)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }
            buffer = bytes.buffer
          } catch (e) {
            console.warn(`Failed to decode base64 for ${filename}:`, e)
            return null
          }
        } else if (Array.isArray(data)) {
          // Handle plain array
          const uint8Array = new Uint8Array(data)
          buffer = uint8Array.buffer
        } else {
          console.warn(`Unknown data type for ${filename}:`, typeof data)
          return null
        }
        
        return await this.ctx.decodeAudioData(buffer)
      }
    } catch (e) {
      console.warn(`Failed to load ${filename} from local cache:`, e)
    }
    return null
  }

  private async saveToLocalStorage(filename: string, arrayBuffer: ArrayBuffer): Promise<void> {
    try {
      const fs = Taro.getFileSystemManager()
      const dirPath = `${Taro.env.USER_DATA_PATH}/audio`
      const filePath = `${dirPath}/${filename}`
      
      // Ensure directory exists
      try {
        fs.mkdirSync(dirPath, true)
      } catch (e) {
        // Directory might already exist
      }

      // Save file - convert ArrayBuffer to the correct format for Taro
      console.log(`Saving ${filename}, original ArrayBuffer length: ${arrayBuffer.byteLength}`)
      
      // Taro's writeFileSync expects the data to be in a specific format
      // Try different approaches to find what works
      try {
        // Method 0: Try raw ArrayBuffer first
        fs.writeFileSync(filePath, arrayBuffer)
        console.log(`Successfully cached audio sample: ${filename} (method 0 - raw ArrayBuffer)`)
      } catch (e0) {
        console.warn(`Method 0 failed:`, e0)
        const uint8Array = new Uint8Array(arrayBuffer)
        console.log(`Trying with Uint8Array, length: ${uint8Array.length}`)
        
        try {
          // Method 1: Try as Uint8Array directly
          fs.writeFileSync(filePath, uint8Array as any)
          console.log(`Successfully cached audio sample: ${filename} (method 1 - Uint8Array)`)
        } catch (e1) {
          console.warn(`Method 1 failed:`, e1)
          try {
            // Method 2: Convert to base64 string
            const base64 = btoa(String.fromCharCode(...uint8Array))
            fs.writeFileSync(filePath, base64)
            console.log(`Successfully cached audio sample: ${filename} (method 2 - base64)`)
          } catch (e2) {
            console.warn(`Method 2 failed:`, e2)
            try {
              // Method 3: Convert to plain array
              const array = Array.from(uint8Array)
              fs.writeFileSync(filePath, array as any)
              console.log(`Successfully cached audio sample: ${filename} (method 3 - array)`)
            } catch (e3) {
              console.error(`All methods failed for ${filename}:`, e3)
              throw e3
            }
          }
        }
      }
    } catch (e) {
      console.error(`Failed to save ${filename} to local cache:`, e)
    }
  }

  // Preload commonly used samples
  async preloadCommonSamples(): Promise<void> {
    const commonSamples = ['C4.mp3', 'A4.mp3', 'Ds4.mp3', 'Fs4.mp3'] // Common notes in middle range
    
    await Promise.allSettled(
      commonSamples.map(sample => this.loadSample(sample))
    )
  }

  getStats() {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size,
      total: PIANO_SAMPLE_PATHS.length
    }
  }

  async getSample(note: string): Promise<AudioBuffer | null> {
    const normalizedNote = normalizeNoteName(note)
    const filename = PIANO_SAMPLES[normalizedNote]
    
    console.log(`Note request: "${note}" -> normalized: "${normalizedNote}" -> filename: "${filename}"`)
    
    if (!filename) {
      console.warn(`No sample available for note: ${note} (normalized: ${normalizedNote})`)
      console.log(`Available keys in PIANO_SAMPLES:`, Object.keys(PIANO_SAMPLES).slice(0, 10), '...')
      return null
    }

    try {
      console.log(`Loading sample for ${note} (${filename})`)
      const buffer = await this.loadSample(filename)
      console.log(`Successfully loaded sample for ${note}`)
      return buffer
    } catch (error) {
      console.error(`Failed to load sample for ${note}:`, error)
      return null
    }
  }
}

export function useAudioCache(ctx: AudioContext) {
  const cache = new AudioCache(ctx)

  const getSample = useCallback(async (note: string): Promise<AudioBuffer | null> => {
    return await cache.getSample(note)
  }, [cache])

  const preloadCommon = useCallback(() => {
    return cache.preloadCommonSamples()
  }, [cache])

  const getStats = useCallback(() => {
    return cache.getStats()
  }, [cache])

  return {
    getSample,
    preloadCommon,
    getStats
  }
}

function normalizeNoteName(note: string): string {
  const match = note.match(/^([A-G][#b]?)(\d+)$/)
  if (!match) return note
  
  let [, noteName, octave] = match
  octave = octave.padStart(1, '0')
  
  return `${noteName}${octave}`
}
