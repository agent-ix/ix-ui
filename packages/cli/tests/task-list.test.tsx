import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "ink-testing-library";
import {
  TaskList,
  type TaskDef,
  type TaskListResult,
} from "../src/components/TaskList.js";

const stripAnsi = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, "");

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// FR-005-AC-14 (TC-161): empty tasks array
describe("FR-005-AC-14 (TC-161)", () => {
  it("renders zero-task summary and fires onComplete once", async () => {
    let calls = 0;
    let result: TaskListResult | null = null;
    const { lastFrame, unmount } = render(
      <TaskList
        header="empty"
        tasks={[]}
        onComplete={(r) => {
          calls++;
          result = r;
        }}
      />,
    );
    await wait(20);
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("0 task");
    expect(calls).toBe(1);
    expect(result).toMatchObject({ passed: 0, failed: 0, skipped: 0 });
    unmount();
  });
});

// FR-005-AC-5 (TC-152): sequential exitOnError halts subsequent
describe("FR-005-AC-5 (TC-152)", () => {
  it("skips later tasks after a failure when exitOnError is default", async () => {
    const ran: string[] = [];
    const tasks: TaskDef[] = [
      {
        title: "a",
        task: () => {
          ran.push("a");
        },
      },
      {
        title: "b",
        task: () => {
          ran.push("b");
          throw new Error("boom");
        },
      },
      {
        title: "c",
        task: () => {
          ran.push("c");
        },
      },
    ];
    const { lastFrame, unmount } = render(
      <TaskList header="h" tasks={tasks} />,
    );
    await wait(50);
    const out = stripAnsi(lastFrame() ?? "");
    expect(ran).toEqual(["a", "b"]);
    expect(out).toContain("upstream task failed");
    expect(out).toContain("boom");
    unmount();
  });
});

// FR-005-AC-7 (TC-154): enabled=false skips
describe("FR-005-AC-7 (TC-154)", () => {
  it("renders skipped: disabled when enabled=false", async () => {
    const tasks: TaskDef[] = [
      {
        title: "x",
        enabled: false,
        task: () => {
          throw new Error("should not run");
        },
      },
    ];
    const { lastFrame, unmount } = render(
      <TaskList header="h" tasks={tasks} />,
    );
    await wait(20);
    expect(stripAnsi(lastFrame() ?? "")).toContain("skipped: disabled");
    unmount();
  });
});

// FR-005-AC-8 (TC-155): task returns {skip: reason}
describe("FR-005-AC-8 (TC-155)", () => {
  it("renders skipped: <reason> when task returns {skip}", async () => {
    const tasks: TaskDef[] = [
      { title: "y", task: () => ({ skip: "no token" }) },
    ];
    const { lastFrame, unmount } = render(
      <TaskList header="h" tasks={tasks} />,
    );
    await wait(20);
    expect(stripAnsi(lastFrame() ?? "")).toContain("skipped: no token");
    unmount();
  });
});

// FR-005-AC-12 (TC-159): success default tail
describe("FR-005-AC-12 (TC-159)", () => {
  it("renders default success tail when all tasks pass", async () => {
    const tasks: TaskDef[] = [
      { title: "a", task: () => Promise.resolve() },
      { title: "b", task: () => Promise.resolve() },
    ];
    const { lastFrame, unmount } = render(
      <TaskList header="h" tasks={tasks} />,
    );
    await wait(50);
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toContain("2 task");
    expect(out).toContain("completed");
    unmount();
  });
});

// FR-005-AC-13 (TC-160): failure default tail
describe("FR-005-AC-13 (TC-160)", () => {
  it("renders failure tail with N/M failed", async () => {
    const tasks: TaskDef[] = [
      { title: "a", task: () => Promise.reject(new Error("nope")) },
      { title: "b", task: () => Promise.resolve() },
    ];
    const { lastFrame, unmount } = render(
      <TaskList header="h" tasks={tasks} />,
    );
    await wait(50);
    const out = stripAnsi(lastFrame() ?? "");
    expect(out).toMatch(/\d+\/\d+ task.*failed/);
    unmount();
  });
});
