---
id: StR-001
title: "Consistent Terminal Design Language Across All CLI Tools"
type: StR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-001"
    type: "satisfied_by"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-003"
    type: "satisfied_by"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-010"
    type: "satisfied_by"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "satisfied_by"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-002"
    type: "satisfied_by"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-003"
    type: "satisfied_by"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-016"
    type: "satisfied_by"
    cardinality: "1:N"
---

## Statement

All Agent IX CLI tools SHALL present a unified visual language — consistent glyphs, status colours, spinner animations, and command framing — regardless of which package or plugin authored the command.

## Rationale

Inconsistent terminal output across tools erodes operator confidence and slows diagnosis. A shared vocabulary means developers recognise state transitions instantly without reading labels.

## Context

- Multiple CLI packages (`local`, `elements`, `spec`, third-party plugins) compose into a single `ix` binary.
- Each package author must not invent their own spinners, status dots, or colour conventions.
- The terminal side of the design language is separate from the web/React side (`ix-themes`); they share conceptual intent but no runtime dependency.

## Success Indicators

- A developer switching between `ix up`, `ix elements init`, and `ix spec run` sees the same spinner frames, the same `●`/`○`/`·` status dots, and the same intro/outro framing.
- A new CLI package author can produce spec-compliant output by importing `@agent-ix/ix-ui-cli` with no additional styling work.
