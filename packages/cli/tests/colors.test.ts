import { describe, it, expect, vi, afterEach } from "vitest";
import { colors, blue } from "../src/colors.js";

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
