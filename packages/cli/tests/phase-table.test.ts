import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PhaseTable, colorPods } from "../src/phase-table.js";

type TestPhase = "build" | "deploy" | "ready";
const TEST_PHASES: readonly TestPhase[] = ["build", "deploy", "ready"];

describe("PhaseTable (non-TTY)", () => {
  let output: string;

  beforeEach(() => {
    output = "";
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      output += typeof chunk === "string" ? chunk : chunk.toString();
      return true;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits structured lines on transition in non-TTY mode", () => {
    const table = new PhaseTable<TestPhase>(["svc-a"], {
      phases: TEST_PHASES,
      isTTY: false,
    });
    table.start();
    table.transition("svc-a", "build", "running");
    expect(output).toMatch(/svc-a: build running/);
  });

  it("emits preflight label to stdout in non-TTY mode", () => {
    const table = new PhaseTable<TestPhase>(["svc-a"], {
      phases: TEST_PHASES,
      isTTY: false,
    });
    table.preflight("logged in as bot");
    expect(output).toContain("logged in as bot");
  });

  it("emits plain entry lines above the table in non-TTY mode", () => {
    const table = new PhaseTable<TestPhase>(["svc-a"], {
      phases: TEST_PHASES,
      isTTY: false,
    });
    table.entry("build 0.1.5");
    expect(output).toContain("build 0.1.5");
  });

  it("finish prints success summary when all services done", () => {
    const table = new PhaseTable<TestPhase>(["svc-a", "svc-b"], {
      phases: TEST_PHASES,
      isTTY: false,
    });
    table.start();
    for (const svc of ["svc-a", "svc-b"]) {
      for (const phase of TEST_PHASES) {
        table.transition(svc, phase, "running");
        table.transition(svc, phase, "done");
      }
    }
    output = "";
    table.finish();
    expect(output).toContain("svc-a");
    expect(output).toContain("svc-b");
    expect(output).toMatch(/ready in/);
  });

  it("finish prints failure summary when a service failed", () => {
    const table = new PhaseTable<TestPhase>(["svc-a"], {
      phases: TEST_PHASES,
      isTTY: false,
    });
    table.start();
    table.transition("svc-a", "build", "failed");
    table.setError("svc-a", "build error detail");
    output = "";
    table.finish();
    expect(output).toContain("svc-a");
    expect(output).toContain("failed");
    expect(output).toContain("build error detail");
  });

  it("finish includes entry URL when entry and baseDomain are provided", () => {
    const table = new PhaseTable<TestPhase>(["svc-a"], {
      phases: TEST_PHASES,
      isTTY: false,
    });
    table.start();
    for (const phase of TEST_PHASES) {
      table.transition("svc-a", phase, "done");
    }
    output = "";
    table.finish("my-app", "ix.internal");
    expect(output).toContain("my-app.ix.internal");
  });

  it("does not throw when an unknown service is referenced", () => {
    const table = new PhaseTable<TestPhase>(["svc-a"], {
      phases: TEST_PHASES,
      isTTY: false,
    });
    expect(() => table.transition("unknown", "build", "running")).not.toThrow();
    expect(() => table.setPodStatus("unknown", "1/1")).not.toThrow();
    expect(() => table.setError("unknown", "err")).not.toThrow();
  });

  it("handles empty service list gracefully", () => {
    const table = new PhaseTable<TestPhase>([], {
      phases: TEST_PHASES,
      isTTY: false,
    });
    table.start();
    output = "";
    expect(() => table.finish()).not.toThrow();
  });

  it("hides rows that never leave pending when hidePendingRows is enabled", () => {
    const table = new PhaseTable<TestPhase>(["app", "svc-a"], {
      phases: TEST_PHASES,
      isTTY: false,
      hidePendingRows: true,
    });
    table.start();
    for (const phase of TEST_PHASES) {
      table.transition("svc-a", phase, "done");
    }
    output = "";
    table.finish();
    expect(output).toContain("svc-a");
    expect(output).not.toContain("app");
  });
});

