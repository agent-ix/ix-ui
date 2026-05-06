import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

const SRC_DIR = join(__dirname, "..", "src");

function listSrc(): string[] {
  const out = execSync(
    `find "${SRC_DIR}" -type f \\( -name "*.ts" -o -name "*.tsx" \\)`,
    { encoding: "utf8" },
  );
  return out.trim().split("\n").filter(Boolean);
}

const FILES = listSrc();

const readSrc = (p: string) => ({
  rel: relative(SRC_DIR, p),
  body: readFileSync(p, "utf8"),
});

const SOURCES = FILES.map(readSrc);

// NFR-002-AC-1 (TC-325): no imperative stdout / console writes
describe("NFR-002-AC-1 (TC-325)", () => {
  it("no process.stdout.write / process.stderr.write / console.* in src", () => {
    const offenders: string[] = [];
    const re =
      /\bprocess\.(stdout|stderr)\.write\b|\bconsole\.(log|error|warn)\b|\bprocess\.stdout\.(cursorTo|moveCursor|clearLine|columns)\b/;
    for (const s of SOURCES) {
      if (re.test(s.body)) offenders.push(s.rel);
    }
    expect(offenders).toEqual([]);
  });
});

// NFR-002-AC-2 (TC-326): no \x1b[ ANSI literals outside colors.ts
describe("NFR-002-AC-2 (TC-326)", () => {
  it("no ANSI CSI literals outside colors.ts", () => {
    const offenders: string[] = [];
    for (const s of SOURCES) {
      if (s.rel === "colors.ts") continue;
      if (s.body.includes("\\x1b[")) offenders.push(s.rel);
    }
    expect(offenders).toEqual([]);
  });
});

// NFR-002-AC-4 (TC-328): no process.stdout.columns reads
describe("NFR-002-AC-4 (TC-328)", () => {
  it("no process.stdout.columns", () => {
    const offenders: string[] = [];
    for (const s of SOURCES) {
      if (s.body.includes("process.stdout.columns")) offenders.push(s.rel);
    }
    expect(offenders).toEqual([]);
  });
});

// NFR-003-AC-2 (TC-331): no └── connectors outside style.ts
describe("NFR-003-AC-2 (TC-331)", () => {
  it("no └── connectors outside style.ts", () => {
    const offenders: string[] = [];
    for (const s of SOURCES) {
      if (s.rel === "style.ts") continue;
      if (/└──/.test(s.body)) offenders.push(s.rel);
    }
    expect(offenders).toEqual([]);
  });
});

// NFR-003-AC-3 (TC-332): no head-row glyphs outside style.ts
describe("NFR-003-AC-3 (TC-332)", () => {
  it("no ⊙/⊗/⊕/● outside style.ts", () => {
    const offenders: string[] = [];
    const glyphRe = /[⊙⊗⊕●]/;
    for (const s of SOURCES) {
      if (s.rel === "style.ts") continue;
      if (glyphRe.test(s.body)) offenders.push(s.rel);
    }
    expect(offenders).toEqual([]);
  });
});
