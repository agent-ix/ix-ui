---
id: FR-007
title: "Async Work Hooks — useInterval, useExecaPhase, useKubectlRollout, useHelmHookWatcher"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-004"
    type: "supports"
    cardinality: "N:1"
---

## Statement

The `cli` package SHALL expose a small set of React hooks that wrap common async work (intervals, child-process execution, Kubernetes rollout polling, Helm hook watching) as state sources for components. Hooks SHALL handle cleanup on unmount via `AbortSignal` so unmounting a component cancels its in-flight work.

## Signature

```tsx
// useInterval — fires `cb` every `delay` ms while mounted; pause via delay = null.
function useInterval(cb: () => void, delay: number | null): void;

// useExecaPhase — runs an execa command and reports phase state.
type ExecaPhaseState =
  | { state: "idle" }
  | { state: "running"; pid: number }
  | { state: "done"; stdout: string }
  | { state: "failed"; error: Error; stderr: string };

function useExecaPhase(
  command: string,
  args: string[],
  opts?: ExecaOptions & { enabled?: boolean }
): ExecaPhaseState;

// useKubectlRollout — polls `kubectl get pods` for a label selector and reports ready counts.
interface RolloutStatus { ready: number; total: number; raw: string; }

function useKubectlRollout(
  selector: { name: string; namespace: string; label: string },
  opts?: { intervalMs?: number; enabled?: boolean }
): RolloutStatus | null;

// useHelmHookWatcher — polls Helm hook job statuses for a release.
interface HookStatus {
  jobName: string;
  phase: "pending" | "running" | "succeeded" | "failed";
  message?: string;
}

function useHelmHookWatcher(
  release: { namespace: string; name: string },
  opts?: { intervalMs?: number; enabled?: boolean }
): HookStatus[];
```

## Acceptance Criteria

### useInterval

- **FR-007-AC-1**: `useInterval(cb, delay)` SHALL fire `cb` every `delay` ms after the component mounts. Passing `delay = null` SHALL pause the interval without unmounting.
- **FR-007-AC-2**: `cb` is referenced via a ref so re-rendering with a new callback does not reset the interval.
- **FR-007-AC-3**: On unmount, the underlying `setInterval` SHALL be cleared. (Verified by absence of leaked timers in tests.)
- **FR-007-AC-4**: The orbit-header animation (FR-002) and braille spinner cells (FR-004) SHALL drive their frame index from `useInterval(tick, 80)` per NFR-001.

### useExecaPhase

- **FR-007-AC-5**: `useExecaPhase` SHALL return `{ state: "idle" }` when `opts.enabled === false` AND not yet started; `{ state: "running", pid }` once execa is spawned; `{ state: "done", stdout }` on success; `{ state: "failed", error, stderr }` on non-zero exit or spawn error.
- **FR-007-AC-6**: Changing `command` or `args` between renders SHALL NOT auto-restart a running subprocess. The hook spawns when `enabled` transitions from `false` (or `undefined`) to `true`. A subsequent transition `false → true` (e.g. retry) SHALL spawn a fresh subprocess; the prior subprocess's state is replaced.
- **FR-007-AC-7**: On unmount, the subprocess SHALL receive `SIGTERM` via `subprocess.kill()`. If the process does not exit within 1 s, `SIGKILL`.

### useKubectlRollout

- **FR-007-AC-8**: `useKubectlRollout` SHALL execute `kubectl get pods -n <namespace> -l <label> -o json` every `intervalMs` (default 1000). The hook returns the latest parsed status or `null` until the first poll completes.
- **FR-007-AC-9**: The polling loop SHALL be cancelled on unmount and on `enabled` transitioning to `false`.
- **FR-007-AC-10**: Errors during a poll (e.g. kubectl exit non-zero) SHALL NOT throw; the hook returns the previous `RolloutStatus` (or `null` if none) and continues polling.

### useHelmHookWatcher

- **FR-007-AC-11**: `useHelmHookWatcher` SHALL poll Helm hook job statuses via `kubectl get jobs -l helm.sh/hook,helm.sh/release-name=<name>` (or equivalent) every `intervalMs` (default 1000). Returns the current array of `HookStatus`.
- **FR-007-AC-12**: When a hook transitions to `failed`, the hook SHALL continue reporting it on subsequent polls until the component unmounts. Consumers decide how to react.

### Composition

- **FR-007-AC-13**: A component MAY use multiple async hooks simultaneously; cleanup is independent. Unmount cancels all of them.
- **FR-007-AC-14**: Hooks SHALL NOT directly call `process.stdout.write` or render output. They expose state; rendering is the consumer's responsibility (per FR-001-AC-3).
- **FR-007-AC-15**: For `useExecaPhase`, when the requested `command` is not available in `PATH` (or any other spawn error occurs), the hook SHALL transition to `{ state: "failed", error, stderr }` where `error.message` contains the underlying execa spawn error message. It SHALL NOT throw or crash the surrounding render.
- **FR-007-AC-16**: For `useKubectlRollout` and `useHelmHookWatcher`, when `kubectl` is not in `PATH` (or any poll error occurs), the hook SHALL keep returning the previous successful value (`null` / `[]` until the first successful poll, otherwise the last good result) per FR-007-AC-10 / AC-12. The hook SHALL NOT throw, crash, or expose a "failed" state — these polling hooks degrade silently and continue retrying.

## Constraints

- **FR-007-CON-1**: `useExecaPhase` requires `execa` as a dependency of the package; it is NOT re-exported.
- **FR-007-CON-2**: kubectl/helm hooks shell out via `execa`; failures to find these binaries surface as `failed` states with descriptive errors (e.g. `"kubectl not found in PATH"`).
- **FR-007-CON-3**: The hooks are deliberately small primitives. Higher-level orchestration lives in consumer code that composes these hooks.
