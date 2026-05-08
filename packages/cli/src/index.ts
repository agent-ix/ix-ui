// Re-exports of Ink primitives consumers may need for ad-hoc layout
// (avoids requiring `ink` as a direct dependency of every consumer pkg).
export { Box, Text } from "ink";
export { useEffect, useState } from "react";

// Components
export {
  Frame,
  type FrameProps,
  type FrameStatus,
  type TailVariant,
} from "./components/Frame.js";
export { HeaderSpinner } from "./components/HeaderSpinner.js";
export {
  Listing,
  Group,
  Item,
  Note,
  type ListingProps,
  type GroupProps,
  type ItemProps,
  type NoteProps,
} from "./components/Listing.js";
export {
  PhaseTable,
  type PhaseTableProps,
  type ServiceRow,
} from "./components/PhaseTable.js";
export {
  TaskList,
  type TaskListProps,
  type TaskListResult,
  type TaskDef,
  type TaskHelpers,
  type TaskOutcome,
} from "./components/TaskList.js";
export {
  TextPrompt,
  type TextPromptProps,
} from "./components/prompts/TextPrompt.js";
export {
  PasswordPrompt,
  type PasswordPromptProps,
} from "./components/prompts/PasswordPrompt.js";
export {
  ConfirmPrompt,
  type ConfirmPromptProps,
} from "./components/prompts/ConfirmPrompt.js";
export {
  SelectPrompt,
  type SelectPromptProps,
  type SelectOption,
} from "./components/prompts/SelectPrompt.js";
export {
  MultiSelectPrompt,
  type MultiSelectPromptProps,
  type MultiSelectOption,
} from "./components/prompts/MultiSelectPrompt.js";
export type {
  PromptResult,
  BasePromptProps,
} from "./components/prompts/shared.js";

// Hooks
export { useInterval } from "./hooks/useInterval.js";
export {
  useExecaPhase,
  type ExecaPhaseState,
  type UseExecaPhaseOptions,
} from "./hooks/useExecaPhase.js";
export {
  useKubectlRollout,
  type RolloutStatus,
  type UseKubectlRolloutOptions,
} from "./hooks/useKubectlRollout.js";
export {
  useHelmHookWatcher,
  type HookStatus,
  type UseHelmHookWatcherOptions,
} from "./hooks/useHelmHookWatcher.js";

// Render entry
export {
  render,
  renderStatic,
  useRenderResult,
  type RenderOptions,
  type RenderResult,
} from "./render.js";

// Style tokens (re-exports — no imperative ANSI control)
export {
  PLANET_COL,
  ROW_INDENT,
  NOTE_INDENT,
  ERROR_INDENT,
  FLOW_INDENT,
  PHASE_WIDTH,
  HEADER_TICK_DIV,
  ROUTE_INDENT,
  ROUTE_OUT,
  ROUTE_URL,
  GLYPH_DONE,
  GLYPH_DIM_DOT,
  GLYPH_PIPE,
  GLYPH_FAIL,
  GLYPH_FAIL_MARK,
  GLYPH_WAITING,
  GLYPH_CANCELLED,
  GLYPH_INGRESS,
  GLYPH_COMPLETE,
  PHASE_PASS,
  PHASE_FAIL,
  ORBIT_SPINNER,
  colorOrbitFrame,
  renderHeader,
  colorPods,
  colors,
  blue,
  type PhaseState,
} from "./style.js";
