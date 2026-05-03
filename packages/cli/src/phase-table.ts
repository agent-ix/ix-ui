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
}

interface ServiceRow<P extends string> {
  name: string;
  displayName: string;
  phases: Record<P, PhaseState>;
  startMs: number;
  endMs: number | null;
  podStatus: string | null;
  error: string | null;
}

// Width to pad the phase-label column ("install failed" is the longest at 14).
const LABEL_W = 14;

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
}

function colorPods(status: string): string {
  const i = status.indexOf("/");
  if (i === -1) return status;
  const r = status.slice(0, i);
  const rest = status.slice(i);
  const ready = parseInt(r, 10);
  if (ready > 0) return pc.cyan(r) + pc.cyan(rest);
  return colors.red(r) + pc.dim(rest);
}

export class PhaseTable<P extends string = string> {
  private readonly rows: ServiceRow<P>[];
  private readonly phaseList: readonly P[];
  private readonly phaseLabels: Partial<Record<P, string>>;
  private readonly globalStartMs: number;
  private readonly isTTY: boolean;
  private readonly header: string | null;
  private spinnerFrame = 0;
  private lineCount = 0;
  private ticker: ReturnType<typeof setInterval> | null = null;
  private preflightLines: string[] = [];

  constructor(serviceNames: string[], opts: PhaseTableOptions<P>) {
    this.globalStartMs = Date.now();
    this.isTTY = (opts.isTTY ?? process.stdout.isTTY ?? false) && !opts.isPlain;
    this.header = opts.header ?? null;
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
      podStatus: null,
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

  /** Update the k8s pod ready status for a service row (live during ready phase). */
  setPodStatus(service: string, status: string): void {
    const row = this.rows.find((r) => r.name === service);
    if (!row) return;
    row.podStatus = status;
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
    row.phases[phase] = state;

    if (state === "running" && phase === this.phaseList[0]) {
      row.startMs = Date.now();
    }
    const lastPhase = this.phaseList[this.phaseList.length - 1];
    if (state === "done" && phase === lastPhase) {
      row.endMs = Date.now();
    }
    if (state === "failed") {
      row.endMs = Date.now();
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
  ): void {
    if (this.ticker) {
      clearInterval(this.ticker);
      this.ticker = null;
    }

    const totalMs = Date.now() - this.globalStartMs;
    const failed = this.rows.filter((r) =>
      (Object.values(r.phases) as PhaseState[]).some((s) => s === "failed"),
    );

    if (this.isTTY) {
      this.finishTTY(totalMs, failed, entry, baseDomain, tail);
    } else {
      this.finishPlain(totalMs, failed, entry, baseDomain, tail);
    }
    this.lineCount = 0;
  }

  private finishTTY(
    totalMs: number,
    failed: ServiceRow<P>[],
    entry: string | null,
    baseDomain?: string,
    tail?: string,
  ): void {
    const nameW = this.maxNameLen();
    const preflightBlock = this.preflightLines.join("\n");

    const frozenHeader = this.header
      ? (failed.length === 0 ? PHASE_PASS : PHASE_FAIL) +
        renderHeader(this.header) +
        "\n" +
        ROUTE_INDENT +
        "\n"
      : "";

    const frozenRows = this.rows.flatMap((row) => {
      const sMs = row.endMs != null ? row.endMs - row.startMs : totalMs;
      const sS = (sMs / 1000).toFixed(1) + "s";
      const anyFailed = (Object.values(row.phases) as PhaseState[]).some(
        (s) => s === "failed",
      );
      if (anyFailed) {
        const pods = row.podStatus
          ? `  ${colorPods(row.podStatus.padEnd(5))}`
          : "       ";
        const lines = [
          `${ROW_INDENT}${colors.red("○")} ${padDisplayName(row.displayName, nameW)}${pods}  ${sS}`,
        ];
        if (row.error) lines.push(`${ERROR_INDENT}${pc.dim(row.error)}`);
        return lines;
      }
      const pods = row.podStatus
        ? `  ${colorPods(row.podStatus.padEnd(5))}`
        : "       ";
      const urlSuffix = baseDomain
        ? `  →  ${pc.cyan(`https://${row.name}.${baseDomain}`)}`
        : "";
      return [
        `${ROW_INDENT}${blue("•")} ${padDisplayName(row.displayName, nameW)}${pods}  ${sS.padEnd(7)}${urlSuffix}`,
      ];
    });

    const lines = [...frozenRows];
    if (tail) {
      lines.push(`${ROUTE_OUT}✧ ${tail}`);
    } else if (failed.length === 0 && entry && baseDomain) {
      lines.push(
        `${ROUTE_OUT}✧ ${pc.cyan(pc.underline(`https://${entry}.${baseDomain}`))}`,
      );
    } else if (failed.length > 0) {
      lines.push(
        "",
        `${PHASE_FAIL}${colors.red(`${failed.length} service${failed.length === 1 ? "" : "s"} failed`)}`,
      );
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
    failed: ServiceRow<P>[],
    entry: string | null,
    baseDomain?: string,
    tail?: string,
  ): void {
    const totalS = (totalMs / 1000).toFixed(1);
    const lines: string[] = [];
    const nameW = this.maxNameLen();

    if (failed.length === 0) {
      lines.push(
        blue(
          `✓ ${this.rows.length} service${this.rows.length === 1 ? "" : "s"} ready in ${totalS}s`,
        ),
      );
      lines.push("");
      for (const row of this.rows) {
        const sMs = row.endMs != null ? row.endMs - row.startMs : totalMs;
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
      lines.push(colors.red(`⊗ ${failed.length} failed in ${totalS}s`));
      lines.push("");
      for (const row of this.rows) {
        const anyFailed = (Object.values(row.phases) as PhaseState[]).some(
          (s) => s === "failed",
        );
        const sMs = row.endMs != null ? row.endMs - row.startMs : totalMs;
        if (anyFailed) {
          const pods = row.podStatus
            ? `  ${row.podStatus.padEnd(5)}`
            : "       ";
          lines.push(
            `${ROW_INDENT}${colors.red("○")} ${padDisplayName(row.displayName, nameW)}${pods}  ${(sMs / 1000).toFixed(1)}s`,
          );
          if (row.error) lines.push(`${ERROR_INDENT}${pc.dim(row.error)}`);
        } else {
          lines.push(
            `${ROW_INDENT}${blue("•")} ${padDisplayName(row.displayName, nameW)}  ${(sMs / 1000).toFixed(1)}s`,
          );
        }
      }
      lines.push(
        "",
        ` ⊗  ${colors.red(`${failed.length} service${failed.length === 1 ? "" : "s"} failed`)}`,
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
    for (const ph of [...this.phaseList].reverse()) {
      if (phases[ph] !== "pending") return { phase: ph, state: phases[ph] };
    }
    return { phase: this.phaseList[0], state: "pending" };
  }

  private rowLabel(phase: P, state: PhaseState): string {
    if (state === "pending") return "—";
    if (state === "failed") return `${phase} failed`;
    return this.phaseLabels[phase] ?? phase;
  }

  private drawTTY(): void {
    const now = Date.now();
    const totalElapsedS = ((now - this.globalStartMs) / 1000).toFixed(1);
    const lastPhase = this.phaseList[this.phaseList.length - 1];
    const readyCount = this.rows.filter(
      (r) => r.phases[lastPhase] === "done",
    ).length;
    const nameW = this.maxNameLen();
    const anyFailed = this.rows.some((r) =>
      (Object.values(r.phases) as PhaseState[]).some((s) => s === "failed"),
    );

    const headerLine = this.header
      ? (anyFailed ? PHASE_FAIL : phaseRun(this.spinnerFrame)) +
        renderHeader(this.header) +
        "\n" +
        ROUTE_INDENT +
        "\n"
      : "";

    const rows = this.rows
      .filter((row) => this.rowCurrentState(row.phases).state !== "pending")
      .flatMap((row) => {
        const { phase, state } = this.rowCurrentState(row.phases);
        let label = this.rowLabel(phase, state);
        let podsDone = false;
        if (phase === lastPhase && row.podStatus && state !== "failed") {
          label = row.podStatus;
          const parts = row.podStatus.split("/");
          const r = parseInt(parts[0], 10);
          const t = parseInt(parts[1], 10);
          podsDone = r > 0 && r === t;
        }
        const g = podsDone
          ? blue("•")
          : stateGlyph(state, this.spinnerFrame, true);
        const elapsedMs =
          row.endMs != null ? row.endMs - row.startMs : now - row.startMs;
        const elapsed = (elapsedMs / 1000).toFixed(1) + "s";
        const isPodStatus =
          phase === lastPhase && !!row.podStatus && state !== "failed";
        const labelPadded = isPodStatus
          ? colorPods(label.padEnd(LABEL_W))
          : label.padEnd(LABEL_W);
        const out = [
          `${ROW_INDENT}${g} ${padDisplayName(row.displayName, nameW)}  ${labelPadded}  ${elapsed}`,
        ];
        if (state === "failed" && row.error) {
          out.push(`${ERROR_INDENT}${pc.dim(row.error)}`);
        }
        return out;
      });

    const footer = pc.dim(
      `  elapsed ${totalElapsedS}s · ${readyCount}/${this.rows.length} ready`,
    );

    const preflightBlock = this.preflightLines.join("\n");
    const tableBlock = [...rows, "", footer].join("\n");
    const body = preflightBlock
      ? headerLine + preflightBlock + "\n\n" + tableBlock + "\n"
      : headerLine + tableBlock + "\n";

    const newLines = body.split("\n");
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
}
