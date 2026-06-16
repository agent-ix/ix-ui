---
id: FR-003
title: "PHASE_GLYPHS Canonical Map"
type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-001"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-002"
    type: "depends_on"
    cardinality: "1:1"
---

## Description

`PHASE_GLYPHS` is the single authoritative mapping from every `PhaseState` value to its `PhaseGlyph`. All Agent IX CLI rendering components SHALL derive glyph output from this map rather than defining their own.

## Definition

```ts
export const PHASE_GLYPHS: Record<PhaseState, PhaseGlyph> = {
  pending: { tty: "·",  nonTty: "pending", animated: false },
  queued:  { tty: "⏳", nonTty: "queued",  animated: true  },
  running: { tty: "⟳",  nonTty: "running", animated: true  },
  done:    { tty: "✓",  nonTty: "done",    animated: false },
  failed:  { tty: "✗",  nonTty: "failed",  animated: false },
};
```

## Constraints

- **FR-003-CON-1**: The map SHALL cover every value in `PhaseState`; TypeScript's `Record<PhaseState, PhaseGlyph>` type ensures exhaustiveness at compile time.
- **FR-003-CON-2**: Glyph character values are normative. Consumer packages SHALL NOT override individual entries; they SHALL render these exact characters.

## Acceptance Criteria

- **FR-003-AC-1**: `PHASE_GLYPHS` is exported from `@agent-ix/ix-ui-semantic`.
- **FR-003-AC-2**: `PHASE_GLYPHS` contains exactly five entries, one per `PhaseState` value.
- **FR-003-AC-3**: Each entry's `tty` and `nonTty` fields are non-empty strings.
- **FR-003-AC-4**: `pending`, `done`, `failed` have `animated: false`; `queued`, `running` have `animated: true`.
