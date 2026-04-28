/**
 * Centralized style/theme tokens for the ix CLI's visual language.
 *
 * Every glyph, indent, connector, and header rendering rule lives here.
 * Renderers (PhaseTable, Listing, future helpers) import from this module
 * — never hand-roll spacing or colors. Tweak here to retheme the CLI.
 */

import pc from "picocolors";
import { ORBIT_SPINNER, type PhaseState } from "@agent-ix/ix-ui-semantic";
import { colors, blue } from "./colors.js";

export type { PhaseState };
export { ORBIT_SPINNER };

// ── Layout ──────────────────────────────────────────────────────────────────
// Planet/marker is always at column 1, preceded by exactly one character
// (a satellite glyph or a space). Row glyphs sit at column 4 (one indent past
// the planet). Header phase indicators are exactly PHASE_WIDTH chars so the
// bracketed text starts at the same column in every state.

export const PLANET_COL = 1;
/** Indent for body rows (•, ○ glyphs). */
export const ROW_INDENT = "    ";
/** Indent for error messages — aligns under the row name. */
export const ERROR_INDENT = "        ";
/** Header indicator width — keeps `[ … ]` aligned across spinner/pass/fail. */
export const PHASE_WIDTH = 4;
/** Advance the orbit glyph every N ticks (3 × 80 ms = 240 ms). */
export const HEADER_TICK_DIV = 3;

// ── Connectors ──────────────────────────────────────────────────────────────
// Top connector aligns with the planet (col 1). Tail connector sits 3 cols
// past the row indent so the • of the summary lands fully under body content.

/** Opener: `' └──┐'` under the orbit header. */
export const ROUTE_INDENT = pc.dim(" └──┐");
/** Tail prefix (no glyph): indented under content + `└──`, glyph appended by caller. */
export const ROUTE_OUT = pc.dim(ROW_INDENT + "   └──");

// ── Glyphs ──────────────────────────────────────────────────────────────────

/** Done bullet — also used for tail summaries. */
export const GLYPH_DONE = blue("•");
/** Failed bullet — outline circle. */
export const GLYPH_FAIL = colors.red("○");
/** Header fail marker — used inline (e.g. `⊗ 1 service failed`). */
export const GLYPH_FAIL_MARK = colors.red("⊗");
/** Waiting / not-yet-started task indicator. */
export const GLYPH_WAITING = pc.dim("·");
/** Cancelled — task didn't run because a sibling failed. */
export const GLYPH_CANCELLED = pc.dim("○");

// ── Header rendering ────────────────────────────────────────────────────────

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
/** Frozen "failed" header indicator — red ⊗. */
export const PHASE_FAIL: string = " " + colors.red("⊗") + "  ";

/** Animated "running" header indicator for the current tick. */
export function phaseRun(spinnerFrame: number): string {
  return colorOrbitFrame(
    ORBIT_SPINNER[
      Math.floor(spinnerFrame / HEADER_TICK_DIV) % ORBIT_SPINNER.length
    ],
  );
}

/** Wrap a header string in gray brackets with gray · separators. */
export function renderHeader(text: string): string {
  return (
    pc.gray("[") + " " + text.replace(/·/g, pc.gray("·")) + " " + pc.gray("]")
  );
}

// ── TTY control sequences ───────────────────────────────────────────────────

export const HIDE_CURSOR = "\x1b[?25l";
export const SHOW_CURSOR = "\x1b[?25h";
export const SYNC_BEGIN = "\x1b[?2026h";
export const SYNC_END = "\x1b[?2026l";
export const CLEAR_EOL = "\x1b[K";
export const moveUp = (n: number): string => (n > 0 ? `\x1b[${n}A\r` : "\r");
