---
id: FR-005
title: "TaskList Component — Sequential and Concurrent Task Execution"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/usecase/US-003"
    type: "derived_from"
    cardinality: "N:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-002"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/non-functional/cli/NFR-001"
    type: "constrained_by"
    cardinality: "N:1"
---

## Statement

The `cli` package SHALL expose a `<TaskList>` component for displaying a series of named tasks with per-task status (pending → running → done | failed) and a live spinner. Tasks are scheduled and executed by the component itself.

## Signature

```tsx
type TaskOutcome = void | { skip: string };

interface TaskDef {
  title: string;
  enabled?: boolean;                                          // skip when false
  task: (helpers: TaskHelpers) => Promise<TaskOutcome> | TaskOutcome;
}

interface TaskHelpers {
  setStatus(text: string): void;        // updates the active row's right-side status text
  log(text: string): void;              // appends a dim sub-line beneath the current row
  signal: AbortSignal;                  // aborts when the component unmounts
}

interface TaskListProps {
  header: string | null;                // wraps the list in a <Frame>; null renders bare
  tasks: TaskDef[];
  concurrent?: boolean;                 // run all tasks in parallel; default false (sequential)
  onComplete?: (result: TaskListResult) => void;
  onError?: (err: Error) => void;       // called once the first task throws
  exitOnError?: boolean;                // default true; halts subsequent sequential tasks
  tail?: ReactNode;                     // overrides the default success / failure tail
}

interface TaskListResult {
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
}

const TaskList: FC<TaskListProps>;
```

## Acceptance Criteria

### Rendering

- **FR-005-AC-1**: When `header` is non-null, `<TaskList>` SHALL render inside `<Frame header={header} status={...}>`. Aggregate `status` is `"running"` until the schedule completes, `"passed"` if all tasks completed without failure, `"failed"` otherwise.
- **FR-005-AC-2**: Each task row SHALL be rendered as a `<Box flexDirection="row">` with: leading glyph (per state), task title, optional dim status text (set via `helpers.setStatus`), and elapsed time once the task completes.
  - `pending`: `·` (dim)
  - `running`: braille spinner frame (cyan)
  - `done`: `•` (cyan)
  - `failed`: `○` (red)
  - `skipped`: `○` (dim) with title appended `· skipped: <reason>` dim
- **FR-005-AC-3**: Sub-lines emitted via `helpers.log()` SHALL render dim at column `NOTE_INDENT` beneath the active row and remain visible after the task transitions to `done` or `failed`.
- **FR-005-AC-4**: When a task fails, the error message SHALL render at column `ERROR_INDENT` beneath the failed row, dim, with the `Error.message` text. If the error is a non-Error value, `String(err)` is used.

### Execution

- **FR-005-AC-5**: When `concurrent === false` (default), tasks SHALL execute strictly in array order. If a task throws and `exitOnError !== false`, subsequent tasks SHALL render `skipped` (with reason `"upstream task failed"`) and SHALL NOT execute.
- **FR-005-AC-6**: When `concurrent === true`, all tasks SHALL start in parallel. Failures do not halt sibling tasks. The aggregate status awaits `Promise.allSettled`.
- **FR-005-AC-7**: When `enabled === false`, the task SHALL render `skipped` with reason `"disabled"` and SHALL NOT execute.
- **FR-005-AC-8**: When a task returns `{ skip: reason }`, it SHALL render `skipped` with that reason.

### Lifecycle

- **FR-005-AC-9**: Tasks start executing on first mount of `<TaskList>`. Re-rendering with the same `tasks` array reference does NOT restart. Re-rendering with a different `tasks` array reference resets the schedule and re-runs from task 0 (consumers who want stability across renders MUST memoize the tasks array). Consumers may force a fresh run via React `key` prop.
- **FR-005-AC-10**: On unmount mid-run, in-flight tasks receive abort signal via `helpers.signal`. Components consuming the signal (e.g. wrapping `execa`) SHALL cancel.
- **FR-005-AC-11**: `onComplete(result)` fires once after the schedule settles. `onError(err)` fires for the first failure (sequential) or once at completion (concurrent).

### Tail

- **FR-005-AC-12**: When all tasks pass and no explicit `tail` is set, the default tail SHALL be `{count} task(s) completed in {duration}s` with `tailVariant="success"`.
- **FR-005-AC-13**: When any task failed and no explicit `tail` is set, the default tail SHALL be `{failed}/{count} task(s) failed in {duration}s` with `tailVariant="error"`.

### Edge cases

- **FR-005-AC-14**: An empty `tasks` array SHALL render header + opener + summary tail `0 task(s) completed in 0.0s` (`tailVariant="success"`). `onComplete({ passed: 0, failed: 0, skipped: 0, durationMs: 0 })` fires once on first mount.
- **FR-005-AC-15**: Calling `helpers.setStatus(...)` or `helpers.log(...)` after a task has settled SHALL be a no-op (no console warning, no rendered change).
- **FR-005-AC-16**: When `concurrent === true`, `onError(err)` fires once at completion with the first thrown error encountered (in array order). Other failures are reflected in the per-row state but do not fire additional `onError` calls.

### Identity and callback contracts

- **FR-005-AC-17**: Tasks are identified by their position in the `tasks` array. React keys for task rows SHALL use the array index. Consumers who reorder tasks across renders without changing the array reference SHALL expect rows to swap state (since identity is positional, not by `title`).
- **FR-005-AC-18**: If `onComplete` or `onError` callbacks throw (synchronously or return a rejected Promise), the error SHALL propagate up to the surrounding error boundary or `render()` (FR-008-AC-8). The schedule SHALL NOT retry or swallow the error. The schedule's settled rows remain rendered.

## Rendered Example

### Sequential, all passing

```tsx
<TaskList
  header="ix local auth invite"
  tasks={[
    { title: "Connecting to identity service", task: async () => { await ping(); } },
    { title: "Creating invite token",          task: async (h) => { h.setStatus("for alice@example.com"); await mint(); } },
    { title: "Writing token to clipboard",     task: async () => { await pbcopy(); } },
  ]}
/>
```

```
 ⊙  [ ix local auth invite ]
 └──┐
    • Connecting to identity service                          0.4s
    • Creating invite token  for alice@example.com            1.2s
    • Writing token to clipboard                              0.1s

       └──•  3 task(s) completed in 1.7s
```

### Failure halts sequential schedule

```
 ⊗  [ ix local auth invite ]
 └──┐
    • Connecting to identity service                          0.4s
    ○ Creating invite token  for alice@example.com           1.5s
        identity returned 503: backend unavailable
    ○ Writing token to clipboard · skipped: upstream task failed

 ⊗  1/3 task(s) failed in 1.9s
```

## Constraints

- **FR-005-CON-1**: Task execution is implemented inside `<TaskList>` using React effects + a small scheduler. No external task runner library is used.
- **FR-005-CON-2**: Per FR-001-AC-3, no direct stdout writes.
- **FR-005-CON-3**: Glyph and indent vocabulary is imported from FR-016 / semantic.