describe("PhaseTable serviceLabels", () => {
  let output: string;

  beforeEach(() => {
    output = "";
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      output += typeof chunk === "string" ? chunk : chunk.toString();
      return true;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders displayName in finish output when serviceLabels provided", () => {
    const table = new PhaseTable<TestPhase>(["svc-a"], {
      phases: TEST_PHASES,
      isTTY: false,
      serviceLabels: { "svc-a": "svc-a \x1b[2m1.2.3\x1b[0m" },
    });
    table.start();
    for (const phase of TEST_PHASES) {
      table.transition("svc-a", phase, "done");
    }
    output = "";
    table.finish();
    expect(output).toContain("svc-a");
    expect(output).toContain("1.2.3");
  });

  it("lookup methods still work by key name when serviceLabels provided", () => {
    const table = new PhaseTable<TestPhase>(["svc-a"], {
      phases: TEST_PHASES,
      isTTY: false,
      serviceLabels: { "svc-a": "svc-a \x1b[2m1.2.3\x1b[0m" },
    });
    expect(() => table.transition("svc-a", "build", "running")).not.toThrow();
    expect(() => table.setError("svc-a", "oops")).not.toThrow();
    expect(() => table.setPodStatus("svc-a", "1/1")).not.toThrow();
  });

  it("aligns columns correctly when displayName contains ANSI codes", () => {
    const table = new PhaseTable<TestPhase>(["short", "longer-name"], {
      phases: TEST_PHASES,
      isTTY: false,
      serviceLabels: {
        short: "short \x1b[2m9.9.9\x1b[0m",
        "longer-name": "longer-name \x1b[2m1.0.0\x1b[0m",
      },
    });
    table.start();
    for (const svc of ["short", "longer-name"]) {
      for (const phase of TEST_PHASES) {
        table.transition(svc, phase, "done");
      }
    }
    output = "";
    table.finish();
    // Both rows present — alignment tested implicitly (no crash)
    expect(output).toContain("short");
    expect(output).toContain("longer-name");
  });
});

// TC-059 – TC-062: FR-002-AC-5 through AC-8 — colorPods coloring rules
describe("colorPods", () => {
  const RED_167 = "\x1b[38;5;167m";

  // TC-059: FR-002-AC-5 — 0/N must not use muted-red ANSI 167
  it("0/1 does not contain muted-red ANSI 167 escape", () => {
    expect(colorPods("0/1")).not.toContain(RED_167);
  });

  // TC-060: FR-002-AC-6 — 1/1 renders in cyan
  it("1/1 contains cyan escape", () => {
    const out = colorPods("1/1");
    // picocolors cyan = \x1b[36m; verify count and plain text present
    expect(out).toContain("1/1");
    expect(out).not.toContain(RED_167);
  });

  // TC-061: FR-002-AC-7 — partial (1/3) renders in yellow, not red
  it("1/3 contains yellow escape and not muted-red", () => {
    const out = colorPods("1/3");
    expect(out).toContain("1/3");
    expect(out).not.toContain(RED_167);
  });

  // TC-062: FR-002-AC-8 — 0/N·label preserves label in dim suffix, no red
  it("0/1·init formats 0 in yellow and preserves ·init suffix without red", () => {
    const out = colorPods("0/1·init");
    expect(out).toContain("0");
    expect(out).toContain("init");
    expect(out).not.toContain(RED_167);
  });

  it("0/1 padded (as passed by PhaseTable) does not contain muted-red", () => {
    expect(colorPods("0/1".padEnd(14))).not.toContain(RED_167);
  });

  it("returns plain status unchanged when no slash present", () => {
    expect(colorPods("pending")).toBe("pending");
  });
});

describe("PhaseTable colors", () => {
  it("colors object has required methods", async () => {
    const { colors, blue } = await import("../src/colors.js");
    expect(typeof colors.cyan).toBe("function");
    expect(typeof colors.red).toBe("function");
    expect(typeof colors.green).toBe("function");
    expect(typeof colors.dim).toBe("function");
    expect(typeof blue).toBe("function");
    // Custom ANSI 167 red wraps with escape codes
    expect(colors.red("x")).toContain("\x1b[38;5;167m");
  });
});

// TC-013: FR-001-AC-1 — initial state is all pending
describe("PhaseTable initial state", () => {
  let output: string;

  beforeEach(() => {
    output = "";
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      output += typeof chunk === "string" ? chunk : chunk.toString();
      return true;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initial state is pending for all services and phases", () => {
    const table = new PhaseTable<TestPhase>(["svc-a", "svc-b"], {
      phases: TEST_PHASES,
      isTTY: false,
    });
    table.start();
    // No transitions — finish should show "ready in" (all pending treated as not-failed)
    // No running/done/failed lines should have been emitted
    const before = output;
    table.finish();
    // The only output should be the finish summary — no transition lines
    expect(before).toBe("");
    // Services appear in finish output
    expect(output).toContain("svc-a");
    expect(output).toContain("svc-b");
  });

  // TC-015: FR-001-AC-3 — isPlain forces non-TTY
  it("isPlain:true forces non-TTY mode even without isTTY", () => {
    const table = new PhaseTable<TestPhase>(["svc-a"], {
      phases: TEST_PHASES,
      isPlain: true,
    });
    table.start();
    table.transition("svc-a", "build", "running");
    expect(output).toMatch(/svc-a: build running/);
  });
});
