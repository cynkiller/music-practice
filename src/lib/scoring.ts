import type { Difficulty } from '../types/index.ts';

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  normal: 1.5,
  hard: 2.5,
};

const BASE_POINTS = 100;
const COMBO_BONUS = 25;
const MAX_COMBO_MULTIPLIER = 5;
const SPEED_BONUS_THRESHOLD_MS = 3000;
const MAX_SPEED_BONUS = 50;

export function calculateScore(
  difficulty: Difficulty,
  combo: number,
  responseTimeMs: number
): number {
  const diffMult = DIFFICULTY_MULTIPLIER[difficulty];
  const comboMult = Math.min(1 + combo * 0.1, MAX_COMBO_MULTIPLIER);
  const comboBonus = combo * COMBO_BONUS;

  let speedBonus = 0;
  if (responseTimeMs < SPEED_BONUS_THRESHOLD_MS) {
    speedBonus = Math.round(
      MAX_SPEED_BONUS * (1 - responseTimeMs / SPEED_BONUS_THRESHOLD_MS)
    );
  }

  return Math.round((BASE_POINTS + comboBonus + speedBonus) * diffMult * comboMult);
}

export function getLevelUpThreshold(level: number): number {
  return 800 + level * 200;
}
