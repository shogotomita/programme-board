import { PHASE_LABEL, MUSCLE_LABEL } from "../landmarks";
import { formatKg, percentOf, roundTo2p5 } from "../rm";
import type {
  BlockMeta,
  DayId,
  DayMeta,
  LiftId,
  Muscle,
  OneRMs,
  Phase,
  ProgramRow,
  RoutineMeta,
} from "../types";

export const META: RoutineMeta = {
  id: "mav-mrv-5",
  name: "MAV→MRV 5週",
  subtitle: "Push / Pull / Legs / Upper / Lower · 4週蓄積＋1週ディロード",
  totalWeeks: 5,
};

export const BLOCKS: BlockMeta[] = [
  {
    id: 1,
    name: "MAV→MRV",
    subtitle: "ボリュームと強度を週ごとに積み、5週目でディロード",
    weeks: [1, 5],
    focus:
      "月Push・火Pull・水Legs・木Upper・金Lower。レップは落としつつセットと%1RMを上げ、優先部位をMAV中位からMRV上位へ。",
  },
];

export const DAYS: Record<DayId, DayMeta> = {
  A: {
    weekday: "月",
    weekdayShort: "月",
    session: "Push",
    dayName: "Day A",
  },
  B: {
    weekday: "火",
    weekdayShort: "火",
    session: "Pull",
    dayName: "Day B",
  },
  C: {
    weekday: "水",
    weekdayShort: "水",
    session: "Legs",
    dayName: "Day C",
  },
  D: {
    weekday: "木",
    weekdayShort: "木",
    session: "Upper",
    dayName: "Day D",
  },
  E: {
    weekday: "金",
    weekdayShort: "金",
    session: "Lower",
    dayName: "Day E",
  },
};

export const DAY_ORDER: DayId[] = ["A", "B", "C", "D", "E"];

