---
id: StR-002
title: "Platform-Agnostic Semantic Vocabulary With Zero Runtime Dependencies"
artifact_type: StR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-001"
    type: "satisfied_by"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/semantic/FR-007"
    type: "satisfied_by"
    cardinality: "1:N"
---

## Statement

The shared state vocabulary (phase states, glyphs, spinner frames) SHALL be publishable as a dependency-free package so that any TypeScript consumer — CLI tool, web dashboard, or test harness — can import types and constants without pulling in terminal or browser dependencies.

## Rationale

A monorepo design system that couples types to a renderer forces every consumer to carry renderer dependencies. Separating vocabulary from rendering makes `@agent-ix/ix-ui-semantic` safe to import in any context, including server-side code and test utilities.

## Context

- `@agent-ix/ix-ui-semantic` has zero runtime dependencies by design.
- `@agent-ix/ix-ui-cli` depends on `semantic` and adds terminal-specific rendering deps.
- `ix-themes` (web/React) may reference the same semantic vocabulary independently without importing `ix-ui-cli`.

## Success Indicators

- `@agent-ix/ix-ui-semantic/package.json` has no `dependencies` field (or an empty object).
- A Next.js server component can import `PhaseState` from `@agent-ix/ix-ui-semantic` without bundler warnings about Node-only APIs.
