import { describe, it, expect } from "vitest";
import {
  PHASE_GLYPHS,
  STATUS_DOTS,
  BRAILLE_SPINNER,
  HEADER_SPINNER,
} from "../src/index.js";
import type { PhaseState } from "../src/index.js";

const ALL_STATES: PhaseState[] = [
  "pending",
  "queued",
  "running",
  "done",
  "failed",
];

describe("PHASE_GLYPHS", () => {
  it("has an entry for every PhaseState", () => {
    for (const state of ALL_STATES) {
      expect(PHASE_GLYPHS[state]).toBeDefined();
    }
  });

  it("pending and done/failed are not animated", () => {
    expect(PHASE_GLYPHS.pending.animated).toBe(false);
    expect(PHASE_GLYPHS.done.animated).toBe(false);
    expect(PHASE_GLYPHS.failed.animated).toBe(false);
  });

  it("queued and running are animated", () => {
    expect(PHASE_GLYPHS.queued.animated).toBe(true);
    expect(PHASE_GLYPHS.running.animated).toBe(true);
  });

  it("each glyph has non-empty tty and nonTty strings", () => {
    for (const state of ALL_STATES) {
      expect(PHASE_GLYPHS[state].tty.length).toBeGreaterThan(0);
      expect(PHASE_GLYPHS[state].nonTty.length).toBeGreaterThan(0);
    }
  });
});

describe("STATUS_DOTS", () => {
  it("has done, failed, pending entries", () => {
    expect(STATUS_DOTS.done).toBe("●");
    expect(STATUS_DOTS.failed).toBe("○");
    expect(STATUS_DOTS.pending).toBe("·");
  });
});

describe("spinners", () => {
  it("BRAILLE_SPINNER has 10 frames", () => {
    expect(BRAILLE_SPINNER).toHaveLength(10);
  });

  it("HEADER_SPINNER has 4 frames", () => {
    expect(HEADER_SPINNER).toHaveLength(4);
  });

  it("spinner frames are non-empty strings", () => {
    for (const frame of BRAILLE_SPINNER) {
      expect(typeof frame).toBe("string");
      expect(frame.length).toBeGreaterThan(0);
    }
    for (const frame of HEADER_SPINNER) {
      expect(typeof frame).toBe("string");
      expect(frame.length).toBeGreaterThan(0);
    }
  });
});

// TC-002: FR-001-AC-2 — PhaseState has exactly 5 members
// TC-004: FR-003-AC-2 — PHASE_GLYPHS has exactly 5 entries
describe("PhaseState", () => {
  it("has exactly 5 members and PHASE_GLYPHS keys match exactly", () => {
    const states: PhaseState[] = [
      "pending",
      "queued",
      "running",
      "done",
      "failed",
    ];
    expect(states).toHaveLength(5);
    // Exhaustive check: PHASE_GLYPHS keys == exactly these 5 states
    expect(Object.keys(PHASE_GLYPHS).sort()).toEqual([...states].sort());
  });
});

// TC-012: FR-007-AC-1 — package.json has no runtime dependencies
describe("zero runtime dependencies", () => {
  it("package.json has no runtime dependencies", async () => {
    const { createRequire } = await import("node:module");
    const req = createRequire(import.meta.url);
    const pkg = req("../package.json") as {
      dependencies?: Record<string, string>;
    };
    const depCount = Object.keys(pkg.dependencies ?? {}).length;
    expect(depCount).toBe(0);
  });
});
