import React, { useEffect, useRef, useState } from "react";
import { Box, Text } from "ink";
import { BRAILLE_SPINNER } from "@agent-ix/ix-ui-semantic";
import {
  ROW_INDENT,
  NOTE_INDENT,
  ERROR_INDENT,
  GLYPH_DONE,
  GLYPH_FAIL,
  GLYPH_WAITING,
  GLYPH_CANCELLED,
  colors,
} from "../style.js";
import { useInterval } from "../hooks/useInterval.js";
import { Frame, type FrameStatus, type TailVariant } from "./Frame.js";

const TICK_MS = 80;

export type TaskOutcome = void | { skip: string };

export interface TaskHelpers {
  setStatus(text: string): void;
  log(text: string): void;
  signal: AbortSignal;
}

export interface TaskDef {
  title: string;
  enabled?: boolean;
  task: (helpers: TaskHelpers) => Promise<TaskOutcome> | TaskOutcome;
}

export interface TaskListResult {
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
}

export interface TaskListProps {
  header: string | null;
  tasks: TaskDef[];
  concurrent?: boolean;
  exitOnError?: boolean;
  onComplete?: (r: TaskListResult) => void;
  onError?: (e: Error) => void;
  tail?: React.ReactNode;
  tailVariant?: TailVariant;
}

type RowState =
  | { kind: "pending" }
  | {
      kind: "running";
      status: string | null;
      logs: string[];
      startedAt: number;
    }
  | { kind: "done"; status: string | null; logs: string[]; durationMs: number }
  | { kind: "failed"; error: string; logs: string[]; durationMs: number }
  | { kind: "skipped"; reason: string };

const initialRow = (): RowState => ({ kind: "pending" });

const stateGlyph = (s: RowState, tick: number): React.ReactNode => {
  if (s.kind === "pending") return GLYPH_WAITING;
  if (s.kind === "running")
    return colors.cyan(BRAILLE_SPINNER[tick % BRAILLE_SPINNER.length]);
  if (s.kind === "done") return GLYPH_DONE;
  if (s.kind === "failed") return GLYPH_FAIL;
  return GLYPH_CANCELLED;
};

const rowDuration = (s: RowState): string => {
  if (s.kind === "running") return "";
  if (s.kind === "done" || s.kind === "failed")
    return `${(s.durationMs / 1000).toFixed(1)}s`;
  return "";
};

