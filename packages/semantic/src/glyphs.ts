import type { PhaseState, PhaseGlyph } from "./types.js";

export const PHASE_GLYPHS: Record<PhaseState, PhaseGlyph> = {
  pending: { tty: "·", nonTty: "pending", animated: false },
  queued: { tty: "⏳", nonTty: "queued", animated: true },
  running: { tty: "⟳", nonTty: "running", animated: true },
  done: { tty: "✓", nonTty: "done", animated: false },
  failed: { tty: "✗", nonTty: "failed", animated: false },
};

export const STATUS_DOTS = {
  done: "●",
  failed: "○",
  pending: "·",
} as const;
