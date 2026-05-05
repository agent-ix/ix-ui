---
id: FR-002
title: "Frame Component — Orbit Header, Opener, Tail"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/usecase/US-003"
    type: "derived_from"
    cardinality: "N:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-016"
    type: "depends_on"
    cardinality: "1:1"
---

## Statement

The `cli` package SHALL export a `<Frame>` component that wraps any block of UI content with the standard ix visual frame: an animated orbit header, a `└──┐` opener, the body content, and an optional `└──•` tail. `<Frame>` is the base layout primitive used by `<Listing>`, `<PhaseTable>`, and `<TaskList>`.

## Signature

```tsx
type FrameStatus = "running" | "passed" | "failed";

interface FrameProps {
  header: string;
  status?: FrameStatus;          // default: "running"
  tail?: ReactNode;              // optional summary line; rendered with `└──•` glyph
  tailVariant?: "success" | "warn" | "error";  // colors the tail glyph + text
  children?: ReactNode;          // body content rendered between opener and tail
}

const Frame: FC<FrameProps>;
```

## Acceptance Criteria

### Header

- **FR-002-AC-1**: When `status === "running"`, the header glyph SHALL be the animated orbit frame produced by the `<HeaderSpinner>` component (advancing every 240 ms per NFR-001) and the bracketed text SHALL be rendered via the `renderHeader(text)` helper (FR-016).
- **FR-002-AC-2**: When `status === "passed"`, the header glyph SHALL be `PHASE_PASS` (frozen orbit, FR-016).
- **FR-002-AC-3**: When `status === "failed"`, the header glyph SHALL be `PHASE_FAIL` (red `⊗`, FR-016).
- **FR-002-AC-4**: The header line SHALL be exactly `PLANET_COL` + `PHASE_WIDTH` + `[ … ]` columns wide; visual indicator width is constant across all three states.

### Opener and body

- **FR-002-AC-5**: A `└──┐` opener line (using `ROUTE_INDENT` from FR-016) SHALL be rendered immediately beneath the header whenever `children` is non-empty OR `tail` is set.
- **FR-002-AC-6**: When `children` is empty and `tail` is unset, the opener and tail SHALL NOT render — the frame collapses to header-only.
- **FR-002-AC-7**: Body content (`children`) SHALL be rendered as direct children of an Ink `<Box flexDirection="column">` placed beneath the opener. `<Frame>` SHALL NOT impose padding on body content beyond the standard `ROW_INDENT` left margin (FR-016) when `children` are non-component strings; component children manage their own indentation.

### Tail

- **FR-002-AC-8**: When `tail` is set, a tail line SHALL be rendered beneath the body using `ROUTE_OUT` + glyph + text. The glyph and color are determined by `tailVariant`:
  - `"success"` (default): `GLYPH_RESULT` (`✧`) in the default text color.
  - `"warn"`: `GLYPH_RESULT` in yellow.
  - `"error"`: `GLYPH_FAIL_MARK` (red `⊗`) plus the tail text in red.
- **FR-002-AC-9**: A blank line SHALL appear between the last body row and the tail line.

### Composition

- **FR-002-AC-10**: `<Frame>` SHALL accept any Ink-renderable React node as `children`, including other `<Frame>`s, `<Box>`s, `<Text>`s, `<PhaseTable>`s, and `<TaskList>`s.
- **FR-002-AC-11**: `<Frame>` SHALL forward all standard Ink layout props (`marginTop`, `marginLeft`, etc.) to its outer `<Box>` so callers can position the frame within larger layouts.

## Rendered Examples

### Header-only (no body, no tail)

```tsx
<Frame header="ix elements list" status="running" />
```

```
 ⊙  [ ix elements list ]
```

### With body and success tail

```tsx
<Frame header="ix elements list" status="passed" tail="3 element type(s) available." tailVariant="success">
  <Item name="typescript-react-lib" description="TypeScript React libraries" />
</Frame>
```

```
 ⊙  [ ix elements list ]
 └──┐
    • typescript-react-lib  — TypeScript React libraries

       └──•  3 element type(s) available.
```

### Failed state

```tsx
<Frame header="ix local up auth" status="failed" tail="1 service failed" tailVariant="error">
  <PhaseRow ... />
</Frame>
```

```
 ⊗  [ ix local up auth ]
 └──┐
    ○ identity 0.10.2  install failed  4.2s

       ⊗  1 service failed
```

## Constraints

- **FR-002-CON-1**: All glyphs, indents, and colors are imported from the FR-016 style module — no inline literals.
- **FR-002-CON-2**: Per FR-001, `<Frame>` writes nothing directly to stdout; it returns Ink elements only.
