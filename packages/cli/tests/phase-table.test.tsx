import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import { PhaseTable, type ServiceRow } from "../src/components/PhaseTable.js";

const stripAnsi = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, "");

const PHASES = ["pull", "install", "ready"] as const;
type P = (typeof PHASES)[number];

const allDone = (): Record<P, "done"> => ({
  pull: "done",
  install: "done",
  ready: "done",
});

// FR-004-AC-1 + AC-6 (TC-132, TC-137, TC-138): rows + summary + aggregate=passed
describe("FR-004-AC-1/AC-6 (TC-132, TC-137)", () => {
  it("renders header, rows, summary, and tail when all done", () => {
    const services: ServiceRow<P>[] = [
      { name: "svc-a", phases: allDone(), status: "1/1" },
      { name: "svc-b", phases: allDone(), status: "1/1" },
    ];
    const { lastFrame } = render(
      <PhaseTable
        header="ix local up · ghcr.io"
        phases={PHASES}
        services={services}
      />,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("[ ix local up · ghcr.io ]");
    expect(out).toContain("svc-a");
    expect(out).toContain("svc-b");
    expect(out).toContain("2/2 ready");
  });
});

// FR-004-AC-12 (TC-143): empty services
describe("FR-004-AC-12 (TC-143)", () => {
  it("renders 0/0 ready summary with no rows", () => {
    const { lastFrame } = render(
      <PhaseTable header="empty" phases={PHASES} services={[]} />,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("[ empty ]");
    expect(out).toContain("0/0 ready");
  });
});

// FR-004-AC-14 (TC-145): displayName fallback to name
describe("FR-004-AC-14 (TC-145)", () => {
  it("uses name when displayName is omitted", () => {
    const { lastFrame } = render(
      <PhaseTable
        header="h"
        phases={PHASES}
        services={[{ name: "svc-x", phases: allDone() }]}
      />,
    );
    expect(stripAnsi(lastFrame() ?? "")).toContain("svc-x");
  });
});

// FR-004-AC-15 (TC-146): empty phases
describe("FR-004-AC-15 (TC-146)", () => {
  it("renders summary even with empty phases array", () => {
    const { lastFrame } = render(
      <PhaseTable
        header="h"
        phases={[] as readonly string[]}
        services={[{ name: "svc", phases: {} }]}
      />,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("[ h ]");
  });
});

// FR-004-AC-10 (TC-141): failure tail
describe("FR-004-AC-10 (TC-141)", () => {
  it("renders ⊗ N service(s) failed when status=failed", () => {
    const services: ServiceRow<P>[] = [
      {
        name: "a",
        phases: { pull: "done", install: "failed", ready: "pending" },
        error: "oops",
      },
    ];
    const { lastFrame } = render(
      <PhaseTable header="h" phases={PHASES} services={services} />,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("1 service");
    expect(out).toContain("failed");
  });
});

// FR-004-AC-9 (TC-140): tailEntry renders entry URL on passed
describe("FR-004-AC-9 (TC-140)", () => {
  it("renders https://name.domain on passed", () => {
    const services: ServiceRow<P>[] = [
      { name: "auth", phases: allDone(), status: "1/1" },
    ];
    const { lastFrame } = render(
      <PhaseTable
        header="h"
        phases={PHASES}
        services={services}
        tailEntry={{ name: "auth", baseDomain: "ix.internal" }}
      />,
    );
    expect(stripAnsi(lastFrame() ?? "")).toContain("https://auth.ix.internal");
  });
});

// FR-004-AC-16 (TC-147): duplicate names render as separate rows
describe("FR-004-AC-16 (TC-147)", () => {
  it("renders two rows for two services with same name", () => {
    const services: ServiceRow<P>[] = [
      { name: "dup", phases: allDone() },
      { name: "dup", phases: allDone() },
    ];
    const { lastFrame } = render(
      <PhaseTable header="h" phases={PHASES} services={services} />,
    );
    const out = stripAnsi(lastFrame() ?? "");
    const lines = out.split("\n").filter((l) => l.includes("dup"));
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });
});
