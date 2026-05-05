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

- **FR-002-AC-5**: A `└──┐` opener line (using `ROUTE_INDENT` from FR-016) SHALL be rendered immediately beneath the header when `children` is non-empty. When the frame has only a `tail` (no body children), the opener SHALL NOT render.
- **FR-002-AC-6**: When `children` is empty AND `tail` is unset, the frame SHALL collapse to header-only (no opener, no tail).
- **FR-002-AC-7**: Body content (`children`) SHALL be rendered as direct children of an Ink `<Box flexDirection="column">` placed beneath the opener. `<Frame>` itself SHALL NOT impose any indentation on body children — body components (`<Item>`, `<Group>`, `<PhaseRow>`, etc.) own their own `ROW_INDENT` from FR-016.

### Tail

- **FR-002-AC-8**: When `tail` is set, a tail line SHALL be rendered beneath the body. The exact glyph and indent depend on `tailVariant`:
  - `"success"` (default): `ROUTE_OUT + GLYPH_DONE + "  " + <text>` — the connector `└──` plus the cyan `•` glyph (which together form `└──•`) followed by two spaces and the text.
  - `"warn"`: `ROUTE_OUT + colors.yellow("•") + "  " + colors.yellow(<text>)` — same connector, yellow bullet and text.
  - `"error"`: `" " + GLYPH_FAIL_MARK + "  " + colors.red(<text>)` — at column 1 (no `ROUTE_OUT`), the red `⊗` plus two spaces and red text. Error tails read as a callout outside the frame's body indentation.
- **FR-002-AC-9**: A blank line SHALL appear between the last body row (or the header, if no children) and the tail line.

### Composition

- **FR-002-AC-10**: `<Frame>` SHALL accept any Ink-renderable React node as `children`. Composing already-framed components (e.g. nesting a `<Listing>` inside another `<Frame>`'s body) is permitted but produces a nested-frame visual; consumers typically embed unframed primitives (`<Item>`, `<Group>`, `<PhaseRow>`, `<Text>`, `<Box>`, prompt components) instead.
- **FR-002-AC-11**: `<Frame>` SHALL forward `marginTop` and `marginLeft` props to its outer `<Box>` so callers can position the frame within larger layouts.
- **FR-002-AC-12**: When `header` is an empty string, the bracketed area SHALL still render (`[  ]`) — the indicator + opener layout is preserved. Consumers SHOULD provide a non-empty header; empty is supported but discouraged.

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