export const REST_DAYS = [
  {
    weekday: "土",
    label: "完全休養",
    note: "リフトもBJJも入れない。歩行と食事・睡眠だけ。",
  },
  {
    weekday: "日",
    label: "BJJ（トレなし）",
    note: "ウエイトは禁止。ロールは通常通り。",
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

function rpeFor(phase: Phase, isMain: boolean): number {
  if (phase === "deload") return isMain ? 5 : 6;
  if (phase === "mrv") return isMain ? 8.5 : 9;
  if (phase === "build") return isMain ? 8 : 8.5;
  return isMain ? 7.5 : 8;
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

function muscleLabel(muscles: Muscle[]): string {
  return muscles.map((m) => MUSCLE_LABEL[m]).join("・");
}

function halfSets(sets: number): number {
  return Math.max(1, Math.round(sets / 2));
}

/** 5週サイクル用。W1–4は線形、W5はディロード（≈85%）。 */
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
  if (week === 1) return 7.5;
  if (week === 2) return 7.5;
  if (week === 3) return 10;
  return 12.5;
}

type Slot = {
  key: string;
  name: string;
  day: DayId;
  order: number;
  muscles: Muscle[];
  restSec: number;
  notes: string;
  bjjNote: string;
  isMain: boolean;
  liftId: LiftId | null;
  /** Working weeks 1–4; deload derived. */
  work: Record<1 | 2 | 3 | 4, { sets: number; reps: string; pct: number | null }>;
  load: (rms: OneRMs, week: number) => { kg: number; display: string; pct: number | null };
};

const SLOTS: Slot[] = [
  // —— Mon Push ——
  {
    key: "bp-hyp-a",
    name: "ベンチプレス",
    day: "A",
    order: 1,
    muscles: ["chest"],
    restSec: 180,
    notes: "肥大セット。肩甲骨を固定し、2レップ余裕。",
    bjjNote: "",
    isMain: true,
    liftId: "bench",
    work: {
      1: { sets: 3, reps: "15", pct: 0.55 },
      2: { sets: 5, reps: "12", pct: 0.6 },
      3: { sets: 5, reps: "10", pct: 0.65 },
      4: { sets: 6, reps: "8", pct: 0.7 },
    },
    load: (rms, week) => {
      const pct =
        week >= 5 ? 0.55 * 0.85 : ([0.55, 0.6, 0.65, 0.7][week - 1] ?? 0.55);
      const kg = percentOf(rms.bench, pct);
      return { kg, display: formatKg(kg), pct };
    },
  },
  {
    key: "bp-str-a",
    name: "ベンチプレス",
    day: "A",
    order: 2,
    muscles: ["chest"],
    restSec: 210,
    notes: "強度セット。トップまで伸ばし切る。",
    bjjNote: "",
    isMain: true,
    liftId: "bench",
    work: {
      1: { sets: 2, reps: "5", pct: 0.75 },
      2: { sets: 3, reps: "4", pct: 0.8 },
      3: { sets: 3, reps: "3", pct: 0.85 },
      4: { sets: 4, reps: "2", pct: 0.9 },
    },
    load: (rms, week) => {
      const pct =
        week >= 5 ? 0.75 * 0.85 : ([0.75, 0.8, 0.85, 0.9][week - 1] ?? 0.75);
      const kg = percentOf(rms.bench, pct);
      return { kg, display: formatKg(kg), pct };
    },
  },
  {
    key: "ohp-a",
    name: "オーバーヘッドプレス",
    day: "A",
    order: 3,
    muscles: ["shoulders"],
    restSec: 150,
    notes: "ストリクト。脚の反動は使わない。",
    bjjNote: "",
    isMain: true,
    liftId: "ohp",
    work: {
      1: { sets: 4, reps: "15", pct: 0.55 },
      2: { sets: 4, reps: "12", pct: 0.6 },
      3: { sets: 5, reps: "10", pct: 0.65 },
      4: { sets: 5, reps: "8", pct: 0.7 },
    },
    load: (rms, week) => {
      const pct =
        week >= 5 ? 0.55 * 0.85 : ([0.55, 0.6, 0.65, 0.7][week - 1] ?? 0.55);
      const kg = percentOf(rms.ohp, pct);
      return { kg, display: formatKg(kg), pct };
    },
  },
  {
    key: "incline-a",
    name: "インクラインプレス",
    day: "A",
    order: 4,
    muscles: ["chest", "shoulders"],
    restSec: 120,
    notes: "上胸。肘は体のやや前方。バーベルまたはダンベル可。",
    bjjNote: "",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 3, reps: "15", pct: null },
      2: { sets: 3, reps: "12", pct: null },
      3: { sets: 5, reps: "10", pct: null },
      4: { sets: 6, reps: "8", pct: null },
    },
    load: (rms, week) => {
      const base = percentOf(rms.bench, 0.55);
      const kg = accessoryKg(base, week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  {
    key: "lateral-a",
    name: "プレートサイドレイズ",
    day: "A",
    order: 5,
    muscles: ["shoulders"],
    restSec: 60,
    notes: "肩の高さ直前で止める。下部で伸張位を1秒。",
    bjjNote: "",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 3, reps: "15", pct: null },
      2: { sets: 4, reps: "12", pct: null },
      3: { sets: 5, reps: "10", pct: null },
      4: { sets: 6, reps: "8", pct: null },
    },
    load: (_rms, week) => {
      const kg = lateralKg(week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  // —— Tue Pull ——
  {
    key: "dl-b",
    name: "デッドリフト",
    day: "B",
    order: 1,
    muscles: ["posterior"],
    restSec: 240,
    notes: "床を足で押す。ロックアウトで肩をすくめない。",
    bjjNote: "火曜実施。日曜BJJまで中2日以上空く。",
    isMain: true,
    liftId: "deadlift",
    work: {
      1: { sets: 3, reps: "5", pct: 0.75 },
      2: { sets: 4, reps: "4", pct: 0.8 },
      3: { sets: 4, reps: "3", pct: 0.85 },
      4: { sets: 5, reps: "2", pct: 0.9 },
    },
    load: (rms, week) => {
      const pct =
        week >= 5 ? 0.75 * 0.85 : ([0.75, 0.8, 0.85, 0.9][week - 1] ?? 0.75);
      const kg = percentOf(rms.deadlift, pct);
      return { kg, display: formatKg(kg), pct };
    },
  },
  {
    key: "chin-b",
    name: "チンアップ（アンダーグリップ）",
    day: "B",
    order: 2,
    muscles: ["back", "biceps"],
    restSec: 120,
    notes: "AMRAP。胸をバーへ。規定回数に届かなければレストポーズ。",
    bjjNote: "ガードリテンションの二頭。",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 4, reps: "AMRAP", pct: null },
      2: { sets: 4, reps: "AMRAP", pct: null },
      3: { sets: 5, reps: "AMRAP", pct: null },
      4: { sets: 6, reps: "AMRAP", pct: null },
    },
    load: (rms, week) => {
      const load = bwDisplay(rms.bodyweight, chinAdded(week));
      return { ...load, pct: null };
    },
  },
  {
    key: "row-b",
    name: "ベントオーバーロウ",
    day: "B",
    order: 3,
    muscles: ["back"],
    restSec: 120,
    notes: "体幹は床とほぼ平行。デッド後なので重量は欲張らない。",
    bjjNote: "プルとクローズの姿勢。",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 4, reps: "15", pct: null },
      2: { sets: 5, reps: "12", pct: null },
      3: { sets: 6, reps: "10", pct: null },
      4: { sets: 6, reps: "8", pct: null },
    },
    load: (rms, week) => {
      const base = percentOf(rms.deadlift, 0.285);
      const kg = accessoryKg(base, week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  {
    key: "shrug-b",
    name: "バーベルシュラッグ",
    day: "B",
    order: 4,
    muscles: ["traps"],
    restSec: 75,
    notes: "肩を耳へ。回転させない。1秒収縮。",
    bjjNote: "",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 3, reps: "15", pct: null },
      2: { sets: 4, reps: "12", pct: null },
      3: { sets: 5, reps: "10", pct: null },
      4: { sets: 6, reps: "8", pct: null },
    },
    load: (rms, week) => {
      const base = percentOf(rms.deadlift, 0.285);
      const kg = accessoryKg(base, week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  // —— Wed Legs ——
  {
    key: "fs-c",
    name: "フロントスクワット",
    day: "C",
    order: 1,
    muscles: ["quads"],
    restSec: 180,
    notes: "肘を高く、胴を立てたまま。",
    bjjNote: "",
    isMain: true,
    liftId: "squat",
    work: {
      1: { sets: 3, reps: "15", pct: 0.5 },
      2: { sets: 4, reps: "12", pct: 0.55 },
      3: { sets: 4, reps: "10", pct: 0.6 },
      4: { sets: 5, reps: "8", pct: 0.65 },
    },
    load: (rms, week) => {
      const pct =
        week >= 5 ? 0.5 * 0.85 : ([0.5, 0.55, 0.6, 0.65][week - 1] ?? 0.5);
      const kg = percentOf(rms.squat, pct);
      return { kg, display: formatKg(kg), pct };
    },
  },
  {
    key: "bs-c",
    name: "バックスクワット",
    day: "C",
    order: 2,
    muscles: ["quads"],
    restSec: 210,
    notes: "深さは落とさない。フロントのあとなので無理に伸ばさない。",
    bjjNote: "",
    isMain: true,
    liftId: "squat",
    work: {
      1: { sets: 2, reps: "5", pct: 0.7 },
      2: { sets: 3, reps: "4", pct: 0.75 },
      3: { sets: 3, reps: "3", pct: 0.8 },
      4: { sets: 3, reps: "2", pct: 0.85 },
    },
    load: (rms, week) => {
      const pct =
        week >= 5 ? 0.7 * 0.85 : ([0.7, 0.75, 0.8, 0.85][week - 1] ?? 0.7);
      const kg = percentOf(rms.squat, pct);
      return { kg, display: formatKg(kg), pct };
    },
  },
  {
    key: "rdl-c",
    name: "ルーマニアンデッドリフト",
    day: "C",
    order: 3,
    muscles: ["posterior"],
    restSec: 150,
    notes: "膝は軽く曲げ、ハムの伸びを感じたら戻す。",
    bjjNote: "ヒップヒンジ。",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 3, reps: "15", pct: null },
      2: { sets: 4, reps: "12", pct: null },
      3: { sets: 5, reps: "10", pct: null },
      4: { sets: 6, reps: "8", pct: null },
    },
    load: (rms, week) => {
      const base = percentOf(rms.deadlift, 0.55);
      const kg = accessoryKg(base, week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  {
    key: "curl-c",
    name: "バーベルカール",
    day: "C",
    order: 4,
    muscles: ["biceps"],
    restSec: 60,
    notes: "脚日の腕仕上げ。肘を体側、下ろし3秒。",
    bjjNote: "クローズドガードの引き。",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 3, reps: "15", pct: null },
      2: { sets: 4, reps: "12", pct: null },
      3: { sets: 5, reps: "10", pct: null },
      4: { sets: 6, reps: "8", pct: null },
    },
    load: (_rms, week) => {
      const kg = accessoryKg(30, week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  {
    key: "skull-c",
    name: "スカルクラッシャー",
    day: "C",
    order: 5,
    muscles: ["triceps"],
    restSec: 75,
    notes: "額のやや後ろへ。肘を開かない。",
    bjjNote: "エビ・ポストの肘伸ばし。",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 3, reps: "15", pct: null },
      2: { sets: 4, reps: "12", pct: null },
      3: { sets: 5, reps: "10", pct: null },
      4: { sets: 6, reps: "8", pct: null },
    },
    load: (rms, week) => {
      const base = percentOf(rms.bench, 0.28);
      const kg = accessoryKg(base, week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  // —— Thu Upper ——
  {
    key: "bp-str-d",
    name: "ベンチプレス",
    day: "D",
    order: 1,
    muscles: ["chest"],
    restSec: 210,
    notes: "強度寄り。月曜肥大のあとなのでフォーム優先。",
    bjjNote: "",
    isMain: true,
    liftId: "bench",
    work: {
      1: { sets: 2, reps: "5", pct: 0.75 },
      2: { sets: 2, reps: "4", pct: 0.8 },
      3: { sets: 3, reps: "3", pct: 0.85 },
      4: { sets: 4, reps: "2", pct: 0.9 },
    },
    load: (rms, week) => {
      const pct =
        week >= 5 ? 0.75 * 0.85 : ([0.75, 0.8, 0.85, 0.9][week - 1] ?? 0.75);
      const kg = percentOf(rms.bench, pct);
      return { kg, display: formatKg(kg), pct };
    },
  },
  {
    key: "ohp-d",
    name: "オーバーヘッドプレス",
    day: "D",
    order: 2,
    muscles: ["shoulders"],
    restSec: 150,
    notes: "月曜OHPの2本目。やや軽くても軌道を守る。",
    bjjNote: "",
    isMain: true,
    liftId: "ohp",
    work: {
      1: { sets: 3, reps: "15", pct: 0.5 },
      2: { sets: 4, reps: "12", pct: 0.55 },
      3: { sets: 4, reps: "10", pct: 0.6 },
      4: { sets: 5, reps: "8", pct: 0.65 },
    },
    load: (rms, week) => {
      const pct =
        week >= 5 ? 0.5 * 0.85 : ([0.5, 0.55, 0.6, 0.65][week - 1] ?? 0.5);
      const kg = percentOf(rms.ohp, pct);
      return { kg, display: formatKg(kg), pct };
    },
  },
  {
    key: "chin-d",
    name: "チンアップ（アンダーグリップ）",
    day: "D",
    order: 3,
    muscles: ["back", "biceps"],
    restSec: 120,
    notes: "AMRAP。火曜よりセットは少なめ。",
    bjjNote: "",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 3, reps: "AMRAP", pct: null },
      2: { sets: 4, reps: "AMRAP", pct: null },
      3: { sets: 5, reps: "AMRAP", pct: null },
      4: { sets: 6, reps: "AMRAP", pct: null },
    },
    load: (rms, week) => {
      const load = bwDisplay(rms.bodyweight, chinAdded(week));
      return { ...load, pct: null };
    },
  },
  {
    key: "cgbp-d",
    name: "クローズグリップベンチ",
    day: "D",
    order: 4,
    muscles: ["chest", "triceps"],
    restSec: 120,
    notes: "握りは肩幅。三頭と内側胸。",
    bjjNote: "フレームとポストの肘伸展。",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 3, reps: "15", pct: null },
      2: { sets: 4, reps: "12", pct: null },
      3: { sets: 5, reps: "10", pct: null },
      4: { sets: 6, reps: "8", pct: null },
    },
    load: (rms, week) => {
      const base = percentOf(rms.bench, 0.62);
      const kg = accessoryKg(base, week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  {
    key: "curl-d",
    name: "バーベルカール",
    day: "D",
    order: 5,
    muscles: ["biceps"],
    restSec: 60,
    notes: "水曜カールと合わせて週2。",
    bjjNote: "",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 3, reps: "15", pct: null },
      2: { sets: 4, reps: "12", pct: null },
      3: { sets: 5, reps: "10", pct: null },
      4: { sets: 6, reps: "8", pct: null },
    },
    load: (_rms, week) => {
      const kg = accessoryKg(30, week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  // —— Fri Lower ——
  {
    key: "fs-e",
    name: "フロントスクワット",
    day: "E",
    order: 1,
    muscles: ["quads"],
    restSec: 180,
    notes: "水曜よりやや控えめでも可。深さは維持。",
    bjjNote: "",
    isMain: true,
    liftId: "squat",
    work: {
      1: { sets: 3, reps: "15", pct: 0.5 },
      2: { sets: 3, reps: "12", pct: 0.55 },
      3: { sets: 4, reps: "10", pct: 0.6 },
      4: { sets: 5, reps: "8", pct: 0.65 },
    },
    load: (rms, week) => {
      const pct =
        week >= 5 ? 0.5 * 0.85 : ([0.5, 0.55, 0.6, 0.65][week - 1] ?? 0.5);
      const kg = percentOf(rms.squat, pct);
      return { kg, display: formatKg(kg), pct };
    },
  },
  {
    key: "bs-e",
    name: "バックスクワット",
    day: "E",
    order: 2,
    muscles: ["quads"],
    restSec: 210,
    notes: "日曜BJJ前なのでRPEを守る。",
    bjjNote: "",
    isMain: true,
    liftId: "squat",
    work: {
      1: { sets: 2, reps: "5", pct: 0.7 },
      2: { sets: 2, reps: "4", pct: 0.75 },
      3: { sets: 3, reps: "3", pct: 0.8 },
      4: { sets: 3, reps: "2", pct: 0.85 },
    },
    load: (rms, week) => {
      const pct =
        week >= 5 ? 0.7 * 0.85 : ([0.7, 0.75, 0.8, 0.85][week - 1] ?? 0.7);
      const kg = percentOf(rms.squat, pct);
      return { kg, display: formatKg(kg), pct };
    },
  },
  {
    key: "rdl-e",
    name: "ルーマニアンデッドリフト",
    day: "E",
    order: 3,
    muscles: ["posterior"],
    restSec: 150,
    notes: "ハムの伸びを優先。腰を丸めない。",
    bjjNote: "",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 3, reps: "15", pct: null },
      2: { sets: 4, reps: "12", pct: null },
      3: { sets: 5, reps: "10", pct: null },
      4: { sets: 6, reps: "8", pct: null },
    },
    load: (rms, week) => {
      const base = percentOf(rms.deadlift, 0.55);
      const kg = accessoryKg(base, week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  {
    key: "lateral-e",
    name: "プレートサイドレイズ",
    day: "E",
    order: 4,
    muscles: ["shoulders"],
    restSec: 60,
    notes: "下半身日の肩分散枠。軽めでも可。",
    bjjNote: "",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 3, reps: "15", pct: null },
      2: { sets: 4, reps: "12", pct: null },
      3: { sets: 5, reps: "10", pct: null },
      4: { sets: 6, reps: "8", pct: null },
    },
    load: (_rms, week) => {
      const kg = lateralKg(week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
  {
    key: "shrug-e",
    name: "バーベルシュラッグ",
    day: "E",
    order: 5,
    muscles: ["traps"],
    restSec: 75,
    notes: "RDL後の僧帽仕上げ。収縮1秒。",
    bjjNote: "",
    isMain: false,
    liftId: null,
    work: {
      1: { sets: 3, reps: "15", pct: null },
      2: { sets: 4, reps: "12", pct: null },
      3: { sets: 5, reps: "10", pct: null },
      4: { sets: 6, reps: "8", pct: null },
    },
    load: (rms, week) => {
      const base = percentOf(rms.deadlift, 0.27);
      const kg = accessoryKg(base, week);
      return { kg, display: formatKg(kg), pct: null };
    },
  },
];

function makeRow(slot: Slot, week: number, rms: OneRMs): ProgramRow {
  const phase = phaseOf(week);
  const block = blockOf(week);
  const meta = DAYS[slot.day];
  const workWeek = (Math.min(4, Math.max(1, week)) as 1 | 2 | 3 | 4);
  const base = slot.work[workWeek];
  const sets = week >= 5 ? halfSets(slot.work[1].sets) : base.sets;
  const reps = week >= 5 ? slot.work[1].reps : base.reps;
  const load = slot.load(rms, week);
  const pctDisplay =
    load.pct == null ? null : Math.round(load.pct * 1000) / 10;

  return {
    id: `m5-w${week}-${slot.day}-${slot.order}-${slot.key}`,
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
    sets,
    reps,
    weightKg: load.kg,
    displayWeight: load.display,
    percent1RM: pctDisplay,
    rpe: rpeFor(phase, slot.isMain),
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
