---
id: FR-009
title: "colors.red — ANSI 256 Muted Terracotta Red"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-010"
    type: "depends_on"
    cardinality: "1:1"
---

## Description

`colors.red` is a string-wrapping function that applies ANSI 256 colour 167 (muted terracotta red) to its input. This colour is softer than standard ANSI bright red and is the canonical error/failure colour for the Agent IX terminal design system.

## Definition

```ts
const red = (s: string) => `\x1b[38;5;167m${s}\x1b[0m`;
```

## Rationale

Bright ANSI red (`\x1b[31m`) reads as alarming in contexts where a failure is routine (e.g., a single failing service in a batch deploy). ANSI 256 colour 167 is visually distinct from success colours without the psychological harshness of fire-engine red.

## Constraints

- **FR-009-CON-1**: The escape sequence SHALL be `\x1b[38;5;167m` (foreground, 256-colour mode, index 167) with `\x1b[0m` reset. Other red variants (e.g., `\x1b[31m`) SHALL NOT be substituted.

## Acceptance Criteria

- **FR-009-AC-1**: `colors.red("x")` returns a string containing `\x1b[38;5;167m`.
- **FR-009-AC-2**: `colors.red("x")` ends with `\x1b[0m`.
- **FR-009-AC-3**: `colors.red("hello")` contains `"hello"` between the escape sequences.
