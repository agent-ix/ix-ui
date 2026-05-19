/**
 * Centralized style/theme tokens for the ix CLI design system.
 *
 * Every glyph, indent, connector, color helper, and header rendering rule
 * lives here. Components import from this module exclusively — no inline
 * literals (NFR-003).
 *
 * Cursor-control sequences are NOT in this module: Ink owns cursor
 * management. See NFR-002.
 */

import { createColors } from "picocolors";
import {
  ORBIT_SPINNER,
  orbitFrameGlyphs,
  type PhaseState,
  type OrbitCell,
  type OrbitFrame,
  type OrbitTone,
} from "@agent-ix/ix-ui-semantic";
import {
  colors,
  blue,
  orbitDim,
  orbitMedDim,
  orbitMed,
  orbitBright,
} from "./colors.js";

export type { PhaseState, OrbitCell, OrbitFrame, OrbitTone };
export { ORBIT_SPINNER, orbitFrameGlyphs, colors, blue };

const pc = createColors(true);

// ── Layout ──────────────────────────────────────────────────────────────────

/** Column at which the orbit/marker glyph sits in every header line. */
export const PLANET_COL = 2;
/** Two spaces — one nesting level. */
export const LEVEL_INDENT = "  ";
/** Indent string for nesting `level` (0 = col 0, 1 = col 2, 2 = col 4, …). */
export const indentFor = (level: number): string => LEVEL_INDENT.repeat(level);
/** Indent for body rows (•, ○ glyphs). Level-1: aligns under the `┐` of `└─┐`. */
export const ROW_INDENT = indentFor(1);
/** Indent for note/info text — sits under the row's name (level-2). */
export const NOTE_INDENT = indentFor(2);
/** Indent for error messages — sits 2 cols past NOTE_INDENT. */
export const ERROR_INDENT = indentFor(2) + "  ";
/** Indent for outer-level flow rows (pipe, preflight, completion) — col 0. */
export const FLOW_INDENT = "";
/** Header indicator width — keeps `[ … ]` aligned across spinner/pass/fail. */
export const PHASE_WIDTH = 5;
/** Advance the orbit glyph every N ticks (3 × 80 ms = 240 ms). */
export const HEADER_TICK_DIV = 3;

// ── Connectors ──────────────────────────────────────────────────────────────

/** Header-to-body connector: `┌─┘` sits directly below the orbit, with `┘`
 *  under the planet at col 2 and `┌` opening the body line at col 0. */
export const CONNECTOR_HEADER = pc.dim("┌─┘");
/** Sub-section opener: `└─┐`. Caller prepends `indentFor(level)` to nest. */
export const CONNECTOR_OPEN = pc.dim("└─┐");
/** Vertical separator between sibling top-level rows. */
export const CONNECTOR_PIPE = pc.dim("|");
/** Body opener under the header (level-0 `└─┐`, no leading indent). */
export const ROUTE_INDENT = CONNECTOR_OPEN;
/** URL route connector used inside per-host ingress group blocks (level-2:
 *  arrow at col 4, directly under the `┐` of the level-1 `└─┐` opener). */
export const ROUTE_URL = indentFor(2) + pc.dim("→");

// ── Glyphs ──────────────────────────────────────────────────────────────────

/** Done bullet — completed task rows. */
export const GLYPH_DONE = blue("•");
/** Dim body bullet — preflight and summary rows. */
export const GLYPH_DIM_DOT = pc.dim("•");
/** Dim vertical continuation marker for PhaseTable flow separators. */
export const GLYPH_PIPE = pc.dim("|");
/** Failed bullet — outline circle. */
export const GLYPH_FAIL = colors.red("○");
/** Header fail marker — used inline (e.g. `⊗ 1 service failed`). */
export const GLYPH_FAIL_MARK = colors.red("⊗");
/** Waiting / not-yet-started task indicator. */
export const GLYPH_WAITING = pc.dim("·");
/** Cancelled — task didn't run because a sibling failed. */
export const GLYPH_CANCELLED = pc.dim("○");
/** Ingress section marker. */
export const GLYPH_INGRESS = blue("◎");
/** Successful completion marker. */
export const GLYPH_COMPLETE = blue("✧");

// ── Header rendering ────────────────────────────────────────────────────────

const ORBIT_TONE: Record<OrbitTone, (s: string) => string> = {
  gray: pc.gray,
  dim: orbitDim,
  medDim: orbitMedDim,
  med: orbitMed,
  bright: orbitBright,
};

/**
 * Apply per-cell tones to an orbit frame: each non-space cell carries its
 * own tone (gray, dim, medDim, med, bright). Glyph and color together
 * encode depth — ⋅ dim = farther, ∘ bright = closer.
 */
export function colorOrbitFrame(frame: OrbitFrame): string {
  return frame
    .map((c) => (typeof c === "string" ? c : ORBIT_TONE[c.tone](c.glyph)))
    .join("");
}

/** Frozen "passed" header indicator — orbit at rest, planet alone in gray. */
export const PHASE_PASS: string = colorOrbitFrame([
  " ",
  " ",
  { glyph: "⊙", tone: "gray" },
  " ",
  " ",
]);
/** Frozen "failed" header indicator — red ⊗, padded to PHASE_WIDTH. */
export const PHASE_FAIL: string = " " + colors.red("⊗") + "   ";

/** Wrap a header string in gray brackets with gray `·` separators. */
export function renderHeader(text: string): string {
  // FR-001-AC-12: coerce embedded newlines to single spaces.
  const flat = text.replace(/\s*\r?\n\s*/g, " ");
  return (
    pc.gray("[") + " " + flat.replace(/·/g, pc.gray("·")) + " " + pc.gray("]")
  );
}

// ── Pod-status helper ───────────────────────────────────────────────────────

const POD_STATUS_RE = /^(\d+)\/(\d+)(?:(\s*·\s*)(.+))?$/;

/**
 * Color a "ready/total" pod-status string. Cyan when fully ready, yellow
 * when partial. Returns the input unchanged when it doesn't match the pattern.
 */
export function colorPods(status: string): string {
  const m = POD_STATUS_RE.exec(status);
  if (!m) return status;
  const ready = parseInt(m[1], 10);
  const total = parseInt(m[2], 10);
  const tail = m[4] ? ` · ${m[4]}` : "";
  const count = `${ready}/${total}`;
  if (ready > 0 && ready === total) {
    return pc.cyan(count) + pc.dim(tail);
  }
  if (ready > 0) return pc.yellow(count) + pc.dim(tail);
  return pc.yellow(`${ready}`) + pc.dim(`/${total}${tail}`);
}
