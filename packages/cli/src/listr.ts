/**
 * IX-standard Listr2 factory.
 *
 * All CLI commands that use Listr2 for sequential task display must go through
 * makeListr() so the glyphs and spinner stay in sync with the ix-ui-cli theme.
 * Never call `new Listr(...)` directly in consumer packages.
 */

import { Listr } from "listr2";
import type { ListrTask, ListrOptions } from "listr2";
import pc from "picocolors";
import { GLYPH_DONE, GLYPH_FAIL } from "./style.js";

export const IX_LISTR_RENDERER_OPTIONS = {
  collapseSubtasks: false,
  icon: {
    COMPLETED: GLYPH_DONE,
    FAILED: GLYPH_FAIL,
    WAITING: pc.dim("·"),
    SKIPPED_WITH_COLLAPSE: pc.dim("·"),
    SKIPPED_WITHOUT_COLLAPSE: pc.dim("·"),
    // Tasks that didn't run because a sibling failed — show as dim open circle.
    COMPLETED_WITH_SISTER_TASKS_FAILED: pc.dim("○"),
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
