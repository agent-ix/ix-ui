/**
 * Listing — orbit-framed info display for non-task commands.
 *
 * Same visual vocabulary as PhaseTable (orbit header, └──┐ opener, └──• tail)
 * for static listings, status views, and short flows that mix in clack prompts.
 * Use startListing() instead of clack `intro()` / `outro()` so every command
 * shares one frame.
 *
 *   const list = startListing("ix elements list");
 *   list.group("github.com/agent-ix");
 *   list.item("typescript-react-lib", "TypeScript React libraries");
 *   list.success("3 element type(s) available.");
 */

import pc from "picocolors";
import {
  ROW_INDENT,
  NOTE_INDENT,
  ROUTE_INDENT,
  ROUTE_OUT,
  PHASE_PASS,
  PHASE_FAIL,
  GLYPH_DONE,
  GLYPH_RESULT,
  GLYPH_FAIL_MARK,
  phaseRun,
  renderHeader,
  HIDE_CURSOR,
  SHOW_CURSOR,
  SYNC_BEGIN,
  SYNC_END,
  CLEAR_EOL,
} from "./style.js";
import { colors } from "./colors.js";

export interface Listing {
  /** Render a group header (cyan/bold) with one blank line above. */
  group(name: string): void;
  /** Render `    • <name>  — <description>` body row. */
  item(name: string, description?: string): void;
  /** Render a dim raw line in the body (e.g. "Resolving …"). */
  note(text: string): void;
  /** Render a raw, un-indented body line (escape hatch — use sparingly). */
  raw(text: string): void;
  /**
   * Stop the header animation and commit the header line + `└──┐` opener to
   * scrollback. Use before handing the cursor to listr/clack — anything
   * those libs print lands beneath the opener as body content.
   */
  commit(): void;
  /**
   * Stop the header animation and erase the in-place line without committing.
   * Use before handing off to PhaseTable — leaves the cursor at column 0 so
   * the table can start from a clean position with initialLineCount: 0.
   * No-op if already committed or finished.
   */
  stop(): void;
  /** Pause animation, run an interactive callback (e.g. clack prompt), resume. */
  pause<T>(fn: () => Promise<T> | T): Promise<T>;
  /** Freeze header (PHASE_PASS) and emit `└──•  <green msg>`. */
  success(message: string): void;
  /** Freeze header (PHASE_PASS) and emit `└──•  <yellow msg>`. */
  warn(message: string): void;
  /** Freeze header (PHASE_FAIL) and emit `⊗  <red msg>`. */
  error(message: string): void;
}

interface ListingOptions {
  isTTY?: boolean;
  isPlain?: boolean;
}

/**
 * TTY renderer.
 *
 * Phase 1 (no body yet): header line is in-place animated with the orbit
 * spinner via `\r`. No newline is committed — pause() can stop the ticker
 * cleanly because nothing below has been printed.
 *
 * Phase 2 (body committed): on the first body write we commit the header line
 * with `\n`, write the `└──┐` opener, and stop animating. Each subsequent body
 * write increments `bodyLines`. On finish we walk back up to the header line
 * with `\x1b[<n>A`, rewrite the glyph (PHASE_PASS / PHASE_FAIL), and return.
 */
class TTYListing implements Listing {
  private spinnerFrame = 0;
  private ticker: ReturnType<typeof setInterval> | null = null;
  private committed = false;
  private finished = false;

  constructor(private header: string) {
    process.stdout.write(HIDE_CURSOR);
    this.drawHeaderInPlace();
    this.ticker = setInterval(() => {
      this.spinnerFrame++;
      this.drawHeaderInPlace();
    }, 80);
  }

  private drawHeaderInPlace(): void {
    process.stdout.write(
      `\r${phaseRun(this.spinnerFrame)}${renderHeader(this.header)}${CLEAR_EOL}`,
    );
  }

  private stopTicker(): void {
    if (this.ticker) {
      clearInterval(this.ticker);
      this.ticker = null;
    }
  }

  /**
   * Commit the animated header to the scrollback and write the └──┐ opener.
   * Called lazily on the first body write, or explicitly before handing off
   * the cursor to listr/clack.
   */
  commit(): void {
    if (this.committed) return;
    this.stopTicker();
    process.stdout.write(
      `\r${phaseRun(this.spinnerFrame)}${renderHeader(this.header)}${CLEAR_EOL}\n${ROUTE_INDENT}${CLEAR_EOL}\n`,
    );
    this.committed = true;
  }

  stop(): void {
    if (this.finished || this.committed) return;
    this.finished = true;
    this.stopTicker();
    process.stdout.write(`\r${CLEAR_EOL}${SHOW_CURSOR}`);
  }

  private writeBody(line: string): void {
    this.commit();
    process.stdout.write(line + "\n");
  }

