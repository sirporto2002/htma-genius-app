// src/lib/scoreDeltaExplainer.ts
// Rule-based "Why This Changed" engine
// Tied to locked health score semantics.
// Version: 1.0.0 (2025-12-21)

import {
  HEALTH_SCORE_WEIGHTS,
  HEALTH_SCORE_SEMANTICS_VERSION,
} from "./healthScoreSemantics";

/**
 * We assume your snapshots already contain:
 * - minerals: record of mineral values (15 TEI minerals)
 * - ratios: record of ratios (Ca/Mg, Na/K, Ca/P, Zn/Cu, Fe/Cu, Ca/K)
 * - score: number (0-100)
 * - grade: optional
 * - flags: optional red flags list (strings or keys)
 *
 * Keep these types flexible so we don't break existing stored analyses.
 */
export type MineralKey =
  | "Ca"
  | "Mg"
  | "Na"
  | "K"
  | "Cu"
  | "Zn"
  | "P"
  | "Fe"
  | "Mn"
  | "Cr"
  | "Se"
  | "B"
  | "Co"
  | "Mo"
  | "S";

export type RatioKey = "Ca/Mg" | "Na/K" | "Ca/P" | "Zn/Cu" | "Fe/Cu" | "Ca/K";

export type Status = "low" | "optimal" | "high";

export type DeltaDriverType = "mineral" | "ratio" | "redFlag";

export type DeltaDriver = {
  type: DeltaDriverType;
  key: string;
  from: Status | "none";
  to: Status | "none";
  direction: "improved" | "worsened" | "unchanged";
  impactPoints: number; // signed points contribution to score delta
  note: string; // short human explanation
};

export type ScoreDeltaExplanation = {
  engine: {
    name: "scoreDeltaExplainer";
    version: "1.0.0";
    semanticsVersion: string; // from your locked semantics module
  };
  delta: number; // next.score - prev.score (rounded)
  headline: string;
  summary: string;
  topDrivers: DeltaDriver[]; // sorted by absolute impact desc
  allDrivers: DeltaDriver[]; // full list
};

/**
 * If your semantics module exports ranges, wire them in and delete these fallbacks.
 * These fallbacks are conservative and can be replaced safely later.
 */
const MINERAL_RANGES_FALLBACK: Record<
  MineralKey,
  { lowMax: number; optimalMax: number }
> = {
  Ca: { lowMax: 35, optimalMax: 55 },
  Mg: { lowMax: 4.0, optimalMax: 7.0 },
  Na: { lowMax: 20, optimalMax: 50 },
  K: { lowMax: 8, optimalMax: 18 },
  Cu: { lowMax: 1.0, optimalMax: 2.5 },
  Zn: { lowMax: 10, optimalMax: 18 },
  P: { lowMax: 14, optimalMax: 18 },
  Fe: { lowMax: 1.5, optimalMax: 3.5 },
  Mn: { lowMax: 0.01, optimalMax: 0.08 },
  Cr: { lowMax: 0.02, optimalMax: 0.12 },
  Se: { lowMax: 0.05, optimalMax: 0.16 },
  B: { lowMax: 0.02, optimalMax: 0.35 },
  Co: { lowMax: 0.001, optimalMax: 0.01 },
  Mo: { lowMax: 0.01, optimalMax: 0.08 },
  S: { lowMax: 4000, optimalMax: 5200 },
};

const RATIO_RANGES_FALLBACK: Record<
  RatioKey,
  { lowMax: number; optimalMax: number }
> = {
  "Ca/Mg": { lowMax: 6, optimalMax: 10 },
  "Na/K": { lowMax: 1.8, optimalMax: 2.8 },
  "Ca/P": { lowMax: 1.8, optimalMax: 2.8 },
  "Zn/Cu": { lowMax: 6, optimalMax: 12 },
  "Fe/Cu": { lowMax: 0.7, optimalMax: 1.5 },
  "Ca/K": { lowMax: 2.5, optimalMax: 6.0 },
};

