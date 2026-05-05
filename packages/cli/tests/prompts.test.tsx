import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import { TextPrompt } from "../src/components/prompts/TextPrompt.js";
import { ConfirmPrompt } from "../src/components/prompts/ConfirmPrompt.js";

const stripAnsi = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, "");

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ESC = "";

// FR-006-AC-2 (TC-165): Esc cancels
describe("FR-006-AC-2 (TC-165)", () => {
  it("TextPrompt cancels on Esc", async () => {
    let result: { ok: boolean; cancelled?: boolean } | null = null;
    const { stdin, unmount } = render(
      <TextPrompt
        message="Email"
        onSubmit={(r) => {
          result = r;
        }}
      />,
    );
    await wait(10);
    stdin.write(ESC);
    await wait(20);
    expect(result).toEqual({ ok: false, cancelled: true });
    unmount();
  });
});

// FR-006-AC-9 (TC-172): ConfirmPrompt key handling
describe("FR-006-AC-9 (TC-172)", () => {
  it("ConfirmPrompt accepts y → true, n → false", async () => {
    const results: boolean[] = [];

    {
      const { stdin, unmount } = render(
        <ConfirmPrompt
          message="Proceed?"
          onSubmit={(r) => {
            if (r.ok) results.push(r.value);
          }}
        />,
      );
      await wait(10);
      stdin.write("y");
      await wait(20);
      unmount();
    }
    {
      const { stdin, unmount } = render(
        <ConfirmPrompt
          message="Proceed?"
          onSubmit={(r) => {
            if (r.ok) results.push(r.value);
          }}
        />,
      );
      await wait(10);
      stdin.write("n");
      await wait(20);
      unmount();
    }

    expect(results).toEqual([true, false]);
  });
});

// FR-006-AC-1 (TC-164): header line layout
describe("FR-006-AC-1 (TC-164)", () => {
  it("renders ? glyph + message in the frozen summary", async () => {
    const { lastFrame, unmount } = render(
      <TextPrompt message="Email address" onSubmit={() => {}} />,
    );
    await wait(20);
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("? Email address");
    unmount();
  });
});
