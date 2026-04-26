---
id: FR-007
title: "PhaseTable — Silent No-Op on Unknown Service"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
---

## Description

`transition()`, `setPodStatus()`, and `setError()` called with a service name not present in the table SHALL silently return without throwing.

## Behavior

Each mutating method finds the row by name. If no row matches, the method returns immediately. No error is thrown, no warning is logged.

## Rationale

In concurrent multi-service deployments, race conditions or caller logic errors may cause a transition to be emitted for a service that was filtered out or never registered. A silent no-op prevents a transient caller bug from crashing the entire display and losing all progress output.

## Acceptance Criteria

- **FR-007-AC-1**: `transition("unknown-svc", "build", "running")` does not throw.
- **FR-007-AC-2**: `setPodStatus("unknown-svc", "1/1")` does not throw.
- **FR-007-AC-3**: `setError("unknown-svc", "timeout")` does not throw.
- **FR-007-AC-4**: No output is written to stdout or stderr for the no-op calls.
