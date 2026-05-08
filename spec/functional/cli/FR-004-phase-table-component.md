---
id: FR-004
title: "PhaseTable Component — Concurrent Multi-Service Progress"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/usecase/US-002"
    type: "derived_from"
    cardinality: "N:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-002"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/non-functional/cli/NFR-001"
    type: "constrained_by"
    cardinality: "N:1"
---

## Statement

The `cli` package SHALL expose a `<PhaseTable>` component for displaying concurrent multi-service progress with named phase columns. State is provided declaratively via the `services` prop; the component renders one row per service with phase glyphs, an active-phase label or pod-status string, and elapsed-time.

## Signature

```tsx
type PhaseState = "pending" | "queued" | "running" | "done" | "failed"; // from semantic

interface ServiceRow<P extends string> {
  name: string;
  displayName?: string | ReactNode; // ANSI-allowed; defaults to name
  phases: Record<P, PhaseState>;
  status?: string | null; // active-phase label or pod status (e.g. "1/1")
  error?: string | null; // shown beneath row when any phase is "failed"
}

interface PhaseTableProps<P extends string> {
  header: string;
  status?: "running" | "passed" | "failed"; // overrides aggregate row state when set
  services: ServiceRow<P>[];
  phases: readonly P[];
  phaseLabels?: Partial<Record<P, string>>;
  hidePending?: boolean; // hide rows whose phases are all pending
  preflight?: ReactNode; // entries shown above the services block at outer level
  tail?: ReactNode; // overrides default tail
  tailIngressUrls?: string[]; // flat list of rendered ingress URLs, in chart-rendered order
  tailIngressHosts?: string[]; // configured `domain.hosts` (priority order); used to group URLs
  tailEntry?: { name: string; baseDomain: string }; // legacy single ingress URL adapter
}

const PhaseTable: <P extends string>(props: PhaseTableProps<P>) => ReactElement;
```

## Acceptance Criteria

### Layout

- **FR-004-AC-1**: `<PhaseTable>` SHALL render the following blocks in order, all aligned at the planet column (no outer indent):
  1. The `<Frame>` header line (`header`, `status`).
  2. Zero or more **outer-level preflight** lines from `preflight`, each separated from the header above and from the next preflight line below by a dim `GLYPH_PIPE` separator row. Preflight lines are NOT indented inside the services block.
  3. The **services block**: a `└──┐` opener (`ROUTE_INDENT`), one row per visible service indented at `ROW_INDENT`, and a dim summary row with a dim `GLYPH_DIM_DOT` followed by `elapsed {totalElapsedS}s · {readyCount}/{total} ready`.
  4. Zero or more **outer-level ingress group blocks** (siblings of the services block, separated from each other and from the services block by a single blank line). Each group is rendered per AC-9 and uses its own `ROUTE_INDENT` opener at the planet column — the URL rows visually close back under that opener, not under the services block.
- **FR-004-AC-2**: Each row SHALL be a flexbox `<Box flexDirection="row">` with three cells:
  1. **Name cell** — width = max display-name length across visible rows; left-aligned.
  2. **Status/label cell** — `flexGrow={1}`; truncates with `wrap="truncate-end"` when narrow.
  3. **Elapsed cell** — width = 6; right-aligned; renders `{seconds}s` or empty.
- **FR-004-AC-3**: When the terminal is resized narrower, the status cell SHALL truncate without wrapping the row to a second physical line. (Verified via mock `useStdout()` resize.)
- **FR-004-AC-4**: When `hidePending === true`, rows whose phases are all `pending` SHALL be omitted from the rendered output and the summary count.

### Glyphs and animation

- **FR-004-AC-5**: The leading glyph for each row reflects the current phase state, drawn from `PHASE_GLYPHS` (semantic) — for `running` and `queued` the braille spinner advances every NFR-001 tick.
- **FR-004-AC-6**: The aggregate status (passed to `<Frame>` and used by AC-7, AC-9, AC-10) defaults to:
  - `"failed"` if any visible row has a `failed` phase or the `status` prop is `"failed"`.
  - `"passed"` if all visible rows have all phases `done` or the `status` prop is `"passed"`.
  - `"running"` otherwise.
- **FR-004-AC-7**: The aggregate header animates only while `status === "running"`. On `passed` / `failed` the header freezes per FR-002-AC-2 / AC-3.

### Pod-status rendering

- **FR-004-AC-8**: When the active phase is the last phase in `phases` and `status` matches the pod-count pattern `^(\d+)/(\d+)(?:(\s*·\s*).+)?$`, the status cell SHALL color-code the count via `colorPods()` (cyan for fully ready, yellow for partial). Text after `·` SHALL be dim/gray, including active Helm hook text. The implementation reuses the `colorPods` helper from FR-016.
- **FR-004-AC-8a**: Completed row elapsed values SHALL render dim/gray while running row elapsed values remain normal.

### Tail

