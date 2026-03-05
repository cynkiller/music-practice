import { useCallback, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import { noteFromSemitone, DIFFICULTY_CONFIGS } from '../lib/musicTheory.ts';
import type { Difficulty } from '../types/index.ts';

// Note name to MIDI number
function noteToMidi(note: string): number {
  const noteNames: Record<string, number> = {
    C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3,
    E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8,
    Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
  };
  const match = note.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) return 69;
  const [, name, octave] = match;
  return 12 * (parseInt(octave) + 1) + (noteNames[name] ?? 0);
}

function noteToFrequency(note: string): number {
  return 440 * Math.pow(2, (noteToMidi(note) - 69) / 12);
}

export function useAudio() {
  const audioCtxRef = useRef<any>(null);
  const [isLoading] = useState(false);
  const activeNodesRef = useRef<Array<{ oscillator: any; gain: any }>>([]);

  const getCtx = useCallback((): any => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = (Taro as any).createWebAudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const stopAll = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    activeNodesRef.current.forEach(({ oscillator, gain }) => {
      try {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        oscillator.stop(ctx.currentTime);
      } catch (_) {}
    });
    activeNodesRef.current = [];
  }, []);

  const scheduleTone = useCallback(
    (note: string, durationSec: number, startTime: number) => {
      const ctx = getCtx();
      const freq = noteToFrequency(note);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      // Piano-like ADSR envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.1, startTime + durationSec * 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + durationSec);

      const entry = { oscillator: osc, gain };
      activeNodesRef.current.push(entry);

      const delayMs = (startTime - ctx.currentTime + durationSec) * 1000 + 200;
      setTimeout(() => {
        activeNodesRef.current = activeNodesRef.current.filter(n => n !== entry);
      }, delayMs);
    },
    [getCtx]
  );

  const playInterval = useCallback(
    (rootNote: string, semitones: number, difficulty: Difficulty) => {
      stopAll();
      const config = DIFFICULTY_CONFIGS[difficulty];
      const dur = config.noteDurationMs / 1000;
      const gap = config.gapMs / 1000;
      const ctx = getCtx();
      const now = ctx.currentTime;
      scheduleTone(rootNote, dur, now);
      scheduleTone(noteFromSemitone(rootNote, semitones), dur, now + dur + gap);
    },
    [getCtx, scheduleTone, stopAll]
  );

  const playChord = useCallback(
    (rootNote: string, intervals: number[], difficulty: Difficulty) => {
      stopAll();
      const config = DIFFICULTY_CONFIGS[difficulty];
      const dur = config.noteDurationMs / 1000;
      const ctx = getCtx();
      const now = ctx.currentTime;
      intervals.forEach(s => scheduleTone(noteFromSemitone(rootNote, s), dur, now));
    },
    [getCtx, scheduleTone, stopAll]
  );

  const playArpeggio = useCallback(
    (rootNote: string, intervals: number[], difficulty: Difficulty) => {
      stopAll();
      const config = DIFFICULTY_CONFIGS[difficulty];
      const dur = config.noteDurationMs / 1000;
      const gap = config.gapMs / 1000;
      const ctx = getCtx();
      const now = ctx.currentTime;
      intervals.forEach((s, i) =>
        scheduleTone(noteFromSemitone(rootNote, s), dur, now + i * (dur + gap))
      );
    },
    [getCtx, scheduleTone, stopAll]
  );

  const playNote = useCallback(
    (note: string, durationMs = 800) => {
      const ctx = getCtx();
      scheduleTone(note, durationMs / 1000, ctx.currentTime);
    },
    [getCtx, scheduleTone]
  );

  return { playInterval, playChord, playArpeggio, playNote, stopAll, isLoading };
}
