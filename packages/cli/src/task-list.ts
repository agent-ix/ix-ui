import { Listr, type ListrTask } from "listr2";
import pc from "picocolors";
import * as p from "@clack/prompts";

export interface RunTaskListOptions {
  concurrent?: boolean;
  exitOnError?: boolean;
  successMessage?: string;
}

/**
 * Run a Listr2 task list framed with @clack/prompts intro/outro.
 *
 * @param title   Displayed in the intro banner.
 * @param tasks   Listr task array.
 * @param opts    Optional concurrency and error handling controls.
 */
export async function runTaskList(
  title: string,
  tasks: ListrTask[],
  opts: RunTaskListOptions = {},
): Promise<void> {
  p.intro(title);

  const runner = new Listr(tasks, {
    concurrent: opts.concurrent ?? false,
    exitOnError: opts.exitOnError ?? true,
    rendererOptions: { collapseSubtasks: false },
  });

  try {
    await runner.run();
    p.outro(pc.green(opts.successMessage ?? "Done."));
  } catch (err) {
    p.outro(
      pc.red(`Failed: ${err instanceof Error ? err.message : String(err)}`),
    );
    throw err;
  }
}
