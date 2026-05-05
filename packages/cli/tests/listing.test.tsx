import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
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
    expect(out).toContain("└──┐");
    expect(out).toContain("└──•  Done.");
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
