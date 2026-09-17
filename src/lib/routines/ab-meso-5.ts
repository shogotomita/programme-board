import { PHASE_LABEL } from "../landmarks";
import { LOAD, muscleLabel } from "../muscle-load";
import { formatKg, percentOf, roundTo2p5 } from "../rm";
import type {
  BlockMeta,
  DayId,
  DayMeta,
  LiftId,
  MuscleContribution,
  OneRMs,
  Phase,
  ProgramRow,
  RoutineMeta,
} from "../types";

export const META: RoutineMeta = {
  id: "ab-meso-5",
  name: "A/B メゾ 5週",
  subtitle: "スクワット日とデッド日を交互 · 蓄積→強化→ディロード",
  totalWeeks: 5,
};

export const BLOCKS: BlockMeta[] = [
  {
    id: 1,
    name: "A/B メゾ",
    subtitle: "1–2週蓄積、3–4週強化、5週ディロード",
    weeks: [1, 5],
    focus:
      "月A・火B・水A・木B・金A。メインは%1RMで波動、補助はレップとRPEで波動。終了後に1RMを再推定して次サイクルへ。",
  },
];

export const DAYS: Record<DayId, DayMeta> = {
  A: {
    weekday: "月",
    weekdayShort: "月",
    session: "スクワットの日",
    dayName: "Day A",
  },
  B: {
    weekday: "火",
    weekdayShort: "火",
    session: "デッドの日",
    dayName: "Day B",
  },
  C: {
    weekday: "水",
    weekdayShort: "水",
    session: "スクワットの日",
    dayName: "Day A",
  },
  D: {
    weekday: "木",
    weekdayShort: "木",
    session: "デッドの日",
    dayName: "Day B",
  },
  E: {
    weekday: "金",
    weekdayShort: "金",
    session: "スクワットの日",
    dayName: "Day A",
  },
};

export const DAY_ORDER: DayId[] = ["A", "B", "C", "D", "E"];

export const REST_DAYS = [
  {
    weekday: "土",
    label: "完全休養",
    note: "リフトもBJJも入れない。歩行と食事・睡眠だけ。1マイルランはここかDay A翌日。",
  },
  {
    weekday: "日",
    label: "BJJ（トレなし）",
    note: "ウエイトは禁止。ロールは通常通り。強化期で疲労が重なったら補助の最終セットを切る。",
  },
] as const;

export function phaseOf(week: number): Phase {
  if (week <= 1) return "mav";
  if (week <= 3) return "build";
  if (week === 4) return "mrv";
  return "deload";
}

export function blockOf(_week: number): BlockMeta {
  void _week;
  return BLOCKS[0];
}

/** Main lifts: squat / bench / deadlift. */
const MAIN = {
  pct: [0.675, 0.7, 0.775, 0.825, 0.525] as const,
  reps: ["10", "8-9", "6", "4-5", "5"] as const,
  sets: [3, 4, 4, 4, 2] as const,
  rpe: [7, 7, 8, 8.5, 5] as const,
};

/** OHP: main −5%, fewer sets. */
const OHP = {
  pct: [0.625, 0.65, 0.725, 0.775, 0.475] as const,
  reps: MAIN.reps,
  sets: [3, 3, 3, 3, 2] as const,
  rpe: MAIN.rpe,
};

/** Close-grip / incline: main −7.5% of bench 1RM. */
const PRESS_ACC = {
  pct: [0.6, 0.625, 0.7, 0.75, 0.45] as const,
  reps: MAIN.reps,
  sets: [3, 3, 3, 3, 2] as const,
  rpe: [6.5, 7, 7.5, 8, 5] as const,
};

const ACC = {
  reps: ["15-20", "12-15", "10-12", "8-10", "15"] as const,
  rpe: [6, 7, 7.5, 8, 5] as const,
  sets: {
    lateral: [3, 3, 3, 3, 2] as const,
    chin: [4, 4, 4, 4, 2] as const,
    curl: [3, 3, 3, 3, 2] as const,
    shrug: [3, 3, 3, 3, 2] as const,
    nordic: [3, 3, 3, 3, 2] as const,
  },
  nordicReps: ["12-15", "10-12", "8-10", "6-8", "12"] as const,
};

