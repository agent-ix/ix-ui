---
id: FR-004
title: "PhaseTable.transition() — State Update"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-001"
    type: "depends_on"
    cardinality: "1:1"
---

## Description

`transition(service, phase, state)` updates the phase state for a named service row and records timing milestones.

## Signature

```ts
transition(service: string, phase: P, state: PhaseState): void
```

## Behavior

- Finds the row matching `service` by name.
- Sets `row.phases[phase] = state`.
- If `state === "running"` and `phase === phases[0]` (the first phase): records `row.startMs = Date.now()`.
- If `state === "done"` and `phase === phases[phases.length - 1]` (the last phase): records `row.endMs = Date.now()`.
- If `state === "failed"` (any phase): records `row.endMs = Date.now()`.
- In non-TTY mode: immediately writes `[T+<elapsed>s] <service>: <phase> <state>\n`.
- In TTY mode: the change is picked up on the next 80 ms tick; no immediate redraw.

## Constraints

- **FR-004-CON-1**: If `service` is not found in the row list, `transition()` SHALL return silently without throwing (see FR-007).

## Acceptance Criteria

- **FR-004-AC-1**: After `transition("svc-a", "build", "running")`, the row for `svc-a` has `phases.build === "running"`.
- **FR-004-AC-2**: `transition("svc-a", phases[0], "running")` sets `row.startMs` to approximately `Date.now()`.
- **FR-004-AC-3**: `transition("svc-a", phases[lastIdx], "done")` sets `row.endMs` to approximately `Date.now()`.
- **FR-004-AC-4**: `transition("svc-a", anyPhase, "failed")` sets `row.endMs`.
- **FR-004-AC-5**: In non-TTY mode, `transition()` writes exactly one line to stdout per call.
