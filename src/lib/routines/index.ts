import {
  BLOCKS as IRON_BLOCKS,
  DAYS as IRON_DAYS,
  DAY_ORDER as IRON_DAY_ORDER,
  DEFAULT_RMS,
  MAIN_WARMUP,
  REST_DAYS as IRON_REST_DAYS,
  TOTAL_WEEKS as IRON_TOTAL_WEEKS,
  blockOf as ironBlockOf,
  buildProgram as ironBuildProgram,
  weeklyVolumes,
} from "../program";
import { phaseOf as ironPhaseOf } from "../landmarks";
import type {
  BlockMeta,
  DayId,
  DayMeta,
  OneRMs,
  Phase,
  ProgramRow,
  RoutineId,
  RoutineMeta,
  WeeklyVolume,
} from "../types";
import * as abMeso5 from "./ab-meso-5";
import * as mavMrv5 from "./mav-mrv-5";

export type RoutineDefinition = {
  meta: RoutineMeta;
  blocks: BlockMeta[];
  days: Record<DayId, DayMeta>;
  dayOrder: DayId[];
  restDays: readonly { weekday: string; label: string; note: string }[];
  mainWarmup: string;
  buildProgram: (rms: OneRMs) => ProgramRow[];
  phaseOf: (week: number) => Phase;
  blockOf: (week: number) => BlockMeta;
  weeklyVolumes: (rows: ProgramRow[]) => WeeklyVolume[];
};

const IRON_META: RoutineMeta = {
  id: "iron-16",
  name: "16週アッパーフォーカス",
  subtitle: "肩・胸・僧帽を優先した4ブロック×4週",
  totalWeeks: IRON_TOTAL_WEEKS,
};

const iron16: RoutineDefinition = {
  meta: IRON_META,
  blocks: IRON_BLOCKS,
  days: IRON_DAYS,
  dayOrder: IRON_DAY_ORDER,
  restDays: IRON_REST_DAYS,
  mainWarmup: MAIN_WARMUP,
  buildProgram: ironBuildProgram,
  phaseOf: ironPhaseOf,
  blockOf: ironBlockOf,
  weeklyVolumes: (rows) => weeklyVolumes(rows, IRON_META.totalWeeks),
};

const mav5: RoutineDefinition = {
  meta: mavMrv5.META,
  blocks: mavMrv5.BLOCKS,
  days: mavMrv5.DAYS,
  dayOrder: mavMrv5.DAY_ORDER,
  restDays: mavMrv5.REST_DAYS,
  mainWarmup: MAIN_WARMUP,
  buildProgram: mavMrv5.buildProgram,
  phaseOf: mavMrv5.phaseOf,
  blockOf: mavMrv5.blockOf,
  weeklyVolumes: (rows) => weeklyVolumes(rows, mavMrv5.META.totalWeeks),
};

const ab5: RoutineDefinition = {
  meta: abMeso5.META,
  blocks: abMeso5.BLOCKS,
  days: abMeso5.DAYS,
  dayOrder: abMeso5.DAY_ORDER,
  restDays: abMeso5.REST_DAYS,
  mainWarmup: MAIN_WARMUP,
  buildProgram: abMeso5.buildProgram,
  phaseOf: abMeso5.phaseOf,
  blockOf: abMeso5.blockOf,
  weeklyVolumes: (rows) => weeklyVolumes(rows, abMeso5.META.totalWeeks),
};

export const ROUTINES: RoutineDefinition[] = [iron16, mav5, ab5];

export const DEFAULT_ROUTINE_ID: RoutineId = "iron-16";

export function getRoutine(id: RoutineId): RoutineDefinition {
  return ROUTINES.find((r) => r.meta.id === id) ?? iron16;
}

export function isRoutineId(value: string): value is RoutineId {
  return value === "iron-16" || value === "mav-mrv-5" || value === "ab-meso-5";
}

export { DEFAULT_RMS };
