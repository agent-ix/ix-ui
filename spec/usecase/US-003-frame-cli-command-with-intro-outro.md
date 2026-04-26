---
id: US-003
title: "Frame a CLI Command With Consistent Intro and Outro"
artifact_type: US
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-011"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-012"
    type: "derives_into"
    cardinality: "1:N"
---

## Story

As a **CLI command author**,
I want `introCommand` and `outroSuccess`/`outroError` helpers that apply the standard Agent IX framing,
so that every command has the same visual intro/outro without me remembering the exact colour and style conventions.

## Acceptance Criteria

- **US-003-AC-1**: Calling `introCommand("ix elements init")` prints the command name in the standard bgCyan/black banner style.
- **US-003-AC-2**: Calling `outroSuccess("Scaffolded my-service.")` prints a green outro.
- **US-003-AC-3**: Calling `outroError("Registry unreachable.")` prints a red outro.
- **US-003-AC-4**: Using `runTaskList("title", tasks)` produces an intro, runs the tasks, and calls `outroSuccess` on completion or `outroError` on failure.

## Context

All Agent IX CLI commands are required to use `@agent-ix/ix-ui-cli` wrappers for intro/outro (per ix-cli NFR). This story ensures the primitives exist and are simple enough that there is no reason to call clack directly.
