import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { colors, blue } from "../src/colors.js";
import { introCommand, outroSuccess, outroError } from "../src/prompts.js";

afterEach(() => vi.restoreAllMocks());

// TC-033, TC-034, TC-035: FR-009-AC-1, AC-2, AC-3
describe("colors.red", () => {
  it("wraps with ANSI 167 opening sequence", () => {
    expect(colors.red("x")).toContain("\x1b[38;5;167m");
  });

  it("ends with reset sequence", () => {
    expect(colors.red("x")).toMatch(/\x1b\[0m$/);
  });

  it("contains the input string between escape sequences", () => {
    expect(colors.red("hello")).toContain("hello");
  });
});

// TC-036, TC-037, TC-038: FR-010-AC-2, AC-3, AC-4
describe("colors object", () => {
  const REQUIRED_KEYS = [
    "cyan",
    "green",
    "yellow",
    "red",
    "dim",
    "bold",
    "underline",
    "bgCyan",
    "black",
  ] as const;

  it("exports all required keys", () => {
    for (const key of REQUIRED_KEYS) {
      expect(colors).toHaveProperty(key);
    }
  });

  it("every value is a (string) => string function", () => {
    for (const key of REQUIRED_KEYS) {
      const fn = colors[key];
      expect(typeof fn, `colors.${key} should be a function`).toBe("function");
      expect(
        typeof fn("test"),
        `colors.${key}("test") should be a string`,
      ).toBe("string");
    }
  });

  it("blue is exported and wraps strings", () => {
    expect(typeof blue).toBe("function");
    expect(typeof blue("test")).toBe("string");
  });
});

// TC-042, TC-043, TC-044: FR-012-AC-1, AC-2, AC-3
//
// Note: @clack/prompts strips ANSI colour codes in non-TTY environments (the
// test runner). The assertions therefore verify that:
//   (a) the correct string payload is passed through, AND
//   (b) the source code delegates to picocolors colour functions (static check).
// The static/source check that introCommand calls pc.bgCyan(pc.black(...)) and
// outroSuccess/outroError call pc.green/pc.red is covered by NFR-002-AC-3.
describe("prompt helpers output", () => {
  let captured: string;

  beforeEach(() => {
    captured = "";
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      captured += typeof chunk === "string" ? chunk : chunk.toString();
      return true;
    });
  });

  it("introCommand contains the command name in output", () => {
    introCommand("ix up");
    expect(captured).toContain("ix up");
  });

  it("outroSuccess contains the message in output", () => {
    outroSuccess("Done.");
    expect(captured).toContain("Done.");
  });

  it("outroError contains the message in output", () => {
    outroError("Failed.");
    expect(captured).toContain("Failed.");
  });

  // Static verification: prompts.ts source uses pc.bgCyan/pc.black/pc.green/pc.red
  it("prompts.ts source applies colour functions (static check)", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const src = readFileSync(
      join(fileURLToPath(import.meta.url), "../../src/prompts.ts"),
      "utf-8",
    );
    expect(src).toContain("pc.bgCyan");
    expect(src).toContain("pc.black");
    expect(src).toContain("pc.green");
    expect(src).toContain("pc.red");
  });
});

// TC-045: NFR-002-AC-1 — no console.log/error/warn in packages/cli/src/
describe("NFR-002: no console.log in packages/cli/src/", () => {
  it("src files contain no console.log/error/warn calls", async () => {
    const { readFileSync, readdirSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const dir = join(fileURLToPath(import.meta.url), "../../src");

    const check = (d: string): void => {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        const full = join(d, entry.name);
        if (entry.isDirectory()) {
          check(full);
          continue;
        }
        if (!entry.name.endsWith(".ts")) continue;
        const src = readFileSync(full, "utf-8");
        expect(
          src,
          `${entry.name} should not call console.log/error/warn`,
        ).not.toMatch(/console\.(log|error|warn|info)/);
      }
    };

    check(dir);
  });
});
