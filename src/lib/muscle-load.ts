import { MUSCLE_LABEL } from "./landmarks";
import type { Muscle, MuscleContribution } from "./types";

/** Primary / co-primary hard-set credit. */
export const W1 = 1 as const;
/** Major secondary (fractional) credit. */
export const W05 = 0.5 as const;

function load(
  ...entries: [Muscle, 1 | 0.5][]
): MuscleContribution[] {
  return entries.map(([muscle, weight]) => ({ muscle, weight }));
}

/** Shared exercise → muscle credit presets (fractional counting). */
export const LOAD = {
  bench: load(["chest", W1], ["triceps", W05], ["shoulders", W05]),
  spoto: load(["chest", W1], ["triceps", W05], ["shoulders", W05]),
  ohp: load(["shoulders", W1], ["triceps", W05]),
  cgbp: load(["chest", W1], ["triceps", W1]),
  floor: load(["chest", W1], ["triceps", W1]),
  incline: load(["chest", W1], ["shoulders", W05], ["triceps", W05]),
  deadlift: load(["posterior", W1], ["traps", W05]),
  rdl: load(["posterior", W1]),
  nordic: load(["posterior", W1]),
  squat: load(["quads", W1], ["posterior", W05]),
  frontSquat: load(["quads", W1], ["posterior", W05]),
  row: load(["back", W1], ["biceps", W05], ["traps", W05]),
  chin: load(["back", W1], ["biceps", W1]),
  shrug: load(["traps", W1]),
  upright: load(["shoulders", W1], ["traps", W1]),
  lateral: load(["shoulders", W1]),
  rearDelt: load(["shoulders", W1]),
  curl: load(["biceps", W1]),
  triceps: load(["triceps", W1]),
} as const;

export function muscleLabel(muscles: MuscleContribution[]): string {
  return muscles
    .map((c) => {
      const base = MUSCLE_LABEL[c.muscle];
      return c.weight === 1 ? base : `${base}×0.5`;
    })
    .join("・");
}

export function accumulateSets(
  sets: Record<Muscle, number>,
  muscles: MuscleContribution[],
  hardSets: number,
): void {
  for (const c of muscles) {
    sets[c.muscle] += hardSets * c.weight;
  }
}

/** Format weekly set totals for UI (one decimal when fractional). */
export function formatSetCount(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
