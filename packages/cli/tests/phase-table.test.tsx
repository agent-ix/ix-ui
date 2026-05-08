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

// FR-004-AC-9 (TC-140): tailEntry adapter + per-host grouping with arrow-only URL connector
describe("FR-004-AC-9 (TC-140)", () => {
  it("renders https://name.domain grouped under baseDomain on passed", () => {
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
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("Ingress · ix.internal");
    expect(out).toContain("   →  https://auth.ix.internal");
  });

  it("groups URLs into per-host blocks via longest-host-suffix match", () => {
    const services: ServiceRow<P>[] = [
      { name: "auth", phases: allDone(), status: "1/1" },
    ];
    const { lastFrame } = render(
      <PhaseTable
        header="h"
        phases={PHASES}
        services={services}
        tailIngressUrls={[
          "https://auth.dev.ix",
          "https://identity.dev.ix",
          "https://auth.luna.ix",
        ]}
        tailIngressHosts={["dev.ix", "luna.ix"]}
      />,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("Ingress · dev.ix");
    expect(out).toContain("Ingress · luna.ix");
    expect(out).toContain("   →  https://auth.dev.ix");
    expect(out).toContain("   →  https://identity.dev.ix");
    expect(out).toContain("   →  https://auth.luna.ix");
    // Old `└─→` URL connector is gone.
    expect(out).not.toContain("└─→");
    // dev.ix group appears before luna.ix because it's first-seen in the URL list.
    const devAt = out.indexOf("Ingress · dev.ix");
    const lunaAt = out.indexOf("Ingress · luna.ix");
    expect(devAt).toBeGreaterThan(-1);
    expect(lunaAt).toBeGreaterThan(devAt);
  });
});

// FR-004-AC-9 (TC-140a): no-match fallback + omitted-hosts degenerate path
describe("FR-004-AC-9 (TC-140a)", () => {
  it("URLs whose hostname matches no configured host fall into a default group keyed by hostname", () => {
    const services: ServiceRow<P>[] = [
      { name: "svc", phases: allDone(), status: "1/1" },
    ];
    const { lastFrame } = render(
      <PhaseTable
        header="h"
        phases={PHASES}
        services={services}
        tailIngressUrls={["https://orphan.example.com"]}
        tailIngressHosts={["dev.ix"]}
      />,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("Ingress · orphan.example.com");
    expect(out).toContain("   →  https://orphan.example.com");
  });

  it("collapses to per-hostname groups when tailIngressHosts is omitted", () => {
    const services: ServiceRow<P>[] = [
      { name: "svc", phases: allDone(), status: "1/1" },
    ];
    const { lastFrame } = render(
      <PhaseTable
        header="h"
        phases={PHASES}
        services={services}
        tailIngressUrls={["https://a.dev.ix", "https://b.luna.ix"]}
      />,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("Ingress · a.dev.ix");
    expect(out).toContain("Ingress · b.luna.ix");
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
