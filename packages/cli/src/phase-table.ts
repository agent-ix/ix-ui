/**
 * FR-022 — Phase-column table renderer for concurrent multi-service progress.
 *
 * On TTY: redraws in place every 80 ms with braille spinner animation.
 * On non-TTY / isPlain: emits one structured line per state transition.
 */

import pc from "picocolors";
import { BRAILLE_SPINNER } from "@agent-ix/ix-ui-semantic";
import { colors, blue } from "./colors.js";
import {
  PHASE_PASS,
  PHASE_FAIL,
  ROW_INDENT,
  ERROR_INDENT,
  ROUTE_INDENT,
  ROUTE_OUT,
  phaseRun,
  renderHeader,
  type PhaseState,
} from "./style.js";

export type { PhaseState };

const ANSI_RE = /\x1b\[[0-9;]*m/g;

function stripAnsi(s: string): string {
  return s.replace(ANSI_RE, "");
}

function padDisplayName(displayName: string, width: number): string {
  const visual = stripAnsi(displayName).length;
  return displayName + " ".repeat(Math.max(0, width - visual));
}

// Back-compat re-exports — consumers (and prior phase-table imports) can keep
// pulling style tokens from this module.
export {
  HEADER_TICK_DIV,
  PHASE_PASS,
  PHASE_FAIL,
  PHASE_WIDTH,
  PLANET_COL,
  ROW_INDENT,
  ERROR_INDENT,
  colorOrbitFrame,
  phaseRun,
  renderHeader,
  ORBIT_SPINNER,
} from "./style.js";

export interface PhaseTableOptions<P extends string = string> {
  /** Ordered list of phase column names. */
  phases: readonly P[];
  /** Human-readable label shown while a phase is active (defaults to phase name). */
  phaseLabels?: Partial<Record<P, string>>;
  /** Optional display labels (may contain ANSI codes) keyed by service name. */
  serviceLabels?: Record<string, string>;
  isTTY?: boolean;
  isPlain?: boolean;
  /** Header text rendered above the rows with an animated glyph. */
  header?: string;
  /** Lines already written before start() — erased on first draw. */
  initialLineCount?: number;
  /** Omit rows that never leave the pending state from live/final output. */
  hidePendingRows?: boolean;
}

export interface PhaseTableFinalState {
  failed?: boolean;
  error?: string;
}

interface ServiceRow<P extends string> {
  name: string;
  displayName: string;
  phases: Record<P, PhaseState>;
  startMs: number;
  endMs: number | null;
  phaseStartMs: Partial<Record<P, number>>;
  phaseEndMs: Partial<Record<P, number>>;
  phaseStatus: Partial<Record<P, string | null>>;
  error: string | null;
}

const ELLIPSIS = "...";
const MIN_LABEL_W = 14;

function stateGlyph(
  state: PhaseState,
  spinnerIdx: number,
  isTTY: boolean,
): string {
  switch (state) {
    case "pending":
      return "·";
    case "queued":
      return isTTY
        ? pc.yellow(BRAILLE_SPINNER[spinnerIdx % BRAILLE_SPINNER.length])
        : "queued";
    case "running":
      return isTTY
        ? pc.cyan(BRAILLE_SPINNER[spinnerIdx % BRAILLE_SPINNER.length])
        : "running";
    case "done":
      return blue("•");
    case "failed":
      return colors.red("○");
  }
  return state satisfies never;
}

export function colorPods(status: string): string {
  const parsed = parsePodStatus(status);
  if (!parsed) return status;
  const { countPart, tail, hasStateLabel, ready, total } = parsed;
  const slashIdx = countPart.indexOf("/");

  if (ready > 0 && ready === total) {
    return hasStateLabel
      ? pc.yellow(countPart) + pc.dim(tail)
      : pc.cyan(countPart) + pc.dim(tail);
  }
  if (ready > 0) return pc.yellow(countPart) + pc.dim(tail);
  return (
    pc.yellow(countPart.slice(0, slashIdx)) +
    pc.dim(countPart.slice(slashIdx) + tail)
  );
}

function parsePodStatus(status: string): {
  countPart: string;
  tail: string;
  hasStateLabel: boolean;
  ready: number;
  total: number;
} | null {
  const dotIdx = status.indexOf("·");
  const hasStateLabel = dotIdx !== -1;
  const countPart = hasStateLabel
    ? status.slice(0, dotIdx)
    : status.replace(/\s+$/, "");
  const tail = status.slice(countPart.length);

  const slashIdx = countPart.indexOf("/");
  if (slashIdx === -1) return null;

  const ready = parseInt(countPart, 10);
  const total = parseInt(countPart.slice(slashIdx + 1), 10);
  if (Number.isNaN(ready) || Number.isNaN(total)) return null;

  return { countPart, tail, hasStateLabel, ready, total };
}

function isSettledReadyPodStatus(status: string): boolean {
  const parsed = parsePodStatus(status);
  return (
    parsed != null &&
    !parsed.hasStateLabel &&
    parsed.ready > 0 &&
    parsed.ready === parsed.total
  );
}

function truncatePlain(input: string, width: number): string {
  const plain = stripAnsi(input);
  if (plain.length <= width) return input;
  if (width <= ELLIPSIS.length) return ELLIPSIS.slice(0, width);
  return plain.slice(0, width - ELLIPSIS.length) + ELLIPSIS;
}

export class PhaseTable<P extends string = string> {
  private readonly rows: ServiceRow<P>[];
  private readonly phaseList: readonly P[];
  private readonly phaseLabels: Partial<Record<P, string>>;
  private readonly globalStartMs: number;
  private readonly isTTY: boolean;
  private readonly header: string | null;
  private readonly hidePendingRows: boolean;
  private spinnerFrame = 0;
  private lineCount = 0;
  private ticker: ReturnType<typeof setInterval> | null = null;
  private preflightLines: string[] = [];

  constructor(serviceNames: string[], opts: PhaseTableOptions<P>) {
    this.globalStartMs = Date.now();
    this.isTTY = (opts.isTTY ?? process.stdout.isTTY ?? false) && !opts.isPlain;
    this.header = opts.header ?? null;
    this.hidePendingRows = opts.hidePendingRows ?? false;
    this.lineCount = opts.initialLineCount ?? 0;
    this.phaseList = opts.phases;
    this.phaseLabels = opts.phaseLabels ?? {};

    const now = this.globalStartMs;
    const initialPhases = Object.fromEntries(
      opts.phases.map((p) => [p, "pending" as PhaseState]),
    ) as Record<P, PhaseState>;

    this.rows = serviceNames.map((name) => ({
      name,
      displayName: opts.serviceLabels?.[name] ?? name,
      phases: { ...initialPhases },
      startMs: now,
      endMs: null,
      phaseStartMs: {},
      phaseEndMs: {},
      phaseStatus: {},
      error: null,
    }));
  }

  /** Record a pre-flight label (shown before the table, e.g. credential resolution). */
  preflight(label: string): void {
    const line = `  🔑 ${label}`;
    if (this.isTTY) {
      this.preflightLines.push(line);
    } else {
      process.stdout.write(`🔑 ${label}\n`);
    }
  }

  /** Record a plain entry line shown above the service rows. */
  entry(label: string): void {
    const line = `${ROW_INDENT}${blue("•")} ${label}`;
    if (this.isTTY) {
      this.preflightLines.push(line);
    } else {
      process.stdout.write(`${line}\n`);
    }
  }

  /** Update detail text for the row's current phase. */
  setPodStatus(service: string, status: string): void {
    const row = this.rows.find((r) => r.name === service);
    if (!row) return;
    const { phase } = this.rowCurrentState(row.phases);
    row.phaseStatus[phase] = status;
  }

  /** Store an error message for a failed service (shown in final summary). */
  setError(service: string, error: string): void {
    const row = this.rows.find((r) => r.name === service);
    if (!row) return;
    row.error = error;
  }

  /** Begin displaying the table. Call once all pre-flight work is done. */
  start(): void {
    if (!this.isTTY && this.header) {
      process.stdout.write(`⊕  ${this.header}\n`);
    }
    if (this.isTTY) {
      this.drawTTY();
      this.ticker = setInterval(() => {
        this.spinnerFrame++;
        this.drawTTY();
      }, 80);
    }
  }

  /** Transition a service phase to a new state. */
  transition(service: string, phase: P, state: PhaseState): void {
    const row = this.rows.find((r) => r.name === service);
    if (!row) return;
    if (row.phases[phase] === state) return;
    row.phases[phase] = state;
    const now = Date.now();

    if (state === "running" || state === "queued") {
      row.phaseStartMs[phase] = now;
      delete row.phaseEndMs[phase];
      row.phaseStatus[phase] = null;
      if (!this.hasStarted(row) || phase === this.phaseList[0]) {
        row.startMs = now;
      }
    }
    const lastPhase = this.phaseList[this.phaseList.length - 1];
    if (state === "done" && phase === lastPhase) {
      row.endMs = now;
    }
    if (state === "done" || state === "failed") {
      row.phaseEndMs[phase] = now;
    }
    if (state === "failed") {
      row.endMs = now;
    }

    if (!this.isTTY) {
      const elapsedS = ((Date.now() - this.globalStartMs) / 1000).toFixed(1);
      process.stdout.write(`[T+${elapsedS}s] ${service}: ${phase} ${state}\n`);
    }
  }

  /**
   * Freeze the display with a final summary. Stops the ticker.
   *
   * @param entry  Optional entry-point service name (used to render the app URL).
   * @param baseDomain  Optional domain for URL generation (e.g. "ix.internal").
   */
  finish(
    entry: string | null = null,
    baseDomain?: string,
    tail?: string,
    finalState?: PhaseTableFinalState,
  ): void {
    if (this.ticker) {
      clearInterval(this.ticker);
      this.ticker = null;
    }

    const totalMs = Date.now() - this.globalStartMs;
    const visibleRows = this.visibleRows();
    const failed = visibleRows.filter((r) =>
      (Object.values(r.phases) as PhaseState[]).some((s) => s === "failed"),
    );

    if (this.isTTY) {
      this.finishTTY(
        totalMs,
        visibleRows,
        failed,
        entry,
        baseDomain,
        tail,
        finalState,
      );
    } else {
      this.finishPlain(
        totalMs,
        visibleRows,
        failed,
        entry,
        baseDomain,
        tail,
        finalState,
      );
    }
    this.lineCount = 0;
  }

  private finishTTY(
    totalMs: number,
    visibleRows: ServiceRow<P>[],
    failed: ServiceRow<P>[],
    entry: string | null,
    baseDomain?: string,
    tail?: string,
    finalState?: PhaseTableFinalState,
  ): void {
    const nameW = this.maxNameLen();
    const preflightBlock = this.preflightLines.join("\n");
    const overallFailed = failed.length > 0 || finalState?.failed === true;

    const frozenHeader = this.header
      ? (overallFailed ? PHASE_FAIL : PHASE_PASS) +
        renderHeader(this.header) +
        "\n" +
        ROUTE_INDENT +
        "\n"
      : "";

    const frozenRows = visibleRows.flatMap((row) => {
      const { phase } = this.rowCurrentState(row.phases);
      const status = row.phaseStatus[phase];
      const elapsedMs = this.rowFinalElapsedMs(row, totalMs);
      const elapsed =
        elapsedMs == null ? "" : (elapsedMs / 1000).toFixed(1) + "s";
      if (this.rowHasFailed(row)) {
        const pods = status
          ? `  ${colorPods(truncatePlain(status, 5).padEnd(5))}`
          : "       ";
        const lines = [
          `${ROW_INDENT}${colors.red("○")} ${padDisplayName(row.displayName, nameW)}${pods}  ${elapsed}`,
        ];
        if (row.error) lines.push(`${ERROR_INDENT}${pc.dim(row.error)}`);
        return lines;
      }
      const succeeded = this.rowSucceeded(row);
      const doneStatus = succeeded && status ? status : null;
      const pods = doneStatus
        ? `  ${colorPods(truncatePlain(doneStatus, 5).padEnd(5))}`
        : "       ";
      const urlSuffix =
        succeeded && baseDomain
          ? `  →  ${pc.cyan(`https://${row.name}.${baseDomain}`)}`
          : "";
      const glyph = succeeded ? blue("•") : "·";
      return [
        `${ROW_INDENT}${glyph} ${padDisplayName(row.displayName, nameW)}${pods}  ${elapsed.padEnd(7)}${urlSuffix}`,
      ];
    });

    const lines = [...frozenRows];
    if (tail) {
      lines.push(`${ROUTE_OUT}✧ ${tail}`);
    } else if (!overallFailed && entry && baseDomain) {
      lines.push(
        `${ROUTE_OUT}✧ ${pc.cyan(pc.underline(`https://${entry}.${baseDomain}`))}`,
      );
    }
    if (overallFailed) {
      const failureText =
        finalState?.error ??
        `${failed.length} service${failed.length === 1 ? "" : "s"} failed`;
      lines.push("", `${PHASE_FAIL}${colors.red(failureText)}`);
    }

    const tableBlock = lines.join("\n") + "\n";
    const body = preflightBlock
      ? frozenHeader + preflightBlock + "\n\n" + tableBlock
      : frozenHeader + tableBlock;

    const newLines = body.split("\n");
    const newCount = newLines.length - 1;
    const moveUp = this.lineCount > 0 ? `\x1b[${this.lineCount}A\r` : "\r";
    let frame = "";
    for (let i = 0; i < newCount; i++) frame += newLines[i] + "\x1b[K\n";
    if (this.lineCount > newCount) {
      const extra = this.lineCount - newCount;
      for (let i = 0; i < extra; i++) frame += "\x1b[K\n";
      frame += `\x1b[${extra}A`;
    }
    process.stdout.write(
      `\x1b[?2026h\x1b[?25l${moveUp}${frame}\x1b[?25h\x1b[?2026l`,
    );
  }

  private finishPlain(
    totalMs: number,
    visibleRows: ServiceRow<P>[],
    failed: ServiceRow<P>[],
    entry: string | null,
    baseDomain?: string,
    tail?: string,
    finalState?: PhaseTableFinalState,
  ): void {
    const totalS = (totalMs / 1000).toFixed(1);
    const lines: string[] = [];
    const nameW = this.maxNameLen();
    const overallFailed = failed.length > 0 || finalState?.failed === true;

    if (!overallFailed) {
      lines.push(
        blue(
          `✓ ${visibleRows.length} service${visibleRows.length === 1 ? "" : "s"} ready in ${totalS}s`,
        ),
      );
      lines.push("");
      for (const row of visibleRows) {
        const sMs = this.rowFinalElapsedMs(row, totalMs) ?? 0;
        lines.push(
          `${ROW_INDENT}${blue("•")} ${padDisplayName(row.displayName, nameW)}  ${(sMs / 1000).toFixed(1)}s`,
        );
      }
      if (tail) {
        lines.push(`${ROW_INDENT}└──• ${tail}`);
      } else if (entry && baseDomain) {
        lines.push(
          `${ROW_INDENT}└──• ${pc.cyan(pc.underline(`https://${entry}.${baseDomain}`))}`,
        );
      }
    } else {
      lines.push(
        colors.red(
          finalState?.error && failed.length === 0
            ? `⊗ failed in ${totalS}s`
            : `⊗ ${failed.length} failed in ${totalS}s`,
        ),
      );
      lines.push("");
      for (const row of visibleRows) {
        const sMs = this.rowFinalElapsedMs(row, totalMs);
        const elapsed = sMs == null ? "" : (sMs / 1000).toFixed(1) + "s";
        if (this.rowHasFailed(row)) {
          const { phase } = this.rowCurrentState(row.phases);
          const status = row.phaseStatus[phase];
          const pods = status
            ? `  ${truncatePlain(status, 5).padEnd(5)}`
            : "       ";
          lines.push(
            `${ROW_INDENT}${colors.red("○")} ${padDisplayName(row.displayName, nameW)}${pods}  ${elapsed}`,
          );
          if (row.error) lines.push(`${ERROR_INDENT}${pc.dim(row.error)}`);
        } else {
          const glyph = this.rowSucceeded(row) ? blue("•") : "·";
          lines.push(
            `${ROW_INDENT}${glyph} ${padDisplayName(row.displayName, nameW)}  ${elapsed}`,
          );
        }
      }
      lines.push(
        "",
        ` ⊗  ${colors.red(finalState?.error ?? `${failed.length} service${failed.length === 1 ? "" : "s"} failed`)}`,
      );
    }

    process.stdout.write(lines.join("\n") + "\n");
  }

  private maxNameLen(): number {
    return Math.max(
      ...this.rows.map((r) => stripAnsi(r.displayName).length),
      0,
    );
  }

  private rowCurrentState(phases: Record<P, PhaseState>): {
    phase: P;
    state: PhaseState;
  } {
    for (const ph of this.phaseList) {
      if (phases[ph] === "failed") return { phase: ph, state: "failed" };
    }
    for (const ph of this.phaseList) {
      if (phases[ph] !== "done") return { phase: ph, state: phases[ph] };
    }
    const lastPhase = this.phaseList[this.phaseList.length - 1];
    return { phase: lastPhase, state: "done" };
  }

  private rowLabel(phase: P, state: PhaseState): string {
    if (state === "pending") return "";
    if (state === "failed") return `${phase} failed`;
    return this.phaseLabels[phase] ?? phase;
  }

  private hasStarted(row: ServiceRow<P>): boolean {
    return Object.keys(row.phaseStartMs).length > 0;
  }

  private rowHasFailed(row: ServiceRow<P>): boolean {
    return (Object.values(row.phases) as PhaseState[]).some(
      (s) => s === "failed",
    );
  }

  private rowSucceeded(row: ServiceRow<P>): boolean {
    return (
      !this.rowHasFailed(row) &&
      this.phaseList.every((phase) => row.phases[phase] === "done")
    );
  }

  private phaseElapsedMs(
    row: ServiceRow<P>,
    phase: P,
    state: PhaseState,
    now: number,
  ): number | null {
    const started = row.phaseStartMs[phase];
    if (started == null) return null;
    const ended = row.phaseEndMs[phase];
    if (ended != null) return ended - started;
    if (state === "running" || state === "queued") return now - started;
    return null;
  }

  private rowFinalElapsedMs(
    row: ServiceRow<P>,
    totalMs: number,
  ): number | null {
    if (!this.hasStarted(row)) return null;
    if (row.endMs != null) return row.endMs - row.startMs;
    const { phase, state } = this.rowCurrentState(row.phases);
    const phaseElapsed = this.phaseElapsedMs(row, phase, state, Date.now());
    if (phaseElapsed != null) return phaseElapsed;
    return this.rowSucceeded(row) ? totalMs : null;
  }

  private drawTTY(): void {
    const now = Date.now();
    const totalElapsedS = ((now - this.globalStartMs) / 1000).toFixed(1);
    const lastPhase = this.phaseList[this.phaseList.length - 1];
    const visibleRows = this.visibleRows();
    const readyCount = visibleRows.filter((r) => this.rowSucceeded(r)).length;
    const nameW = this.maxNameLen();
    const elapsedW = 6;
    const columns = process.stdout.columns ?? 100;
    const fixedW = stripAnsi(ROW_INDENT).length + 2 + nameW + 2 + 2 + elapsedW;
    const labelW = Math.max(MIN_LABEL_W, columns - fixedW);
    const anyFailed = visibleRows.some((r) =>
      (Object.values(r.phases) as PhaseState[]).some((s) => s === "failed"),
    );

    const headerLine = this.header
      ? (anyFailed ? PHASE_FAIL : phaseRun(this.spinnerFrame)) +
        renderHeader(this.header) +
        "\n" +
        ROUTE_INDENT +
        "\n"
      : "";

    const rows = visibleRows.flatMap((row) => {
      const { phase, state } = this.rowCurrentState(row.phases);
      let label = this.rowLabel(phase, state);
      let podsDone = false;
      const status = row.phaseStatus[phase];
      const isActive = state === "running" || state === "queued";
      const isDonePodStatus = phase === lastPhase && state === "done" && status;
      if ((isActive || isDonePodStatus) && status) {
        label = status;
      }
      if (
        phase === lastPhase &&
        status &&
        state !== "failed" &&
        (isActive || state === "done")
      ) {
        podsDone = state === "done" && isSettledReadyPodStatus(status);
      }
      const g = podsDone
        ? blue("•")
        : stateGlyph(state, this.spinnerFrame, true);
      const elapsedMs = this.phaseElapsedMs(row, phase, state, now);
      const elapsed =
        elapsedMs == null ? "" : (elapsedMs / 1000).toFixed(1) + "s";
      const isPodStatus =
        phase === lastPhase &&
        !!status &&
        state !== "failed" &&
        (isActive || state === "done");
      label = truncatePlain(label, labelW);
      const labelPadded = isPodStatus
        ? colorPods(label.padEnd(labelW))
        : label.padEnd(labelW);
      const out = [
        `${ROW_INDENT}${g} ${padDisplayName(row.displayName, nameW)}  ${labelPadded}  ${elapsed}`,
      ];
      if (state === "failed" && row.error) {
        out.push(`${ERROR_INDENT}${pc.dim(row.error)}`);
      }
      return out;
    });

    const preflightBlock = this.preflightLines.join("\n");
    const tableLines =
      visibleRows.length === 0
        ? rows
        : [
            ...rows,
            "",
            pc.dim(
              `  elapsed ${totalElapsedS}s · ${readyCount}/${visibleRows.length} ready`,
            ),
          ];
    const tableBlock = tableLines.join("\n");
    const body = preflightBlock
      ? headerLine + preflightBlock + (tableBlock ? "\n\n" + tableBlock : "")
      : headerLine + tableBlock;
    const output = body.endsWith("\n") ? body : body + "\n";

    const newLines = output.split("\n");
    const newCount = newLines.length - 1;
    const moveUp = this.lineCount > 0 ? `\x1b[${this.lineCount}A\r` : "\r";

    let frame = "";
    for (let i = 0; i < newCount; i++) {
      frame += newLines[i] + "\x1b[K\n";
    }
    if (this.lineCount > newCount) {
      const extra = this.lineCount - newCount;
      for (let i = 0; i < extra; i++) frame += "\x1b[K\n";
      frame += `\x1b[${extra}A`;
    }

    process.stdout.write(
      `\x1b[?2026h\x1b[?25l${moveUp}${frame}\x1b[?25h\x1b[?2026l`,
    );
    this.lineCount = newCount;
  }

  private visibleRows(): ServiceRow<P>[] {
    if (!this.hidePendingRows) return this.rows;
    return this.rows.filter(
      (row) => this.rowCurrentState(row.phases).state !== "pending",
    );
  }
}
