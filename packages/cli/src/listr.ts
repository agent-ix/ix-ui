/**
 * IX-standard Listr2 factory.
 *
 * All CLI commands that use Listr2 for sequential task display must go through
 * makeListr() so the glyphs and spinner stay in sync with the ix-ui-cli theme.
 * Never call `new Listr(...)` directly in consumer packages.
 */

import { Listr, Spinner } from "listr2";
import type { ListrTask, ListrOptions } from "listr2";
import {
  ROW_INDENT,
  GLYPH_DONE,
  GLYPH_FAIL,
  GLYPH_WAITING,
  GLYPH_CANCELLED,
} from "./style.js";

/**
 * Spinner whose frames are prefixed with ROW_INDENT so the running-task
 * spinner lands at the same column as WAITING/COMPLETED/FAILED glyphs.
 * (listr2 passes the spinner frame as a direct icon override, bypassing
 * the rendererOptions.icon map — so the indent must live in the frame itself.)
 */
class IndentedSpinner extends Spinner {
  override fetch(): string {
    return ROW_INDENT + super.fetch();
  }
}

export const IX_LISTR_RENDERER_OPTIONS = {
  collapseSubtasks: false,
  spinner: new IndentedSpinner(),
  icon: {
    COMPLETED: ROW_INDENT + GLYPH_DONE,
    FAILED: ROW_INDENT + GLYPH_FAIL,
    WAITING: ROW_INDENT + GLYPH_WAITING,
    SKIPPED_WITH_COLLAPSE: ROW_INDENT + GLYPH_WAITING,
    SKIPPED_WITHOUT_COLLAPSE: ROW_INDENT + GLYPH_WAITING,
    // Tasks that didn't run because a sibling failed.
    COMPLETED_WITH_SISTER_TASKS_FAILED: ROW_INDENT + GLYPH_CANCELLED,
  },
  color: {
    // Icons are pre-colored via tokens; these passthroughs prevent
    // Listr2's per-state color from overriding them.
    COMPLETED: (s: string | undefined) => s ?? "",
    FAILED: (s: string | undefined) => s ?? "",
    WAITING: (s: string | undefined) => s ?? "",
    SKIPPED_WITH_COLLAPSE: (s: string | undefined) => s ?? "",
    SKIPPED_WITHOUT_COLLAPSE: (s: string | undefined) => s ?? "",
    COMPLETED_WITH_SISTER_TASKS_FAILED: (s: string | undefined) => s ?? "",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeListr<Ctx = Record<string, any>>(
  tasks: ListrTask<Ctx>[],
  opts: Omit<ListrOptions<Ctx>, "rendererOptions"> = {},
): Listr<Ctx> {
  return new Listr<Ctx>(tasks as ListrTask<Ctx>[], {
    ...(opts as ListrOptions<Ctx>),
    rendererOptions: IX_LISTR_RENDERER_OPTIONS,
  });
}
