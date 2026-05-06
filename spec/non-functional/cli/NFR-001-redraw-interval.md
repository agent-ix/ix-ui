---
id: NFR-001
title: "Animation Tick Interval — 80 ms"
artifact_type: NFR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-002"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-004"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-005"
    type: "constrains"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-007"
    type: "implemented_by"
    cardinality: "1:1"
---

## Statement

The animation tick interval for all live components in `@agent-ix/ix-ui-cli` (orbit-header spinner, braille spinner cells, phase-row glyphs in `running` / `queued` state, task spinners) SHALL fire at exactly **80 milliseconds**.

## Rationale

80 ms yields ≈12.5 redraws per second — smooth enough for the braille spinner to appear fluid without saturating the terminal write buffer or consuming excessive CPU on constrained machines. Ink reconciles frame diffs efficiently, so the 80 ms cadence carries no rendering cost beyond a setState-triggered render of the spinner-bearing components.

## Acceptance Criteria

- **NFR-001-AC-1**: The shared `useInterval(tick, 80)` hook (FR-007) drives every animated frame in the package. Components requiring animation SHALL consume this hook (or a wrapper that uses it) — no raw `setInterval` calls exist in component code.
- **NFR-001-AC-2**: The orbit-header advance rate is `80 ms × HEADER_TICK_DIV (3)` = 240 ms per frame (FR-016-AC-12).
- **NFR-001-AC-3**: Braille spinner cells advance every 80 ms (one frame per tick).
- **NFR-001-AC-4**: No alternative animation path (e.g. `requestAnimationFrame`, `setTimeout` recursive loop, RxJS interval) exists in `packages/cli/src/`.
- **NFR-001-AC-5**: When the package is consumed in a non-TTY environment (Ink's static / plain mode, FR-008), the animation tick SHALL NOT fire — there is nothing to animate. Components SHALL render their frozen frame.
