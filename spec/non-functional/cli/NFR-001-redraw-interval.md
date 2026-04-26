---
id: NFR-001
title: "PhaseTable TTY Redraw Interval — 80 ms"
artifact_type: NFR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-002"
    type: "constrains"
    cardinality: "1:1"
---

## Statement

The `PhaseTable` TTY animation loop SHALL fire at an interval of exactly **80 milliseconds**.

## Rationale

80 ms yields ≈12.5 redraws per second — smooth enough for the braille spinner to appear fluid without saturating the terminal write buffer or consuming excessive CPU on constrained machines.

## Acceptance Criteria

- **NFR-001-AC-1**: The `setInterval` call that drives TTY redraws uses a period of `80` ms (not shorter, not longer).
- **NFR-001-AC-2**: No alternative redraw path (e.g., `requestAnimationFrame`, `setTimeout` loop) exists in the component.
