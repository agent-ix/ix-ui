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

import pc from "picocolors";
import { ORBIT_SPINNER, type PhaseState } from "@agent-ix/ix-ui-semantic";
import { colors, blue } from "./colors.js";

export type { PhaseState };
export { ORBIT_SPINNER, colors, blue };

// ── Layout ──────────────────────────────────────────────────────────────────

/** Column at which the orbit/marker glyph sits in every header line. */
export const PLANET_COL = 1;
/** Indent for body rows (•, ○ glyphs). 3 spaces — aligns under route opener `└─┐`. */
export const ROW_INDENT = "   ";
/** Indent for note/info text — sits 2 cols past ROW_INDENT. */
export const NOTE_INDENT = ROW_INDENT + "  ";
/** Indent for error messages — aligns under the row name. */
export const ERROR_INDENT = ROW_INDENT + "    ";
/** Indent for outer-level flow rows (pipe, preflight, completion). */
export const FLOW_INDENT = " ";
/** Header indicator width — keeps `[ … ]` aligned across spinner/pass/fail. */
export const PHASE_WIDTH = 4;
/** Advance the orbit glyph every N ticks (3 × 80 ms = 240 ms). */
export const HEADER_TICK_DIV = 3;

// ── Connectors ──────────────────────────────────────────────────────────────

/** Opener: `' └─┐'` under the orbit header. */
export const ROUTE_INDENT = pc.dim(" └─┐");
/** Tail connector: 4-space indent + 3 padding + dim `└──` (3 chars). The
 *  caller appends the tail glyph (`•` for success/warn) so the visible result
 *  is `       └──•`. The error tail does NOT use `ROUTE_OUT` — it sits at
 *  column 1 with `GLYPH_FAIL_MARK` for prominence (FR-002-AC-8). */
export const ROUTE_OUT = ROW_INDENT + pc.dim("   └──");
/** URL route connector used inside per-host ingress group blocks. The
 *  host-level ROUTE_INDENT opener already provides the visual closure that
 *  `└─` previously implied, so the URL row carries only the arrow. */
export const ROUTE_URL = ROW_INDENT + pc.dim("→");

// ── Glyphs ──────────────────────────────────────────────────────────────────

/** Done bullet — completed task rows AND success/warn tail glyph (after `└──`). */
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

/**
 * Per-glyph color the orbit frame: planet (⊙/⊚) gray, satellite (∘/⋅/⚬) blue.
 */
export function colorOrbitFrame(frame: string): string {
  return [...frame]
    .map((ch) => {
      if (ch === "⊙" || ch === "⊚") return pc.gray(ch);
      if (ch === "∘" || ch === "⋅" || ch === "⚬") return blue(ch);
      return ch;
    })
    .join("");
}

/** Frozen "passed" header indicator — orbit at rest. */
export const PHASE_PASS: string = colorOrbitFrame(ORBIT_SPINNER[5]);
/** Frozen "failed" header indicator — red ⊗, padded to PHASE_WIDTH. */
export const PHASE_FAIL: string = " " + colors.red("⊗") + "  ";

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
