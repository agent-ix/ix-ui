import React, { useEffect } from "react";
import { describe, it, expect } from "vitest";
import { Text, useApp } from "ink";
import { render, useRenderResult } from "../src/render.js";

// FR-008-AC-1 + AC-3 (TC-199, TC-201): mount, resolve on unmount
describe("FR-008-AC-1/AC-3 (TC-199, TC-201)", () => {
  it("resolves with cancelled=false, result=undefined when tree exits", async () => {
    const Tree: React.FC = () => {
      const { exit } = useApp();
      useEffect(() => {
        const t = setTimeout(() => exit(), 20);
        return () => clearTimeout(t);
      }, [exit]);
      return <Text>hi</Text>;
    };
    const r = await render(<Tree />);
    expect(r.cancelled).toBe(false);
    expect(r.result).toBeUndefined();
  });
});

// FR-008-AC-2 (TC-200): useRenderResult().setResult attaches value
describe("FR-008-AC-2 (TC-200)", () => {
  it("resolves with the value passed to setResult", async () => {
    const Tree: React.FC = () => {
      const { setResult, exit } = useRenderResult<string>();
      useEffect(() => {
        setResult("hello");
        const t = setTimeout(exit, 10);
        return () => clearTimeout(t);
      }, [setResult, exit]);
      return <Text>x</Text>;
    };
    const r = await render<string>(<Tree />);
    expect(r.cancelled).toBe(false);
    expect(r.result).toBe("hello");
  });
});

// FR-008-AC-11 (TC-209): concurrent render rejects
describe("FR-008-AC-11 (TC-209)", () => {
  it("rejects if render() is called while another tree is mounted", async () => {
    const Tree: React.FC = () => {
      const { exit } = useApp();
      useEffect(() => {
        const t = setTimeout(exit, 80);
        return () => clearTimeout(t);
      }, [exit]);
      return <Text>x</Text>;
    };
    const first = render(<Tree />);
    await new Promise((r) => setTimeout(r, 10));
    await expect(render(<Tree />)).rejects.toThrow(/already active/);
    await first;
  });
});