function classifyByRange(
  value: number,
  range: { lowMax: number; optimalMax: number }
): Status {
  if (!Number.isFinite(value)) return "low";
  if (value <= range.lowMax) return "low";
  if (value <= range.optimalMax) return "optimal";
  return "high";
}

function direction(
  from: Status,
  to: Status
): "improved" | "worsened" | "unchanged" {
  if (from === to) return "unchanged";
  // optimal is best
  if (to === "optimal" && from !== "optimal") return "improved";
  if (from === "optimal" && to !== "optimal") return "worsened";

  // low <-> high is generally "worsened" unless moving toward optimal (we treat both non-optimal as worse)
  // This keeps the explanation conservative & consistent.
  return "worsened";
}

/**
 * Points attribution model (tied to semantics weights):
 * - Mineral portion: HEALTH_SCORE_WEIGHTS.MINERAL_WEIGHT (typically 0.60) of 100 points => 60 points pool
 * - Ratio portion:   HEALTH_SCORE_WEIGHTS.RATIO_WEIGHT   (typically 0.30) of 100 points => 30 points pool
 * - Red flags:       HEALTH_SCORE_WEIGHTS.RED_FLAG_WEIGHT (typically 0.10) of 100 points => 10 points pool
 *
 * We distribute pools evenly across tracked items (simple + auditable).
 */
