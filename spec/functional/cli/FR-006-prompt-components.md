---
id: FR-006
title: "Prompt Components — Text, Password, Confirm, Select, MultiSelect"
artifact_type: FR
relationships:
  - target: "ix://agent-ix/ix-ui/spec/usecase/US-003"
    type: "derived_from"
    cardinality: "N:1"
  - target: "ix://agent-ix/ix-ui/spec/functional/cli/FR-001"
    type: "depends_on"
    cardinality: "1:1"
---

## Statement

The `cli` package SHALL expose a set of Ink-native prompt components — `<TextPrompt>`, `<PasswordPrompt>`, `<ConfirmPrompt>`, `<SelectPrompt>`, `<MultiSelectPrompt>` — for collecting user input within an Ink render tree.

## Signature

```tsx
type PromptResult<T> = { ok: true; value: T } | { ok: false; cancelled: true };

interface BasePrompt {
  message: string;                          // shown above the input row
  hint?: string;                            // dim helper text below input
}

interface TextPromptProps extends BasePrompt {
  defaultValue?: string;
  placeholder?: string;
  validate?: (value: string) => string | null;   // return error string or null
  onSubmit: (result: PromptResult<string>) => void;
}

interface PasswordPromptProps extends BasePrompt {
  validate?: (value: string) => string | null;
  onSubmit: (result: PromptResult<string>) => void;
}

interface ConfirmPromptProps extends BasePrompt {
  defaultValue?: boolean;
  onSubmit: (result: PromptResult<boolean>) => void;
}

interface SelectPromptProps<T> extends BasePrompt {
  options: { label: string; value: T; hint?: string }[];
  defaultValue?: T;
  onSubmit: (result: PromptResult<T>) => void;
}

interface MultiSelectPromptProps<T> extends BasePrompt {
  options: { label: string; value: T; hint?: string }[];
  defaultValues?: T[];
  required?: boolean;                       // require at least one selection
  onSubmit: (result: PromptResult<T[]>) => void;
}

const TextPrompt:        FC<TextPromptProps>;
const PasswordPrompt:    FC<PasswordPromptProps>;
const ConfirmPrompt:     FC<ConfirmPromptProps>;
const SelectPrompt:      <T>(props: SelectPromptProps<T>) => JSX.Element;
const MultiSelectPrompt: <T>(props: MultiSelectPromptProps<T>) => JSX.Element;
```

## Acceptance Criteria

### Common behavior

- **FR-006-AC-1**: All prompts render their `message` on a header line prefixed by a cyan `?` glyph at column 1, followed by the input row beneath, optionally followed by a dim `hint` line.
- **FR-006-AC-2**: All prompts SHALL handle Ctrl-C / Esc by calling `onSubmit({ ok: false, cancelled: true })` and unmounting their input.
- **FR-006-AC-3**: All prompts SHALL handle Enter as confirmation, validate (where applicable), and call `onSubmit({ ok: true, value })` when valid. Validation errors render dim red beneath the input row and re-arm the prompt. If `validate()` throws, the thrown error's `.message` is rendered as the validation error and the prompt re-arms.
- **FR-006-AC-4**: After submission (success or cancel), the prompt SHALL render a frozen one-line summary: `? <message>  <result-or-«cancelled»>`. The input row, hint, and any validation message SHALL be removed.

### TextPrompt

- **FR-006-AC-5**: `<TextPrompt>` SHALL render an editable text field via `ink-text-input`. The field initial value is `defaultValue ?? ""` and `placeholder` is shown dim when empty.
- **FR-006-AC-6**: The submitted summary renders the entered value (or `«empty»` dim if empty and accepted).

### PasswordPrompt

- **FR-006-AC-7**: `<PasswordPrompt>` SHALL render the input with each character replaced by `•`. Internal value is held in component state; not displayed.
- **FR-006-AC-8**: The submitted summary renders `••••••••` (8 bullets fixed) regardless of input length.

### ConfirmPrompt

- **FR-006-AC-9**: `<ConfirmPrompt>` SHALL render `(Y/n)` or `(y/N)` per `defaultValue`. Y/y → `true`, N/n → `false`, Enter → `defaultValue ?? true`.
- **FR-006-AC-10**: The submitted summary renders `Yes` or `No` (capitalized).

### SelectPrompt

- **FR-006-AC-11**: `<SelectPrompt>` SHALL render the option list via `ink-select-input` with the cyan caret marking the active option. Up/Down moves; Enter selects.
- **FR-006-AC-12**: When an option has a `hint`, it renders dim to the right of the label with two-space separation.

### MultiSelectPrompt

- **FR-006-AC-13**: `<MultiSelectPrompt>` SHALL render the option list with `[ ]` / `[•]` checkboxes. Space toggles the focused option; Enter submits.
- **FR-006-AC-14**: When `required === true` and no option is selected at submit, validation error `"select at least one option"` renders and the prompt re-arms.

### Composition and focus

- **FR-006-AC-15**: Prompts MAY be rendered as children of `<Listing>`, `<Frame>`, or other layout containers. Their visual region (header + input + hint) SHALL fit within the parent's body without breaking the frame.
- **FR-006-AC-16**: When multiple prompts are present in a tree, only the most recently mounted prompt receives input. Submitted prompts render their frozen summary and do not consume input.

### Resize and unmount

- **FR-006-AC-17**: When the terminal is resized while a prompt is active, the prompt SHALL re-flow without losing the in-progress input value.
- **FR-006-AC-18**: When a prompt component unmounts before submission, no `onSubmit` callback fires.
- **FR-006-AC-19**: Multiple Enter keypresses within one render tick SHALL fire `onSubmit` at most once. After submission the prompt no longer consumes input.

### Non-interactive environments

- **FR-006-AC-20**: When `process.stdin` is not a TTY OR does not support raw mode, mounting any prompt component SHALL fire `onSubmit({ ok: false, cancelled: true })` immediately and render a frozen `? <message>  «no interactive stdin»` summary line. The package SHALL NOT throw "Raw mode is not supported" — it gracefully reports cancel.

## Rendered Example

```tsx
<Listing header="ix local auth invite" status="running">
  <TextPrompt
    message="Email address to invite"
    placeholder="user@example.com"
    onSubmit={(r) => r.ok && handleEmail(r.value)}
  />
</Listing>
```

While the prompt is active:
```
 ⊙  [ ix local auth invite ]
 └──┐
    ? Email address to invite
      › user@example.com
```

After submission:
```
 ⊙  [ ix local auth invite ]
 └──┐
    ? Email address to invite  alice@example.com
```

## Constraints

- **FR-006-CON-1**: Prompts use Ink's raw-input mode via `useInput()`. They MUST NOT call `process.stdin.setRawMode` directly.
- **FR-006-CON-2**: No imperative prompt API exists (no top-level `text()` / `password()` functions). Consumers integrate prompts as JSX inside their render tree.
- **FR-006-CON-3**: Per FR-001-AC-3, no direct stdout writes.
