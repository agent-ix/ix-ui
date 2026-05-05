import { useEffect, useState } from "react";
import { execa, type Options as ExecaOptions, type ResultPromise } from "execa";

export type ExecaPhaseState =
  | { state: "idle" }
  | { state: "running"; pid: number }
  | { state: "done"; stdout: string }
  | { state: "failed"; error: Error; stderr: string };

export interface UseExecaPhaseOptions extends ExecaOptions {
  enabled?: boolean;
}

const KILL_GRACE_MS = 1000;

/**
 * Runs a command via execa and reports its phase state. Cleanup on unmount
 * sends SIGTERM and (after 1 s) SIGKILL. (FR-007)
 */
export function useExecaPhase(
  command: string,
  args: string[],
  opts: UseExecaPhaseOptions = {},
): ExecaPhaseState {
  const [state, setState] = useState<ExecaPhaseState>({ state: "idle" });
  const enabled = opts.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let proc: ResultPromise | null = null;
    try {
      proc = execa(command, args, opts as ExecaOptions);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setState({ state: "failed", error: err, stderr: "" });
      return;
    }
    const pid = proc.pid;
    if (typeof pid === "number") {
      setState({ state: "running", pid });
    }
    proc.then(
      (result) => {
        if (cancelled) return;
        setState({
          state: "done",
          stdout: typeof result.stdout === "string" ? result.stdout : "",
        });
      },
      (err: { message?: string; stderr?: string }) => {
        if (cancelled) return;
        const error =
          err instanceof Error ? err : new Error(err?.message ?? String(err));
        setState({
          state: "failed",
          error,
          stderr: typeof err?.stderr === "string" ? err.stderr : "",
        });
      },
    );
    return () => {
      cancelled = true;
      if (proc && !proc.killed) {
        try {
          proc.kill("SIGTERM");
        } catch {
          /* already exited */
        }
        const killTimer = setTimeout(() => {
          if (proc && !proc.killed) {
            try {
              proc.kill("SIGKILL");
            } catch {
              /* already exited */
            }
          }
        }, KILL_GRACE_MS);
        proc.finally(() => clearTimeout(killTimer));
      }
    };
    // We intentionally re-run only when enable flips. command/args changes
    // do NOT auto-restart per FR-007-AC-6. Mount once per enable cycle.
  }, [enabled]);

  return state;
}