- **FR-004-AC-9**: When `tailIngressUrls` is non-empty AND aggregate status is `passed`, one or more ingress group blocks SHALL render as outer-level siblings of the services block (not inside its body). Grouping rule: each URL is assigned to the group keyed by the **longest matching suffix** in `tailIngressHosts`; URLs whose hostname does not match any configured host fall into a default group keyed by their full hostname (kept rather than dropped, so unexpected hosts remain visible to the operator). Within each group, URLs preserve their input order from `tailIngressUrls`; groups are rendered in the order their first URL appears in `tailIngressUrls` (deterministic from caller-supplied order). Each group renders as: a heading line `{GLYPH_INGRESS} {dim("Ingress")} · {host}` at the planet column, the shared `ROUTE_INDENT` opener (`└──┐`), and one cyan-underlined URL per row using `ROUTE_URL` (the URL row carries only the `→` glyph plus URL — the host-level opener already provides the visual closure that `└─` previously implied). `tailEntry` remains a legacy adapter that produces a single `https://{name}.{baseDomain}` URL grouped under its `baseDomain`. When `tailIngressHosts` is omitted or empty, all URLs collapse into one group keyed by each URL's full hostname (degenerate but safe).
- **FR-004-AC-10**: When aggregate status is `failed` and no explicit `tail` is set, the tail SHALL render `{n} service(s) failed` with `tailVariant="error"`.

### Preflight

- **FR-004-AC-11**: `preflight` content (any React node) SHALL render at the **outer level** above the services-block opener — at the planet column, NOT indented inside the services-block body. Multiple preflight lines SHALL be separated from the header above and from each other by dim `GLYPH_PIPE` separator rows. Standard preflight idioms include credential-resolution lines (`• Loading Helm charts from ghcr.io`) and entry-point notices (`• Starting App: <appName>`). Preflight is independent of `services` and persists across re-renders.

### Empty / invalid input

- **FR-004-AC-12**: An empty `services` array SHALL render as header + opener + summary `elapsed 0.0s · 0/0 ready` + tail (if any), with no row block. No crash.
- **FR-004-AC-13**: A `phases` value referenced in `services[].phases` that is not present in `props.phases` SHALL be ignored for animation/glyph selection; the row still renders but contributes only its known phases to status aggregation.
- **FR-004-AC-14**: When `services[].displayName` is omitted, the row SHALL render `services[].name` as the display name. The name-cell width is computed across the resolved display names of all visible rows.
- **FR-004-AC-15**: When `phases` is an empty array, the table SHALL render header + opener + summary `elapsed 0.0s · 0/0 ready` + tail (if any), with no row block. No crash. Aggregate status defaults to `"passed"` (vacuously) when all rows have zero phases done; consumers may override via `status` prop.
- **FR-004-AC-16**: Duplicate `services[].name` entries SHALL each render as a separate row. The component SHALL NOT deduplicate; consumers are responsible for unique names if uniqueness is desired (e.g. for React keys).

## Rendered Examples

### Auth app run, passed with multi-host ingress

```tsx
<PhaseTable
  header="ix local up · auth"
  phases={["pull", "secrets", "install", "ready"] as const}
  preflight={
    <>
      <Text> • Loading Helm charts from ghcr.io</Text>
      <Text> • Starting App: auth</Text>
    </>
  }
  services={[
    {
      name: "auth-service",
      displayName: "auth-service 0.9.3",
      phases: { pull: "done", secrets: "done", install: "done", ready: "done" },
      status: "1/1",
    },
    {
      name: "identity",
      displayName: "identity 0.10.2",
      phases: { pull: "done", secrets: "done", install: "done", ready: "done" },
      status: "1/1",
    },
    {
      name: "permission-service",
      displayName: "permission-service 0.4.9",
      phases: { pull: "done", secrets: "done", install: "done", ready: "done" },
      status: "1/1",
    },
  ]}
  phaseLabels={{
    pull: "pulling",
    secrets: "secrets",
    install: "installing",
    ready: "ready",
  }}
  tailIngressUrls={[
    "https://auth.dev.ix",
    "https://identity.dev.ix",
    "https://auth.luna.ix",
  ]}
  tailIngressHosts={["dev.ix", "luna.ix"]}
/>
```

```
 ⊙  [ ix local up · auth ]
 |
 • Loading Helm charts from ghcr.io
 |
 • Starting App: auth
 └──┐
    • auth-service 0.9.3        1/1                           12.1s
    • identity 0.10.2           1/1                           12.1s
    • permission-service 0.4.9  1/1                           12.1s
    • elapsed 12.1s · 3/3 ready

 ◎ Ingress · dev.ix
 └──┐
    →  https://auth.dev.ix
    →  https://identity.dev.ix

 ◎ Ingress · luna.ix
 └──┐
    →  https://auth.luna.ix
```

### One service failed

```tsx
<PhaseTable header="ix local up · auth" status="failed" services={[…]} ... />
```

```
 ⊗  [ ix local up · auth ]
 └──┐
    • auth-service 0.9.3        1/1                           4.0s
    ○ identity 0.10.2           install failed                4.2s
        helm upgrade returned exit 1: REVISION: 1
    • permission-service 0.4.9  1/1                           4.0s

    • elapsed 4.2s · 2/3 ready

 ⊗  1 service failed
```

## Constraints

- **FR-004-CON-1**: No imperative `transition()`, `setPodStatus()`, `setError()`, `start()`, `finish()` methods exist. State flows through props.
- **FR-004-CON-2**: Per FR-001-AC-7, the component does not read `process.stdout.columns`; width is sourced from `useStdout()`.
- **FR-004-CON-3**: Glyphs, colors, and connectors are imported from FR-016 / `@agent-ix/ix-ui-semantic` — no inline literals.