  group(name: string): void {
    this.writeBody(`\n${ROW_INDENT}${pc.bold(pc.cyan(name))}`);
  }

  item(name: string, description?: string): void {
    const desc = description ? pc.dim(`  — ${description}`) : "";
    this.writeBody(`${ROW_INDENT}${GLYPH_DONE} ${name}${desc}`);
  }

  note(text: string): void {
    this.writeBody(`${NOTE_INDENT}${pc.dim(text)}`);
  }

  raw(text: string): void {
    this.writeBody(text);
  }

  async pause<T>(fn: () => Promise<T> | T): Promise<T> {
    if (!this.committed) {
      // Animation is on the header line — stop it, hand the line over to the
      // callback (e.g. a clack prompt that will draw its own frame), then
      // resume on a new line below the prompt's output.
      this.stopTicker();
      process.stdout.write(`\r${CLEAR_EOL}${SHOW_CURSOR}`);
      try {
        return await fn();
      } finally {
        if (!this.finished) {
          process.stdout.write(HIDE_CURSOR);
          this.drawHeaderInPlace();
          this.ticker = setInterval(() => {
            this.spinnerFrame++;
            this.drawHeaderInPlace();
          }, 80);
        }
      }
    }
    // Body already committed — no header animation to manage. Just hand off
    // the cursor and let the callback render in the body region.
    process.stdout.write(SHOW_CURSOR);
    try {
      return await fn();
    } finally {
      if (!this.finished) process.stdout.write(HIDE_CURSOR);
    }
  }

  /**
   * Freeze the (still in-place) animated header with a final glyph and commit
   * it to scrollback. Only meaningful before commit() — once the header is
   * committed we can't reliably walk back up over arbitrary body content
   * (listr / clack / external writers move the cursor however they want).
   */
  private freezeUncommitted(headerGlyph: string): void {
    if (this.committed) return;
    this.stopTicker();
    process.stdout.write(
      `${SYNC_BEGIN}\r${headerGlyph}${renderHeader(this.header)}${CLEAR_EOL}\n${ROUTE_INDENT}${CLEAR_EOL}\n${SYNC_END}`,
    );
    this.committed = true;
  }

  private finish(headerGlyph: string, tail: string): void {
    if (this.finished) return;
    this.finished = true;
    this.freezeUncommitted(headerGlyph);
    process.stdout.write(`${ROUTE_OUT}${tail}\n${SHOW_CURSOR}`);
  }

  success(message: string): void {
    this.finish(PHASE_PASS, `${GLYPH_RESULT}  ${pc.white(message)}`);
  }

  warn(message: string): void {
    this.finish(PHASE_PASS, `${GLYPH_RESULT}  ${pc.yellow(message)}`);
  }

  error(message: string): void {
    if (this.finished) return;
    this.finished = true;
    this.freezeUncommitted(PHASE_FAIL);
    process.stdout.write(
      `\n${GLYPH_FAIL_MARK}  ${colors.red(message)}\n${SHOW_CURSOR}`,
    );
  }
}

class PlainListing implements Listing {
  private finished = false;

  constructor(private header: string) {
    process.stdout.write(`⊕  ${this.header}\n`);
  }

  group(name: string): void {
    process.stdout.write(`\n${ROW_INDENT}${name}\n`);
  }

  item(name: string, description?: string): void {
    const desc = description ? `  — ${description}` : "";
    process.stdout.write(`${ROW_INDENT}• ${name}${desc}\n`);
  }

  note(text: string): void {
    process.stdout.write(`${NOTE_INDENT}${text}\n`);
  }

  raw(text: string): void {
    process.stdout.write(`${text}\n`);
  }

  commit(): void {
    /* no-op in plain mode — header was already written eagerly */
  }

  stop(): void {
    /* no-op in plain mode — nothing to erase */
  }

  async pause<T>(fn: () => Promise<T> | T): Promise<T> {
    return await fn();
  }

  success(message: string): void {
    if (this.finished) return;
    this.finished = true;
    process.stdout.write(`✓ ${message}\n`);
  }

  warn(message: string): void {
    if (this.finished) return;
    this.finished = true;
    process.stdout.write(`! ${message}\n`);
  }

  error(message: string): void {
    if (this.finished) return;
    this.finished = true;
    process.stdout.write(`⊗ ${message}\n`);
  }
}

/**
 * Begin a listing-framed command. Returns a Listing handle whose terminal
 * call must be `success()`, `warn()`, or `error()` to close the frame.
 */
export function startListing(
  header: string,
  opts: ListingOptions = {},
): Listing {
  const isTTY = (opts.isTTY ?? process.stdout.isTTY ?? false) && !opts.isPlain;
  return isTTY ? new TTYListing(header) : new PlainListing(header);
}
