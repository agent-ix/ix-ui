---
id: FR-001
title: "PhaseState Type Contract"
type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/stakeholder/StR-001"
    type: "implements"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/stakeholder/StR-002"
    type: "implements"
    cardinality: "1:1"
---

## Description

`PhaseState` is the canonical TypeScript string union type representing the lifecycle state of a single phase in any multi-step operation tracked by the Agent IX design system.

## Definition

```ts
export type PhaseState = "pending" | "queued" | "running" | "done" | "failed";
```

## Semantics

| Value | Meaning |
|-------|---------|
| `pending` | Phase has not started; no work is scheduled. |
| `queued` | Work is scheduled and waiting for a pool slot. |
| `running` | Active execution in progress. |
| `done` | Phase completed successfully. Terminal state. |
| `failed` | Phase completed with an error. Terminal state. |

## Constraints

- **FR-001-CON-1**: The set of five values is immutable. Consumer packages SHALL NOT extend or narrow this union locally; they SHALL import from `@agent-ix/ix-ui-semantic`.
- **FR-001-CON-2**: `done` and `failed` are terminal — once a phase reaches either state, no further transitions are defined by this vocabulary (enforcement is the caller's responsibility).

## Acceptance Criteria

| ID | Criteria | Verification |
|----|----------|--------------|
| FR-001-AC-1 | `PhaseState` is exported from the package root (`@agent-ix/ix-ui-semantic`) | Test |
| FR-001-AC-2 | The type is a string union of exactly five members: `pending`, `queued`, `running`, `done`, `failed` | Test |
| FR-001-AC-3 | A TypeScript compiler with `strict: true` SHALL reject an assignment of any string outside the five values to a `PhaseState` variable | Test |

- **FR-001-AC-1**: `PhaseState` is exported from the package root (`@agent-ix/ix-ui-semantic`).
- **FR-001-AC-2**: The type is a string union of exactly five members: `pending`, `queued`, `running`, `done`, `failed`.
- **FR-001-AC-3**: A TypeScript compiler with `strict: true` SHALL reject an assignment of any string outside the five values to a `PhaseState` variable.


## Dependencies

- **Upstream**: StR-001 (implements); StR-002 (implements)
