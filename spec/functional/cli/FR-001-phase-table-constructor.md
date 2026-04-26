---
id: FR-001
title: "PhaseTable Constructor"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-001"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/usecase/US-002"
    type: "implements"
    cardinality: "1:1"
---

## Description

`PhaseTable<P extends string>` is a generic, configurable phase-column table renderer. The constructor initialises one row per service and primes all phases to `"pending"`.

## Signature

```ts
class PhaseTable<P extends string = string> {
  constructor(serviceNames: string[], opts: PhaseTableOptions<P>)
}

interface PhaseTableOptions<P extends string = string> {
  phases: readonly P[];           // Required. Ordered phase column names.
  phaseLabels?: Partial<Record<P, string>>; // Human-readable active labels.
  isTTY?: boolean;                // Override TTY detection.
  isPlain?: boolean;              // Force non-TTY output even on TTY.
  header?: string;                // Optional animated header line.
  initialLineCount?: number;      // Lines already on stdout to erase on first draw.
}
```

## Behavior

- Each service name in `serviceNames` becomes one row.
- All phases in `opts.phases` are initialised to `"pending"` for every row.
- TTY mode is active when `(opts.isTTY ?? process.stdout.isTTY ?? false) && !opts.isPlain`.
- `initialLineCount` allows the caller to tell `PhaseTable` how many lines to erase before the first draw (prevents blank gaps when the caller wrote a pre-flight line before calling `start()`).

## Constraints

- **FR-001-CON-1**: `opts.phases` SHALL be non-empty. An empty `phases` array is permitted by the type but results in a table with no columns; callers are responsible for meaningful phase lists.
- **FR-001-CON-2**: `serviceNames` may be empty (see FR-008 for empty-list behaviour).

## Acceptance Criteria

- **FR-001-AC-1**: A `PhaseTable` constructed with `serviceNames = ["svc-a", "svc-b"]` and `phases = ["build", "deploy"]` has two rows, each with `build: "pending"` and `deploy: "pending"`.
- **FR-001-AC-2**: `opts.isTTY = false` forces non-TTY mode regardless of `process.stdout.isTTY`.
- **FR-001-AC-3**: `opts.isPlain = true` forces non-TTY mode even when `process.stdout.isTTY` is `true`.
