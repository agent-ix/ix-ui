import { describe, it, expect } from "vitest";
import {
  PLANET_COL,
  ROW_INDENT,
  NOTE_INDENT,
  ERROR_INDENT,
  FLOW_INDENT,
  PHASE_WIDTH,
  HEADER_TICK_DIV,
  ROUTE_INDENT,
  ROUTE_OUT,
  ROUTE_URL,
  GLYPH_DONE,
  GLYPH_DIM_DOT,
  GLYPH_PIPE,
  GLYPH_FAIL,
  GLYPH_FAIL_MARK,
  GLYPH_WAITING,
  GLYPH_CANCELLED,
  GLYPH_INGRESS,
  GLYPH_COMPLETE,
  PHASE_PASS,
  PHASE_FAIL,
  ORBIT_SPINNER,
  colorOrbitFrame,
  renderHeader,
  colorPods,
  colors,
  blue,
} from "../src/style.js";

const stripAnsi = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, "");

// FR-016-AC-2: PLANET_COL = 1
describe("FR-016-AC-2 (TC-301)", () => {
  it("PLANET_COL is 1", () => {
    expect(PLANET_COL).toBe(1);
  });
});

// FR-016-AC-3: ROW_INDENT = 3 spaces (aligns body rows under route opener `└─┐`)
describe("FR-016-AC-3 (TC-302)", () => {
  it("ROW_INDENT is exactly 3 spaces", () => {
    expect(ROW_INDENT).toBe("   ");
  });
});

// FR-016-AC-4: NOTE_INDENT = ROW_INDENT + 2 (5 spaces)
describe("FR-016-AC-4 (TC-303)", () => {
  it("NOTE_INDENT is ROW_INDENT + 2 spaces", () => {
    expect(NOTE_INDENT).toBe(ROW_INDENT + "  ");
  });
});

// FR-016-AC-5: ERROR_INDENT = ROW_INDENT + 4 (7 spaces)
describe("FR-016-AC-5 (TC-304)", () => {
  it("ERROR_INDENT is ROW_INDENT + 4 spaces", () => {
    expect(ERROR_INDENT).toBe(ROW_INDENT + "    ");
  });
});

// FR-016-AC-6: PHASE_WIDTH = 4 (TC-305) + TC-CB-04
describe("FR-016-AC-6 (TC-305, TC-CB-04)", () => {
  it("PHASE_WIDTH is 4", () => {
    expect(PHASE_WIDTH).toBe(4);
  });
  it("PHASE_PASS is exactly PHASE_WIDTH cells (after stripping ANSI)", () => {
    expect(stripAnsi(PHASE_PASS)).toHaveLength(PHASE_WIDTH);
  });
  it("PHASE_FAIL is exactly PHASE_WIDTH cells (after stripping ANSI)", () => {
    expect(stripAnsi(PHASE_FAIL)).toHaveLength(PHASE_WIDTH);
  });
});

// FR-016-AC-7: ROUTE_INDENT contains └─┐
describe("FR-016-AC-7 (TC-306)", () => {
  it("ROUTE_INDENT contains the └─┐ opener", () => {
    expect(stripAnsi(ROUTE_INDENT)).toBe(" └─┐");
  });
});

// FR-016-AC-8: ROUTE_OUT
describe("FR-016-AC-8 (TC-307)", () => {
  it("ROUTE_OUT contains the └── connector after the row indent", () => {
    expect(stripAnsi(ROUTE_OUT)).toBe(ROW_INDENT + "   └──");
  });
  it("ROUTE_URL is the arrow-only URL connector after the row indent", () => {
    expect(stripAnsi(ROUTE_URL)).toBe(ROW_INDENT + "→");
  });
});

// FR-016-AC-9: renderHeader
describe("FR-016-AC-9 (TC-308)", () => {
  it("wraps text in gray brackets", () => {
    const out = renderHeader("ix local list");
    expect(stripAnsi(out)).toBe("[ ix local list ]");
  });
  it("grays the · separator", () => {
    const out = renderHeader("a · b");
    expect(stripAnsi(out)).toBe("[ a · b ]");
  });
});

