import React, { useState } from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import { Text } from "ink";
import { useInterval } from "../src/hooks/useInterval.js";
import { useExecaPhase } from "../src/hooks/useExecaPhase.js";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// FR-007-AC-1 (TC-184): useInterval fires every delay ms
describe("FR-007-AC-1 (TC-184)", () => {
  it("calls cb periodically while mounted", async () => {
    let count = 0;
    const Test: React.FC = () => {
      useInterval(() => {
        count++;
      }, 30);
      return <Text>x</Text>;
    };
    const { unmount } = render(<Test />);
    await wait(120);
    unmount();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

// FR-007-AC-1 (TC-185): null delay pauses
describe("FR-007-AC-1 (TC-185)", () => {
  it("does not call cb when delay is null", async () => {
    let count = 0;
    const Test: React.FC = () => {
      useInterval(() => {
        count++;
      }, null);
      return <Text>x</Text>;
    };
    const { unmount } = render(<Test />);
    await wait(80);
    unmount();
    expect(count).toBe(0);
  });
});

// FR-007-AC-2 (TC-186): callback ref stable across re-renders
describe("FR-007-AC-2 (TC-186)", () => {
  it("uses the latest cb after re-render without resetting interval", async () => {
    const calls: number[] = [];
    const Test: React.FC = () => {
      const [v, setV] = useState(1);
      useInterval(() => {
        calls.push(v);
      }, 25);
      // Trigger re-render to swap the cb closure
      React.useEffect(() => {
        const t = setTimeout(() => setV(2), 30);
        return () => clearTimeout(t);
      }, []);
      return <Text>{v}</Text>;
    };
    const { unmount } = render(<Test />);
    await wait(120);
    unmount();
    // We expect a mix of 1s and 2s — proving the latest closure is used.
    expect(calls).toContain(2);
  });
});

// FR-007-AC-3 (TC-187): cleanup on unmount
describe("FR-007-AC-3 (TC-187)", () => {
  it("stops calling cb after unmount", async () => {
    let count = 0;
    const Test: React.FC = () => {
      useInterval(() => {
        count++;
      }, 20);
      return <Text>x</Text>;
    };
    const { unmount } = render(<Test />);
    await wait(60);
    const before = count;
    unmount();
    await wait(60);
    expect(count).toBe(before);
  });
});

// FR-007-AC-5 (TC-189): useExecaPhase state transitions
describe("FR-007-AC-5 (TC-189)", () => {
  it("transitions idle → running → done for `node -e ''`", async () => {
    const states: string[] = [];
    const Test: React.FC = () => {
      const s = useExecaPhase("node", ["-e", "''"], {});
      React.useEffect(() => {
        states.push(s.state);
      }, [s.state]);
      return <Text>{s.state}</Text>;
    };
    const { unmount } = render(<Test />);
    await wait(800);
    unmount();
    expect(states).toContain("done");
  });
});

// FR-007-AC-15 (TC-198): missing binary → failed state for useExecaPhase
describe("FR-007-AC-15 (TC-198)", () => {
  it("transitions to failed when binary not on PATH", async () => {
    let lastState = "idle";
    const Test: React.FC = () => {
      const s = useExecaPhase("__nonexistent_bin_for_test__", [], {});
      React.useEffect(() => {
        lastState = s.state;
      }, [s.state]);
      return <Text>{s.state}</Text>;
    };
    const { unmount } = render(<Test />);
    await wait(800);
    unmount();
    expect(lastState).toBe("failed");
  });
});
