import { useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { noteFromSemitone } from '../lib/musicTheory.ts';
import type { Difficulty } from '../types/index.ts';
import { DIFFICULTY_CONFIGS } from '../lib/musicTheory.ts';

export function useAudio() {
  const pianoRef = useRef<Tone.Sampler | null>(null);
  const loadedRef = useRef<boolean>(false);
  const audioContextStartedRef = useRef<boolean>(false);

  const startAudioContext = useCallback(async () => {
    if (!audioContextStartedRef.current) {
      // Resume audio context if suspended (required for mobile)
      if (Tone.getContext().state === 'suspended') {
        await Tone.getContext().resume();
      }
      // Start Tone.js
      await Tone.start();
      audioContextStartedRef.current = true;
    }
  }, []);

  const ensurePiano = useCallback(async () => {
    await startAudioContext();
    
    if (!pianoRef.current) {
      pianoRef.current = new Tone.Sampler({
        urls: {
          A0: 'A0.mp3',
          C1: 'C1.mp3',
          'D#1': 'Ds1.mp3',
          'F#1': 'Fs1.mp3',
          A1: 'A1.mp3',
          C2: 'C2.mp3',
          'D#2': 'Ds2.mp3',
          'F#2': 'Fs2.mp3',
          A2: 'A2.mp3',
          C3: 'C3.mp3',
          'D#3': 'Ds3.mp3',
          'F#3': 'Fs3.mp3',
          A3: 'A3.mp3',
          C4: 'C4.mp3',
          'D#4': 'Ds4.mp3',
          'F#4': 'Fs4.mp3',
          A4: 'A4.mp3',
          C5: 'C5.mp3',
          'D#5': 'Ds5.mp3',
          'F#5': 'Fs5.mp3',
          A5: 'A5.mp3',
          C6: 'C6.mp3',
          'D#6': 'Ds6.mp3',
          'F#6': 'Fs6.mp3',
          A6: 'A6.mp3',
          C7: 'C7.mp3',
          'D#7': 'Ds7.mp3',
          'F#7': 'Fs7.mp3',
          A7: 'A7.mp3',
          C8: 'C8.mp3',
        },
        baseUrl: '/audio/',
        onload: () => {
          loadedRef.current = true;
        },
      }).toDestination();
      pianoRef.current.volume.value = -10;
    }
    // Wait for samples to load (up to 10s)
    if (!loadedRef.current) {
      await Tone.loaded();
    }
    return pianoRef.current;
  }, [startAudioContext]);

  const playInterval = useCallback(
    async (rootNote: string, semitones: number, difficulty: Difficulty) => {
      const piano = await ensurePiano();
      const config = DIFFICULTY_CONFIGS[difficulty];
      const durationSec = config.noteDurationMs / 1000;
      const gapSec = config.gapMs / 1000;

      const note1 = rootNote;
      const note2 = noteFromSemitone(rootNote, semitones);

      const now = Tone.now();
      piano.triggerAttackRelease(note1, durationSec, now);
      piano.triggerAttackRelease(note2, durationSec, now + durationSec + gapSec);
    },
    [ensurePiano]
  );

  const playChord = useCallback(
    async (rootNote: string, intervals: number[], difficulty: Difficulty) => {
      const piano = await ensurePiano();
      const config = DIFFICULTY_CONFIGS[difficulty];
      const durationSec = config.noteDurationMs / 1000;

      const notes = intervals.map(s => noteFromSemitone(rootNote, s));
      piano.triggerAttackRelease(notes, durationSec);
    },
    [ensurePiano]
  );

  const playArpeggio = useCallback(
    async (rootNote: string, intervals: number[], difficulty: Difficulty) => {
      const piano = await ensurePiano();
      const config = DIFFICULTY_CONFIGS[difficulty];
      const durationSec = config.noteDurationMs / 1000;
      const gapSec = config.gapMs / 1000;

      const notes = intervals.map(s => noteFromSemitone(rootNote, s));
      const now = Tone.now();
      notes.forEach((note, i) => {
        piano.triggerAttackRelease(note, durationSec, now + i * (durationSec + gapSec));
      });
    },
    [ensurePiano]
  );

  const playNote = useCallback(
    async (note: string, durationMs = 800) => {
      const piano = await ensurePiano();
      piano.triggerAttackRelease(note, durationMs / 1000);
    },
    [ensurePiano]
  );

  return { playInterval, playChord, playArpeggio, playNote };
}