// FR-001-AC-12: header newline coercion (TC-111)
describe("FR-001-AC-12 (TC-111)", () => {
  it("coerces \\n in header to single space", () => {
    const out = renderHeader("a\nb");
    expect(stripAnsi(out)).toBe("[ a b ]");
  });
  it("coerces \\r\\n in header to single space", () => {
    const out = renderHeader("a\r\nb");
    expect(stripAnsi(out)).toBe("[ a b ]");
  });
});

// FR-016-AC-10: PHASE_PASS / PHASE_FAIL
describe("FR-016-AC-10 (TC-309)", () => {
  it("PHASE_PASS is the orbit at frame index 5", () => {
    expect(stripAnsi(PHASE_PASS)).toBe(ORBIT_SPINNER[5]);
  });
  it("PHASE_FAIL contains a red ⊗", () => {
    expect(PHASE_FAIL).toContain("⊗");
  });
});

// FR-016-AC-11: colorOrbitFrame
describe("FR-016-AC-11 (TC-310)", () => {
  it("preserves the underlying glyphs after coloring", () => {
    const colored = colorOrbitFrame(ORBIT_SPINNER[0]);
    expect(stripAnsi(colored)).toBe(ORBIT_SPINNER[0]);
  });
  it("colors orbit and satellite glyphs", () => {
    // ORBIT[0] contains either ⊚ or ⊙ + a satellite. After coloring there
    // should be at least one color escape.
    const colored = colorOrbitFrame(ORBIT_SPINNER[0]);
    expect(colored).toMatch(/\x1b\[/);
  });
});

// FR-016-AC-12: HEADER_TICK_DIV = 3
describe("FR-016-AC-12 (TC-311)", () => {
  it("HEADER_TICK_DIV is 3", () => {
    expect(HEADER_TICK_DIV).toBe(3);
  });
});

// Glyphs (TC-300 module surface)
describe("FR-016-AC-1 (TC-300)", () => {
  it("exports all expected layout/connector/glyph tokens", () => {
    expect(GLYPH_DONE).toBeDefined();
    expect(GLYPH_DIM_DOT).toBeDefined();
    expect(GLYPH_PIPE).toBeDefined();
    expect(GLYPH_FAIL).toBeDefined();
    expect(GLYPH_FAIL_MARK).toBeDefined();
    expect(GLYPH_WAITING).toBeDefined();
    expect(GLYPH_CANCELLED).toBeDefined();
    expect(GLYPH_INGRESS).toBeDefined();
    expect(GLYPH_COMPLETE).toBeDefined();
    expect(FLOW_INDENT).toBe(" ");
    expect(colors).toBeDefined();
    expect(blue).toBeDefined();
    expect(ORBIT_SPINNER).toBeDefined();
  });
});

// colorPods (referenced from FR-004-AC-8)
describe("colorPods (FR-004-AC-8)", () => {
  it("returns input unchanged when not a pod-status pattern", () => {
    expect(colorPods("not a pod status")).toBe("not a pod status");
  });
  it("colors fully-ready 3/3 with cyan", () => {
    const out = colorPods("3/3");
    expect(out).toContain("3/3");
    expect(out).toMatch(/\x1b\[36m/); // cyan
  });
  it("colors partial 1/3 with yellow", () => {
    const out = colorPods("1/3");
    expect(out).toMatch(/\x1b\[33m/); // yellow
  });
  it("colors zero-ready 0/3 with yellow on the 0", () => {
    const out = colorPods("0/3");
    expect(out).toMatch(/\x1b\[33m/);
  });
  it("preserves the · trailing label dim", () => {
    const out = colorPods("1/1 · waiting");
    expect(out).toContain("waiting");
  });
  it("colors fully-ready counts with active hook text as ready plus dim tail", () => {
    const out = colorPods("1/1 · hook running");
    expect(out).toMatch(/\x1b\[36m/);
    expect(out).toContain("hook running");
  });
  it("accepts compact rollout labels", () => {
    const out = colorPods("1/1·settle");
    expect(out).toMatch(/\x1b\[36m/);
    expect(out).toContain("settle");
  });
});
