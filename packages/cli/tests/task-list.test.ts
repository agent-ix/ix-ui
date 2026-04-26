import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runTaskList } from "../src/task-list.js";

// TC-039, TC-040, TC-041: FR-011-AC-1, AC-2, AC-3
describe("runTaskList", () => {
  let captured: string;

  beforeEach(() => {
    captured = "";
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      captured += typeof chunk === "string" ? chunk : chunk.toString();
      return true;
    });
  });

  afterEach(() => vi.restoreAllMocks());

  // TC-039: FR-011-AC-1 — success: intro + tasks + green outro
  it("successful runTaskList renders intro, tasks, and green outro", async () => {
    let taskRan = false;
    await runTaskList("My Command", [
      {
        title: "step one",
        task: async () => {
          taskRan = true;
        },
      },
    ]);
    expect(taskRan).toBe(true);
    // intro and outro should have been written
    expect(captured).toContain("My Command");
    expect(captured).toContain("Done.");
  });

  // TC-040: FR-011-AC-2 — failing task re-throws and renders red outro
  it("failing task causes red outro and re-throws", async () => {
    const err = new Error("task exploded");
    let threw: Error | null = null;

    try {
      await runTaskList("My Command", [
        {
          title: "bad step",
          task: async () => {
            throw err;
          },
        },
      ]);
    } catch (e) {
      threw = e as Error;
    }

    expect(threw).not.toBeNull();
    expect(threw?.message).toBe("task exploded");
    // outro should still have been written with failure content
    expect(captured).toContain("Failed");
  });

  // TC-041: FR-011-AC-3 — outro always rendered before throw
  it("outro is rendered before the error is re-thrown", async () => {
    const events: string[] = [];

    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      const s = typeof chunk === "string" ? chunk : chunk.toString();
      if (s.includes("Failed") || s.includes("Done")) {
        events.push("outro");
      }
      return true;
    });

    try {
      await runTaskList("Cmd", [
        {
          title: "fail",
          task: async () => {
            throw new Error("boom");
          },
        },
      ]);
    } catch {
      events.push("throw");
    }

    const outroIdx = events.indexOf("outro");
    const throwIdx = events.indexOf("throw");
    expect(outroIdx).toBeGreaterThanOrEqual(0);
    expect(throwIdx).toBeGreaterThan(outroIdx);
  });
});
