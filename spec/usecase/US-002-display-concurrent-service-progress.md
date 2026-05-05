---
id: US-002
title: "Display Concurrent Multi-Service Progress With Phase Columns"
artifact_type: US
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-004"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-007"
    type: "derives_into"
    cardinality: "1:N"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-008"
    type: "derives_into"
    cardinality: "1:N"
---

## Story

As a **CLI command author** running concurrent operations across multiple services,
I want a `<PhaseTable>` component that tracks each service through configurable phase columns and renders live progress in TTY or plain text in CI,
so that operators get real-time visibility without me writing any rendering logic.

## Acceptance Criteria

- **US-002-AC-1**: I render `<PhaseTable services={[...]} phases={["build","deploy","ready"]} />` via `render()` and a live table appears immediately in a TTY.
- **US-002-AC-2**: When my component re-renders with an updated `services` prop (one row's phase moved from `pending` to `running`), the row updates in place within one animation tick (≤80 ms).
- **US-002-AC-3**: In a CI environment (non-TTY), Ink emits each render as a frame; the rendered table prints once per state change with no animation.
- **US-002-AC-4**: When all phases complete (or any fail), I re-render with `status="passed"` (or `"failed"`) and the table freezes — header glyph stops animating, summary line shows final counts.
- **US-002-AC-5**: When I provide `tailEntry={{ name: "my-app", baseDomain: "ix.internal" }}` and aggregate status is `passed`, the frozen tail line includes the entry URL `https://my-app.ix.internal` cyan-underlined.
- **US-002-AC-6**: When the terminal is resized narrower mid-run, the table re-flows immediately — long status strings truncate at the cell boundary; rows do NOT wrap to additional physical lines.

## Context

This is the primary use case for `<PhaseTable>`. The phase column names are caller-defined so `<PhaseTable>` can serve any multi-step concurrent workflow.

The component pairs naturally with the async hooks (FR-007): `useExecaPhase` drives a phase transition when a child process completes, `useKubectlRollout` pushes pod-status strings into the row's `status` field, and `useHelmHookWatcher` watches umbrella-chart hook jobs. The component itself remains a pure render of its props.