function weekIndex(week: number): 0 | 1 | 2 | 3 | 4 {
  return Math.min(4, Math.max(0, week - 1)) as 0 | 1 | 2 | 3 | 4;
}

function restLabel(sec: number): string {
  if (sec >= 180) return `${sec / 60}分`;
  if (sec >= 60) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s ? `${m}分${s}秒` : `${m}分`;
  }
  return `${sec}秒`;
}

function accessoryKg(baseKg: number, week: number, stepKg = 2.5): number {
  if (week >= 5) return roundTo2p5(baseKg * 0.85);
  return roundTo2p5(baseKg + stepKg * (week - 1));
}

function bwDisplay(
  bodyweight: number,
  added: number,
): { kg: number; display: string } {
  const kg = roundTo2p5(bodyweight + added);
  if (added <= 0) return { kg, display: "自重" };
  return { kg, display: `自重+${formatKg(added)}` };
}

function chinAdded(week: number): number {
  if (week >= 5) return 0;
  if (week <= 1) return 0;
  if (week === 2) return 2.5;
  if (week === 3) return 5;
  return 7.5;
}

function lateralKg(week: number): number {
  if (week >= 5) return 5;
  if (week <= 2) return 7.5;
  if (week === 3) return 10;
  return 12.5;
}

type Slot = {
  key: string;
  name: string;
  day: DayId;
  order: number;
  muscles: MuscleContribution[];
  restSec: number;
  notes: string;
  bjjNote: string;
  isMain: boolean;
  liftId: LiftId | null;
  sets: (week: number) => number;
  reps: (week: number) => string;
  rpe: (week: number) => number;
  load: (
    rms: OneRMs,
    week: number,
  ) => { kg: number; display: string; pct: number | null };
};

function mainLoad(
  lift: LiftId,
  pctTable: readonly number[],
): Slot["load"] {
  return (rms, week) => {
    const pct = pctTable[weekIndex(week)] ?? pctTable[0];
    const kg = percentOf(rms[lift], pct);
    return { kg, display: formatKg(kg), pct };
  };
}

/** Day A template exercises (expanded onto Mon/Wed/Fri). */
type Template = Omit<Slot, "day" | "key"> & { keyBase: string };