function pools() {
  const mineralsPool = Math.round(100 * HEALTH_SCORE_WEIGHTS.MINERAL_WEIGHT);
  const ratiosPool = Math.round(100 * HEALTH_SCORE_WEIGHTS.RATIO_WEIGHT);
  const flagsPool = Math.round(100 * HEALTH_SCORE_WEIGHTS.RED_FLAG_WEIGHT);
  return { mineralsPool, ratiosPool, flagsPool };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/**
 * Normalize status strings from snapshots ("Optimal", "Low", "High") to lowercase
 */
function normalizeStatus(status: string | undefined): Status {
  if (!status) return "optimal";
  const normalized = status.toLowerCase();
  if (
    normalized === "optimal" ||
    normalized === "low" ||
    normalized === "high"
  ) {
    return normalized as Status;
  }
  return "optimal";
}

function makeHeadline(delta: number) {
  if (delta >= 8) return `Health Score improved by +${delta}`;
  if (delta >= 1) return `Health Score improved by +${delta}`;
  if (delta <= -8) return `Health Score declined by ${delta}`;
  if (delta <= -1) return `Health Score declined by ${delta}`;
  return "Health Score stayed about the same";
}

function makeSummary(drivers: DeltaDriver[], delta: number) {
  const improved = drivers
    .filter((d) => d.direction === "improved")
    .slice(0, 2);
  const worsened = drivers
    .filter((d) => d.direction === "worsened")
    .slice(0, 1);

  const parts: string[] = [];
  if (improved.length) {
    parts.push(
      `Main improvements: ${improved
        .map((d) => `${d.key} moved toward optimal`)
        .join(", ")}.`
    );
  }
  if (worsened.length) {
    parts.push(
      `Main limiter: ${worsened[0].key} moved away from optimal or stayed abnormal.`
    );
  }
  if (!parts.length) {
    parts.push(
      "No major drivers detected; changes were small across minerals/ratios."
    );
  }

  // Keep it short + practitioner-friendly (non-diagnostic).
  parts.push(`Net change: ${delta >= 0 ? "+" : ""}${delta} points.`);
  return parts.join(" ");
}

export function explainScoreDelta(prev: any, next: any): ScoreDeltaExplanation {
  // Extract mineral data from snapshots
  const prevMinerals = (prev?.minerals ?? {}) as Partial<
    Record<MineralKey, number>
  >;
  const nextMinerals = (next?.minerals ?? {}) as Partial<
    Record<MineralKey, number>
  >;

  // Extract ratio data from snapshots (could be objects or simple key-value maps)
  // Support both formats: { "Ca/Mg": 7.5 } and [{ name: "Ca/Mg", value: 7.5, status: "Optimal" }]
  const prevRatiosRaw = prev?.ratios ?? {};
  const nextRatiosRaw = next?.ratios ?? {};

  const prevRatios: Partial<Record<RatioKey, number>> = {};
  const nextRatios: Partial<Record<RatioKey, number>> = {};
  const prevRatioStatuses: Partial<Record<RatioKey, Status>> = {};
  const nextRatioStatuses: Partial<Record<RatioKey, Status>> = {};

  // Parse ratio data (handle array or object format)
  if (Array.isArray(prevRatiosRaw)) {
    prevRatiosRaw.forEach((r: any) => {
      const key = r.name as RatioKey;
      prevRatios[key] = r.value;
      prevRatioStatuses[key] = normalizeStatus(r.status);
    });
  } else {
    Object.keys(prevRatiosRaw).forEach((key) => {
      prevRatios[key as RatioKey] = Number(prevRatiosRaw[key]);
    });
  }

  if (Array.isArray(nextRatiosRaw)) {
    nextRatiosRaw.forEach((r: any) => {
      const key = r.name as RatioKey;
      nextRatios[key] = r.value;
      nextRatioStatuses[key] = normalizeStatus(r.status);
    });
  } else {
    Object.keys(nextRatiosRaw).forEach((key) => {
      nextRatios[key as RatioKey] = Number(nextRatiosRaw[key]);
    });
  }

  const prevFlags: string[] = Array.isArray(prev?.flags) ? prev.flags : [];
  const nextFlags: string[] = Array.isArray(next?.flags) ? next.flags : [];

  const prevScore = Number(prev?.score ?? 0);
  const nextScore = Number(next?.score ?? 0);
  const delta = round1(nextScore - prevScore);

  const { mineralsPool, ratiosPool, flagsPool } = pools();

  const mineralKeys: MineralKey[] = [
    "Ca",
    "Mg",
    "Na",
    "K",
    "Cu",
    "Zn",
    "P",
    "Fe",
    "Mn",
    "Cr",
    "Se",
    "B",
    "Co",
    "Mo",
    "S",
  ];
  const ratioKeys: RatioKey[] = [
    "Ca/Mg",
    "Na/K",
    "Ca/P",
    "Zn/Cu",
    "Fe/Cu",
    "Ca/K",
  ];

  const perMineral = mineralsPool / mineralKeys.length;
  const perRatio = ratiosPool / ratioKeys.length;

  // For flags, we attribute based on count delta (simple + auditable)
  const prevFlagCount = prevFlags.length;
  const nextFlagCount = nextFlags.length;
  const perFlag =
    nextFlagCount > 0 || prevFlagCount > 0
      ? flagsPool / Math.max(1, Math.max(prevFlagCount, nextFlagCount))
      : 0;

  const drivers: DeltaDriver[] = [];

  // Minerals
  for (const k of mineralKeys) {
    const pv = Number(prevMinerals[k] ?? 0);
    const nv = Number(nextMinerals[k] ?? 0);

    const range = MINERAL_RANGES_FALLBACK[k];
    const from = classifyByRange(pv, range);
    const to = classifyByRange(nv, range);

    const dir = direction(from, to);

    let impact = 0;
    if (dir === "improved") impact = +perMineral;
    if (dir === "worsened") impact = -perMineral;

    // If unchanged but abnormal, we give a small negative "limiter" weight (optional but helpful)
    if (dir === "unchanged" && to !== "optimal") impact = -perMineral * 0.25;

    if (impact !== 0) {
      drivers.push({
        type: "mineral",
        key: k,
        from,
        to,
        direction: dir,
        impactPoints: round1(impact),
        note:
          dir === "improved"
            ? `${k} moved closer to the optimal band.`
            : dir === "worsened"
            ? `${k} moved away from the optimal band.`
            : `${k} remained outside optimal and may be limiting progress.`,
      });
    }
  }

  // Ratios - Use actual snapshot statuses if available, otherwise calculate from values
  for (const k of ratioKeys) {
    const pv = Number(prevRatios[k] ?? 0);
    const nv = Number(nextRatios[k] ?? 0);

    // Prefer actual snapshot status, fallback to calculated status
    let from: Status;
    let to: Status;

    if (prevRatioStatuses[k] && nextRatioStatuses[k]) {
      from = prevRatioStatuses[k]!;
      to = nextRatioStatuses[k]!;
    } else {
      const range = RATIO_RANGES_FALLBACK[k];
      from = classifyByRange(pv, range);
      to = classifyByRange(nv, range);
    }

    const dir = direction(from, to);

    let impact = 0;
    if (dir === "improved") impact = +perRatio;
    if (dir === "worsened") impact = -perRatio;
    if (dir === "unchanged" && to !== "optimal") impact = -perRatio * 0.25;

    if (impact !== 0) {
      // Enhanced clinical significance notes
      const significanceMap: Record<RatioKey, string> = {
        "Ca/Mg": "thyroid/metabolic rate",
        "Na/K": "adrenal function",
        "Ca/P": "bone metabolism",
        "Zn/Cu": "immune function",
        "Fe/Cu": "oxygen transport",
        "Ca/K": "thyroid activity",
      };

      const significance = significanceMap[k] || "mineral balance";
      const fromVal = pv.toFixed(2);
      const toVal = nv.toFixed(2);

      drivers.push({
        type: "ratio",
        key: k,
        from,
        to,
        direction: dir,
        impactPoints: round1(impact),
        note:
          dir === "improved"
            ? `${k} improved (${fromVal}→${toVal}), supporting ${significance}.`
            : dir === "worsened"
            ? `${k} declined (${fromVal}→${toVal}), affecting ${significance}.`
            : `${k} remained ${to} (${toVal}), may be limiting ${significance}.`,
      });
    }
  }

  // Red flags (count-based delta attribution)
  if (perFlag > 0) {
    // If flags decreased => improvement
    if (nextFlagCount < prevFlagCount) {
      const improvedCount = prevFlagCount - nextFlagCount;
      drivers.push({
        type: "redFlag",
        key: "Red Flags",
        from: "high",
        to: "optimal",
        direction: "improved",
        impactPoints: round1(+improvedCount * perFlag),
        note: `Fewer critical flags detected (${prevFlagCount} → ${nextFlagCount}).`,
      });
    } else if (nextFlagCount > prevFlagCount) {
      const worsenedCount = nextFlagCount - prevFlagCount;
      drivers.push({
        type: "redFlag",
        key: "Red Flags",
        from: "optimal",
        to: "high",
        direction: "worsened",
        impactPoints: round1(-worsenedCount * perFlag),
        note: `More critical flags detected (${prevFlagCount} → ${nextFlagCount}).`,
      });
    } else if (nextFlagCount > 0) {
      drivers.push({
        type: "redFlag",
        key: "Red Flags",
        from: "high",
        to: "high",
        direction: "unchanged",
        impactPoints: round1(-0.25 * flagsPool),
        note: `Critical flags persisted (${nextFlagCount}).`,
      });
    }
  }

  // Sort by absolute impact (biggest drivers first)
  const sorted = [...drivers].sort(
    (a, b) => Math.abs(b.impactPoints) - Math.abs(a.impactPoints)
  );
  const topDrivers = sorted.slice(0, 6);

  return {
    engine: {
      name: "scoreDeltaExplainer",
      version: "1.0.0",
      semanticsVersion: HEALTH_SCORE_SEMANTICS_VERSION ?? "unknown",
    },
    delta,
    headline: makeHeadline(delta),
    summary: makeSummary(topDrivers, delta),
    topDrivers,
    allDrivers: sorted,
  };
}
