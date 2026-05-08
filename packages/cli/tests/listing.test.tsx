import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import { Text } from "ink";
import { Listing, Group, Item, Note } from "../src/components/Listing.js";

const stripAnsi = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, "");

// FR-003-AC-1 (TC-123): Listing wraps Frame, forwards props
describe("FR-003-AC-1 (TC-123)", () => {
  it("renders header inside [ … ] brackets via Frame", () => {
    const { lastFrame } = render(
      <Listing header="ix elements list" status="passed" tail="Done.">
        <Item name="x" />
      </Listing>,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("[ ix elements list ]");
    expect(out).toContain("└─┐");
    expect(out).toContain("└──•  Done.");
  });
});

describe("Listing flow variant", () => {
  it("renders outer-level rows with pipe separators and ✧ completion", () => {
    const { lastFrame } = render(
      <Listing
        header="ix local refresh"
        status="passed"
        variant="flow"
        pre={<Text> • Refreshing helm charts from ghcr.io</Text>}
        tail="Refreshed: 1 chart(s) updated."
      >
        <Item name="service:Cloud Manager UI 0.8.2 -> 0.8.3" />
      </Listing>,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("[ ix local refresh ]");
    expect(out).toContain(" |\n • Refreshing helm charts from ghcr.io");
    expect(out).toContain("└─┐");
    expect(out).toContain("    • service:Cloud Manager UI 0.8.2 -> 0.8.3");
    expect(out).toContain(" ✧   Refreshed: 1 chart(s) updated.");
    expect(out).not.toContain("└──•");
  });
});

// FR-003-AC-2 (TC-124): Group renders bold cyan name with blank line above
describe("FR-003-AC-2 (TC-124)", () => {
  it("renders group name at ROW_INDENT", () => {
    const { lastFrame } = render(
      <Listing header="h" status="passed" tail="x">
        <Group name="dev">
          <Item name="auth" />
        </Group>
      </Listing>,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("dev");
    expect(out).toContain("auth");
  });
});

// FR-003-AC-3 (TC-125): Item with description
describe("FR-003-AC-3 (TC-125)", () => {
  it("renders • + name + dim em-dash + description", () => {
    const { lastFrame } = render(
      <Listing header="h" status="passed" tail="x">
        <Item name="lib" description="A library" />
      </Listing>,
    );
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("• lib");
    expect(out).toContain("— A library");
  });
});

// FR-003-AC-4 (TC-126): Note renders dim at NOTE_INDENT
describe("FR-003-AC-4 (TC-126)", () => {
  it("renders note text", () => {
    const { lastFrame } = render(
      <Listing header="h" status="passed" tail="x">
        <Note>resolving registry…</Note>
      </Listing>,
    );
    expect(stripAnsi(lastFrame() ?? "")).toContain("resolving registry…");
  });
});