const DAY_A_TEMPLATES: Template[] = [
  {
    keyBase: "sq",
    name: "スクワット",
    order: 1,
    muscles: LOAD.squat,
    restSec: 180,
    notes: "深さは落とさない。2レップ余裕を残す。",
    bjjNote: "",
    isMain: true,
    liftId: "squat",
    sets: (w) => MAIN.sets[weekIndex(w)],
    reps: (w) => MAIN.reps[weekIndex(w)],
    rpe: (w) => MAIN.rpe[weekIndex(w)],
    load: mainLoad("squat", MAIN.pct),
  },
  {
    keyBase: "bp",
    name: "ベンチプレス",
    order: 2,
    muscles: LOAD.bench,
    restSec: 180,
    notes: "肩甲骨を固定。トップまで伸ばし切る。",
    bjjNote: "",
    isMain: true,
    liftId: "bench",
    sets: (w) => MAIN.sets[weekIndex(w)],
    reps: (w) => MAIN.reps[weekIndex(w)],
    rpe: (w) => MAIN.rpe[weekIndex(w)],
    load: mainLoad("bench", MAIN.pct),
  },
  {
    keyBase: "ohp",
    name: "オーバーヘッドプレス",
    order: 3,
    muscles: LOAD.ohp,
    restSec: 150,
    notes: "ストリクト。神経系疲労が大きいので%はメイン表より−5%。",
    bjjNote: "",
    isMain: true,
    liftId: "ohp",
    sets: (w) => OHP.sets[weekIndex(w)],
    reps: (w) => OHP.reps[weekIndex(w)],
    rpe: (w) => OHP.rpe[weekIndex(w)],
    load: mainLoad("ohp", OHP.pct),
  },
  {
    keyBase: "lateral",
    name: "プレートサイドレイズ",
    order: 4,
    muscles: LOAD.lateral,
    restSec: 60,
    notes: "肩の高さ直前で止める。下部で伸張位を1秒。",
    bjjNote: "",
    isMain: false,
    liftId: null,
    sets: (w) => ACC.sets.lateral[weekIndex(w)],
    reps: (w) => ACC.reps[weekIndex(w)],
    rpe: (w) => ACC.rpe[weekIndex(w)],
    load: (_rms, week) => {
      const kg = lateralKg(week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  {
    keyBase: "cgbp",
    name: "クローズグリップベンチプレス",
    order: 5,
    muscles: LOAD.cgbp,
    restSec: 120,
    notes: "握りは肩幅。メイン%より−7.5%の重量感。",
    bjjNote: "フレームとポストの肘伸展。",
    isMain: false,
    liftId: null,
    sets: (w) => PRESS_ACC.sets[weekIndex(w)],
    reps: (w) => PRESS_ACC.reps[weekIndex(w)],
    rpe: (w) => PRESS_ACC.rpe[weekIndex(w)],
    load: (rms, week) => {
      const pct = PRESS_ACC.pct[weekIndex(week)];
      const kg = percentOf(rms.bench, pct);
      return { kg, display: formatKg(kg), pct };
    },
  },
];

const DAY_B_TEMPLATES: Template[] = [
  {
    keyBase: "dl",
    name: "デッドリフト",
    order: 1,
    muscles: LOAD.deadlift,
    restSec: 240,
    notes: "床を足で押す。ロックアウトで肩をすくめない。",
    bjjNote: "日曜BJJまで回復を残す。強化期は補助を先に切る。",
    isMain: true,
    liftId: "deadlift",
    sets: (w) => MAIN.sets[weekIndex(w)],
    reps: (w) => MAIN.reps[weekIndex(w)],
    rpe: (w) => MAIN.rpe[weekIndex(w)],
    load: mainLoad("deadlift", MAIN.pct),
  },
  {
    keyBase: "chin",
    name: "懸垂（自重）",
    order: 2,
    muscles: LOAD.chin,
    restSec: 120,
    notes: "胸をバーへ。加重できるならRPEに合わせて加重。",
    bjjNote: "ガードリテンションの二頭。",
    isMain: false,
    liftId: null,
    sets: (w) => ACC.sets.chin[weekIndex(w)],
    reps: (w) => ACC.reps[weekIndex(w)],
    rpe: (w) => ACC.rpe[weekIndex(w)],
    load: (rms, week) => {
      const load = bwDisplay(rms.bodyweight, chinAdded(week));
      return { ...load, pct: null };
    },
  },
  {
    keyBase: "incline",
    name: "インクラインバーベルベンチプレス",
    order: 3,
    muscles: LOAD.incline,
    restSec: 120,
    notes: "上胸。メイン%より−7.5%の重量感。",
    bjjNote: "",
    isMain: false,
    liftId: null,
    sets: (w) => PRESS_ACC.sets[weekIndex(w)],
    reps: (w) => PRESS_ACC.reps[weekIndex(w)],
    rpe: (w) => PRESS_ACC.rpe[weekIndex(w)],
    load: (rms, week) => {
      const pct = PRESS_ACC.pct[weekIndex(week)];
      const kg = percentOf(rms.bench, pct);
      return { kg, display: formatKg(kg), pct };
    },
  },
  {
    keyBase: "curl",
    name: "バーベルカール",
    order: 4,
    muscles: LOAD.curl,
    restSec: 60,
    notes: "肘を体側。下ろし3秒。",
    bjjNote: "クローズドガードの引き。",
    isMain: false,
    liftId: null,
    sets: (w) => ACC.sets.curl[weekIndex(w)],
    reps: (w) => ACC.reps[weekIndex(w)],
    rpe: (w) => ACC.rpe[weekIndex(w)],
    load: (_rms, week) => {
      const kg = accessoryKg(30, week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  {
    keyBase: "shrug",
    name: "バーベルシュラッグ",
    order: 5,
    muscles: LOAD.shrug,
    restSec: 75,
    notes: "肩を耳へ。回転させない。1秒収縮。DL%で引かない。",
    bjjNote: "",
    isMain: false,
    liftId: null,
    sets: (w) => ACC.sets.shrug[weekIndex(w)],
    reps: (w) => ACC.reps[weekIndex(w)],
    rpe: (w) => ACC.rpe[weekIndex(w)],
    load: (_rms, week) => {
      const kg = accessoryKg(50, week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  {
    keyBase: "nordic",
    name: "ノルディックハムストリングカール",
    order: 6,
    muscles: LOAD.nordic,
    restSec: 90,
    notes: "自重。膝を支点にゆっくり下ろす。補助が必要ならバンドや手で調整。",
    bjjNote: "",
    isMain: false,
    liftId: null,
    sets: (w) => ACC.sets.nordic[weekIndex(w)],
    reps: (w) => ACC.nordicReps[weekIndex(w)],
    rpe: (w) => ACC.rpe[weekIndex(w)],
    load: (rms) => {
      const load = bwDisplay(rms.bodyweight, 0);
      return { ...load, pct: null };
    },
  },
];

const WEEKDAY_KIND: { day: DayId; kind: "A" | "B" }[] = [
  { day: "A", kind: "A" },
  { day: "B", kind: "B" },
  { day: "C", kind: "A" },
  { day: "D", kind: "B" },
  { day: "E", kind: "A" },
];

function expandSlots(): Slot[] {
  const slots: Slot[] = [];
  for (const { day, kind } of WEEKDAY_KIND) {
    const templates = kind === "A" ? DAY_A_TEMPLATES : DAY_B_TEMPLATES;
    for (const t of templates) {
      const { keyBase, ...rest } = t;
      slots.push({
        ...rest,
        day,
        key: `${keyBase}-${day.toLowerCase()}`,
      });
    }
  }
  return slots;
}

const SLOTS = expandSlots();

function makeRow(slot: Slot, week: number, rms: OneRMs): ProgramRow {
  const phase = phaseOf(week);
  const block = blockOf(week);
  const meta = DAYS[slot.day];
  const load = slot.load(rms, week);
  const pctDisplay =
    load.pct == null ? null : Math.round(load.pct * 1000) / 10;

  return {
    id: `ab5-w${week}-${slot.day}-${slot.order}-${slot.key}`,
    week,
    block: block.id,
    blockName: block.name,
    phase,
    phaseLabel: PHASE_LABEL[phase],
    dayId: slot.day,
    dayName: meta.dayName,
    weekday: meta.weekday,
    session: meta.session,
    order: slot.order,
    exercise: slot.name,
    isMain: slot.isMain,
    liftId: slot.liftId,
    sets: slot.sets(week),
    reps: slot.reps(week),
    weightKg: load.kg,
    displayWeight: load.display,
    percent1RM: pctDisplay,
    rpe: slot.rpe(week),
    restSec: restLabel(slot.restSec),
    muscles: slot.muscles,
    muscleLabel: muscleLabel(slot.muscles),
    notes: week >= 5 ? `ディロード。${slot.notes}` : slot.notes,
    bjjNote: slot.bjjNote,
  };
}

export function buildProgram(rms: OneRMs): ProgramRow[] {
  const rows: ProgramRow[] = [];
  for (let week = 1; week <= META.totalWeeks; week++) {
    for (const slot of SLOTS) {
      rows.push(makeRow(slot, week, rms));
    }
  }
  return rows.sort((a, b) => {
    if (a.week !== b.week) return a.week - b.week;
    const d = DAY_ORDER.indexOf(a.dayId) - DAY_ORDER.indexOf(b.dayId);
    if (d !== 0) return d;
    return a.order - b.order;
  });
}
