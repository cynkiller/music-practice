import { useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { noteFromSemitone } from '../lib/musicTheory.ts';
import type { Difficulty } from '../types/index.ts';
import { DIFFICULTY_CONFIGS } from '../lib/musicTheory.ts';

export function useAudio() {
  const synthRef = useRef<Tone.PolySynth | null>(null);

  const ensureSynth = useCallback(async () => {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.8 },
      }).toDestination();
      synthRef.current.volume.value = -6;
    }
    return synthRef.current;
  }, []);

  const playInterval = useCallback(
    async (rootNote: string, semitones: number, difficulty: Difficulty) => {
      const synth = await ensureSynth();
      const config = DIFFICULTY_CONFIGS[difficulty];
      const durationSec = config.noteDurationMs / 1000;
      const gapSec = config.gapMs / 1000;

      const note1 = rootNote;
      const note2 = noteFromSemitone(rootNote, semitones);

      const now = Tone.now();
      synth.triggerAttackRelease(note1, durationSec, now);
      synth.triggerAttackRelease(note2, durationSec, now + durationSec + gapSec);
    },
    [ensureSynth]
  );

  const playChord = useCallback(
    async (rootNote: string, intervals: number[], difficulty: Difficulty) => {
      const synth = await ensureSynth();
      const config = DIFFICULTY_CONFIGS[difficulty];
      const durationSec = config.noteDurationMs / 1000;

      const notes = intervals.map(s => noteFromSemitone(rootNote, s));
      synth.triggerAttackRelease(notes, durationSec);
    },
    [ensureSynth]
  );

  const playArpeggio = useCallback(
    async (rootNote: string, intervals: number[], difficulty: Difficulty) => {
      const synth = await ensureSynth();
      const config = DIFFICULTY_CONFIGS[difficulty];
      const durationSec = config.noteDurationMs / 1000;
      const gapSec = config.gapMs / 1000;

      const notes = intervals.map(s => noteFromSemitone(rootNote, s));
      const now = Tone.now();
      notes.forEach((note, i) => {
        synth.triggerAttackRelease(note, durationSec, now + i * (durationSec + gapSec));
      });
    },
    [ensureSynth]
  );

  const playNote = useCallback(
    async (note: string, durationMs = 500) => {
      const synth = await ensureSynth();
      synth.triggerAttackRelease(note, durationMs / 1000);
    },
    [ensureSynth]
  );

  return { playInterval, playChord, playArpeggio, playNote };
}
