---
id: FR-011
title: "runTaskList — Listr2 Wrapper With Clack Framing"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-012"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/usecase/US-003"
    type: "implements"
    cardinality: "1:1"
---

## Description

`runTaskList` wraps a Listr2 task array with consistent `@clack/prompts` intro/outro framing. It is the standard way for Agent IX CLI commands to run sequential or concurrent task lists.

## Signature

```ts
async function runTaskList(
  title: string,
  tasks: ListrTask[],
  opts?: { concurrent?: boolean; exitOnError?: boolean; successMessage?: string }
): Promise<void>
```

## Behavior

1. Calls `p.intro(title)` before running tasks.
2. Creates a `new Listr(tasks, { concurrent, exitOnError, rendererOptions: { collapseSubtasks: false } })`.
3. Calls `runner.run()`.
4. On success: calls `p.outro(pc.green(opts.successMessage ?? "Done."))`.
5. On failure: calls `p.outro(pc.red("Failed: <message>"))` then re-throws the error.

## Defaults

| Option | Default |
|--------|---------|
| `concurrent` | `false` |
| `exitOnError` | `true` |
| `successMessage` | `"Done."` |

## Acceptance Criteria

- **FR-011-AC-1**: A successful `runTaskList` call results in an intro line followed by tasks followed by a green outro.
- **FR-011-AC-2**: A failing task causes a red outro and re-throws — the caller receives the error.
- **FR-011-AC-3**: The outro is always rendered (success or failure) before any throw.