/** Sequential or concurrent named-task execution. (FR-005) */
export const TaskList: React.FC<TaskListProps> = ({
  header,
  tasks,
  concurrent = false,
  exitOnError = true,
  onComplete,
  onError,
  tail,
  tailVariant,
}) => {
  const [rows, setRows] = useState<RowState[]>(() => tasks.map(initialRow));
  const [tick, setTick] = useState(0);
  const [done, setDone] = useState(false);
  useInterval(() => setTick((t) => t + 1), done ? null : TICK_MS);

  // Track tasks ref for stable identity check
  const tasksRef = useRef(tasks);
  const settledRef = useRef<boolean[]>(tasks.map(() => false));
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    if (tasksRef.current !== tasks) {
      tasksRef.current = tasks;
      settledRef.current = tasks.map(() => false);
      startedAtRef.current = Date.now();
      setRows(tasks.map(initialRow));
      setDone(false);
    }
  }, [tasks]);

  useEffect(() => {
    let unmounted = false;
    const ac = new AbortController();
    const startedAt = startedAtRef.current;

    const updateRow = (i: number, fn: (r: RowState) => RowState) => {
      if (unmounted) return;
      setRows((prev) => {
        const next = prev.slice();
        next[i] = fn(next[i]);
        return next;
      });
    };

    const helpersFor = (i: number): TaskHelpers => ({
      setStatus(text) {
        if (settledRef.current[i]) return;
        updateRow(i, (r) =>
          r.kind === "running" ? { ...r, status: text } : r,
        );
      },
      log(text) {
        if (settledRef.current[i]) return;
        updateRow(i, (r) => {
          if (
            r.kind === "running" ||
            r.kind === "done" ||
            r.kind === "failed"
          ) {
            return { ...r, logs: [...r.logs, text] };
          }
          return r;
        });
      },
      signal: ac.signal,
    });

    const runOne = async (
      i: number,
      def: TaskDef,
    ): Promise<{ skipped?: string; failed?: Error }> => {
      if (def.enabled === false) {
        updateRow(i, () => ({ kind: "skipped", reason: "disabled" }));
        settledRef.current[i] = true;
        return { skipped: "disabled" };
      }
      const t0 = Date.now();
      updateRow(i, () => ({
        kind: "running",
        status: null,
        logs: [],
        startedAt: t0,
      }));
      try {
        const result = await def.task(helpersFor(i));
        const durationMs = Date.now() - t0;
        if (result && typeof result === "object" && "skip" in result) {
          updateRow(i, () => ({ kind: "skipped", reason: result.skip }));
          settledRef.current[i] = true;
          return { skipped: result.skip };
        }
        updateRow(i, (r) => ({
          kind: "done",
          status: r.kind === "running" ? r.status : null,
          logs: r.kind === "running" ? r.logs : [],
          durationMs,
        }));
        settledRef.current[i] = true;
        return {};
      } catch (e) {
        const durationMs = Date.now() - t0;
        const err = e instanceof Error ? e : new Error(String(e));
        updateRow(i, (r) => ({
          kind: "failed",
          error: err.message,
          logs: r.kind === "running" ? r.logs : [],
          durationMs,
        }));
        settledRef.current[i] = true;
        return { failed: err };
      }
    };

    const finalize = (): void => {
      if (unmounted) return;
      setDone(true);
      // Compute final counts from the latest row state via setRows updater
      // pattern (avoids stale-closure reads).
      setRows((latest) => {
        let p = 0;
        let f = 0;
        let s = 0;
        for (const r of latest) {
          if (r.kind === "done") p++;
          else if (r.kind === "failed") f++;
          else if (r.kind === "skipped") s++;
        }
        if (onComplete) {
          onComplete({
            passed: p,
            failed: f,
            skipped: s,
            durationMs: Date.now() - startedAt,
          });
        }
        return latest;
      });
    };

    const runSequential = async () => {
      let firstError: Error | undefined;
      for (let i = 0; i < tasks.length; i++) {
        if (unmounted) return;
        if (firstError && exitOnError) {
          updateRow(i, () => ({
            kind: "skipped",
            reason: "upstream task failed",
          }));
          settledRef.current[i] = true;
          continue;
        }
        const r = await runOne(i, tasks[i]);
        if (r.failed && !firstError) {
          firstError = r.failed;
          if (onError) onError(firstError);
        }
      }
      finalize();
    };

    const runConcurrent = async () => {
      const results = await Promise.allSettled(
        tasks.map((t, i) => runOne(i, t)),
      );
      const firstFailure = results.find(
        (r) => r.status === "fulfilled" && r.value.failed,
      );
      if (firstFailure && firstFailure.status === "fulfilled") {
        if (onError) onError(firstFailure.value.failed!);
      }
      finalize();
    };

    if (tasks.length === 0) {
      finalize();
    } else if (concurrent) {
      void runConcurrent();
    } else {
      void runSequential();
    }

    return () => {
      unmounted = true;
      ac.abort();
    };
  }, [tasks]);

  const failed = rows.filter((r) => r.kind === "failed").length;
  const totalDurationS = ((Date.now() - startedAtRef.current) / 1000).toFixed(
    1,
  );
  const aggregateStatus: FrameStatus = !done
    ? "running"
    : failed > 0
      ? "failed"
      : "passed";

  const computedTail =
    tail ??
    (done
      ? aggregateStatus === "passed"
        ? `${rows.length} task${rows.length === 1 ? "" : "s"} completed in ${totalDurationS}s`
        : `${failed}/${rows.length} task${rows.length === 1 ? "" : "s"} failed in ${totalDurationS}s`
      : undefined);
  const computedTailVariant: TailVariant =
    tailVariant ?? (aggregateStatus === "failed" ? "error" : "success");

  const body = (
    <>
      {tasks.map((def, i) => {
        const r = rows[i];
        const elapsed = rowDuration(r);
        const reasonSuffix =
          r.kind === "skipped" ? colors.dim(` · skipped: ${r.reason}`) : "";
        const statusText =
          r.kind === "running" && r.status
            ? `  ${r.status}`
            : r.kind === "done" && r.status
              ? `  ${r.status}`
              : "";
        const titleColor =
          r.kind === "skipped" ? colors.dim(def.title) : def.title;
        return (
          <React.Fragment key={i}>
            <Box flexDirection="row">
              <Text>{ROW_INDENT}</Text>
              <Text>{stateGlyph(r, tick)} </Text>
              <Box flexGrow={1}>
                <Text>
                  {titleColor}
                  {colors.dim(statusText)}
                  {reasonSuffix}
                </Text>
              </Box>
              <Box width={6} justifyContent="flex-end">
                <Text>{elapsed}</Text>
              </Box>
            </Box>
            {(r.kind === "running" ||
              r.kind === "done" ||
              r.kind === "failed") &&
              r.logs.map((l, li) => (
                <Text key={li}>
                  {NOTE_INDENT}
                  {colors.dim(l)}
                </Text>
              ))}
            {r.kind === "failed" ? (
              <Text>
                {ERROR_INDENT}
                {colors.dim(r.error)}
              </Text>
            ) : null}
          </React.Fragment>
        );
      })}
    </>
  );

  if (header == null) return <Box flexDirection="column">{body}</Box>;

  return (
    <Frame
      header={header}
      status={aggregateStatus}
      tail={computedTail}
      tailVariant={computedTailVariant}
    >
      {body}
    </Frame>
  );
};
