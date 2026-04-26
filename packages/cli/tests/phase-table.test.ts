import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PhaseTable } from "../src/phase-table.js";

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
