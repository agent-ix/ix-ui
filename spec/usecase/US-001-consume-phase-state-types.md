---
id: US-001
title: "Consume Phase State Types in a CLI Package"
type: US
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-001"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-002"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-003"
    type: "derives_into"
    cardinality: "1:N"
---

## Story

As a **CLI package author**,
I want to import `PhaseState` and `PHASE_GLYPHS` from `@agent-ix/ix-ui-semantic`,
so that my package uses the canonical state vocabulary without defining its own.

## Acceptance Criteria

- **US-001-AC-1**: I can `import type { PhaseState } from "@agent-ix/ix-ui-semantic"` and use it as a type annotation for any phase-tracking variable.
- **US-001-AC-2**: I can `import { PHASE_GLYPHS } from "@agent-ix/ix-ui-semantic"` and look up the correct TTY glyph for any `PhaseState` value at runtime.
- **US-001-AC-3**: The import does not trigger any bundler warning about missing Node.js builtins or browser globals.

## Context

This story covers the lowest-level consumption path. The package author is not building a PhaseTable — they need the vocabulary to annotate their own data structures.
