import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import { Text } from "ink";
import { Frame } from "../src/components/Frame.js";

const stripAnsi = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, "");

// FR-002-AC-2 (TC-113): passed status
describe("FR-002-AC-2 (TC-113)", () => {
  it("renders frozen ⊙ in passed state", () => {
    const { lastFrame } = render(
      <Frame header="ix elements list" status="passed" />,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("⊙");
    expect(out).toContain("[ ix elements list ]");
  });
});

// FR-002-AC-3 (TC-114): failed status
describe("FR-002-AC-3 (TC-114)", () => {
  it("renders frozen ⊗ in failed state", () => {
    const { lastFrame } = render(
      <Frame header="ix elements new" status="failed" />,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("⊗");
    expect(out).toContain("[ ix elements new ]");
  });
});

// FR-002-AC-5 + AC-6 (TC-116, TC-117): opener appears with children, collapses without
describe("FR-002-AC-5/AC-6 (TC-116, TC-117)", () => {
  it("renders └──┐ opener when children present", () => {
    const { lastFrame } = render(
      <Frame header="h" status="passed">
        <Text>body</Text>
      </Frame>,
    );
    expect(stripAnsi(lastFrame() ?? "")).toContain("└──┐");
  });

  it("collapses to header-only when no children and no tail", () => {
    const { lastFrame } = render(<Frame header="h" status="passed" />);
    expect(stripAnsi(lastFrame() ?? "")).not.toContain("└──");
  });

  it("tail-only frame has no opener (per FR-002-AC-5)", () => {
    const { lastFrame } = render(
      <Frame header="h" status="passed" tail="only tail" />,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).not.toContain("└──┐");
    expect(out).toContain("only tail");
  });
});

// FR-002-AC-8 (TC-119): tail variants
describe("FR-002-AC-8 (TC-119)", () => {
  it("success tail uses └──• connector", () => {
    const { lastFrame } = render(
      <Frame header="h" status="passed" tail="Done.">
        <Text>row</Text>
      </Frame>,
    );
    expect(stripAnsi(lastFrame() ?? "")).toContain("└──•  Done.");
  });

  it("error tail sits at planet column with ⊗ and no └── connector", () => {
    const { lastFrame } = render(
      <Frame header="h" status="failed" tail="failed" tailVariant="error">
        <Text>row</Text>
      </Frame>,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain(" ⊗  failed");
    // Tail line specifically does NOT use the └── connector (only the opener does)
    const tailLine = out.split("\n").find((l) => l.includes("⊗  failed")) ?? "";
    expect(tailLine).not.toContain("└──");
  });

  it("warn tail uses └──• connector", () => {
    const { lastFrame } = render(
      <Frame header="h" status="passed" tail="warning" tailVariant="warn">
        <Text>row</Text>
      </Frame>,
    );
    expect(stripAnsi(lastFrame() ?? "")).toContain("└──•  warning");
  });
});

// FR-002-AC-12 (TC-122a): empty header
describe("FR-002-AC-12 (TC-122a)", () => {
  it("renders [  ] for empty header without crashing", () => {
    const { lastFrame } = render(<Frame header="" status="passed" />);
    expect(stripAnsi(lastFrame() ?? "")).toContain("[  ]");
  });
});
