---
id: FR-003
title: "Listing Component — Static Listings, Status Views, Mixed Flows"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/usecase/US-003"
    type: "derived_from"
    cardinality: "N:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-002"
    type: "depends_on"
    cardinality: "1:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
---

## Statement

The `cli` package SHALL expose a `<Listing>` component (and its body sub-components `<Group>`, `<Item>`, `<Note>`) for orbit-framed renderings of static listings, status views, and short flows. `<Listing>` is the JSX entry point for any non-task command output.

## Signature

```tsx
interface ListingProps {
  header: string;
  status?: "running" | "passed" | "failed";   // default: "running"
  tail?: ReactNode;
  tailVariant?: "success" | "warn" | "error"; // default: "success"
  children?: ReactNode;
}

interface GroupProps  { name: string; children?: ReactNode; }
interface ItemProps   { name: string; description?: string; }
interface NoteProps   { children: ReactNode; }

const Listing: FC<ListingProps>;
const Group:   FC<GroupProps>;
const Item:    FC<ItemProps>;
const Note:    FC<NoteProps>;
```

## Acceptance Criteria

### Composition

- **FR-003-AC-1**: `<Listing>` is implemented as a thin wrapper over `<Frame>` (FR-002) that forwards `header`, `status`, `tail`, and `tailVariant` and renders its children inside the frame body.
- **FR-003-AC-2**: `<Group name>` renders a blank line followed by `name` styled bold cyan at column `ROW_INDENT` (per FR-016). It SHALL accept children (Items, Notes, plain `<Text>`s).
- **FR-003-AC-3**: `<Item name description?>` renders a single body row: `{ROW_INDENT}{GLYPH_DONE} {name}{description ? "  — " + dim(description) : ""}` (per FR-016).
- **FR-003-AC-4**: `<Note>` renders its children at column `NOTE_INDENT` styled dim — for inline progress hints between Items.

### Lifecycle and animation

- **FR-003-AC-5**: When `status === "running"`, the orbit header animates per FR-002-AC-1.
- **FR-003-AC-6**: A consumer signals completion by re-rendering `<Listing>` with `status="passed"` (or `"failed"`) and providing `tail`. State changes flow through React props — no imperative methods.
- **FR-003-AC-7**: A consumer using `render()` (FR-008) MAY unmount the listing by returning a Promise that resolves once the final state is shown for at least one frame; `render()` flushes the final frame to scrollback before returning.

### Interactive interruption

- **FR-003-AC-8**: When a prompt component (FR-006) is rendered as a child of (or sibling alongside) a `<Listing>`, Ink delegates raw input to the prompt; the listing's animated header continues running.
- **FR-003-AC-9**: When a consumer needs an interaction outside the Ink tree, they SHALL use `render()`'s `unmount()` + re-`render()` pattern (FR-008). `<Listing>` exposes no out-of-tree handoff API.

## Rendered Examples

### Pure listing with success tail

```tsx
render(
  <Listing
    header="ix elements list"
    status="passed"
    tail="3 element type(s) available."
  >
    <Item name="typescript-react-lib" description="TypeScript React libraries" />
    <Item name="ix-package-cookiecutter" description="Service scaffolds" />
    <Item name="config-overlay" description="Env-overlay configs" />
  </Listing>
);
```

Output:
```
 ⊙  [ ix elements list ]
 └──┐
    • typescript-react-lib  — TypeScript React libraries
    • ix-package-cookiecutter  — Service scaffolds
    • config-overlay  — Env-overlay configs

       └──•  3 element type(s) available.
```

### Group + Items

```tsx
<Listing header="ix local list" status="passed" tail="2 cluster(s).">
  <Group name="dev">
    <Item name="auth" description="Identity stack" />
    <Item name="catalog" description="Service catalog" />
  </Group>
  <Group name="alpha">
    <Item name="auth" description="Identity stack" />
  </Group>
</Listing>
```

```
 ⊙  [ ix local list ]
 └──┐

    dev
    • auth  — Identity stack
    • catalog  — Service catalog

    alpha
    • auth  — Identity stack

       └──•  2 cluster(s).
```

### Failure

```tsx
<Listing header="ix elements new" status="failed" tail="Element directory already exists." tailVariant="error" />
```

```
 ⊗  [ ix elements new ]

  ⊗  Element directory already exists.
```

## Constraints

- **FR-003-CON-1**: No imperative listing API exists. The public surface is JSX components only.
- **FR-003-CON-2**: Body component glyphs and indents are imported from FR-016.
- **FR-003-CON-3**: Per FR-001-AC-3, no direct stdout writes.
