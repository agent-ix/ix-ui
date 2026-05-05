import React, { useMemo, useRef } from "react";
import { Box, Text } from "ink";
import {
  PHASE_GLYPHS,
  BRAILLE_SPINNER,
  type PhaseState,
} from "@agent-ix/ix-ui-semantic";
import {
  ROW_INDENT,
  ERROR_INDENT,
  GLYPH_DONE,
  GLYPH_FAIL,
  GLYPH_WAITING,
  colorPods,
  colors,
} from "../style.js";
import { useInterval } from "../hooks/useInterval.js";
import { Frame, type FrameStatus, type TailVariant } from "./Frame.js";

const TICK_MS = 80;
const ELAPSED_W = 6;

export interface ServiceRow<P extends string> {
  name: string;
  displayName?: string | React.ReactNode;
  phases: Record<P, PhaseState>;
  status?: string | null;
  error?: string | null;
}

export interface PhaseTableProps<P extends string> {
  header: string;
  status?: FrameStatus;
  services: ServiceRow<P>[];
  phases: readonly P[];
  phaseLabels?: Partial<Record<P, string>>;
  hidePending?: boolean;
  preflight?: React.ReactNode;
  tail?: React.ReactNode;
  tailVariant?: TailVariant;
  tailEntry?: { name: string; baseDomain: string };
}

function rowCurrent<P extends string>(
  phases: Record<P, PhaseState>,
  list: readonly P[],
): { phase: P; state: PhaseState } {
  for (const ph of list) {
    if (phases[ph] === "failed") return { phase: ph, state: "failed" };
  }
  for (const ph of list) {
    if (phases[ph] !== "done") return { phase: ph, state: phases[ph] };
  }
  const last = list[list.length - 1];
  return { phase: last, state: "done" };
}

function rowFailed<P extends string>(phases: Record<P, PhaseState>): boolean {
  return Object.values(phases).some((s) => s === "failed");
}

function rowDone<P extends string>(
  phases: Record<P, PhaseState>,
  list: readonly P[],
): boolean {
  return list.length > 0 && list.every((p) => phases[p] === "done");
}

const stateGlyph = (state: PhaseState, tick: number): string => {
  if (state === "pending") return GLYPH_WAITING;
  if (state === "queued" || state === "running") {
    const frame = BRAILLE_SPINNER[tick % BRAILLE_SPINNER.length];
    return state === "queued" ? colors.yellow(frame) : colors.cyan(frame);
  }
  if (state === "done") return GLYPH_DONE;
  return GLYPH_FAIL;
};

interface PhaseRowProps<P extends string> {
  row: ServiceRow<P>;
  phases: readonly P[];
  phaseLabels?: Partial<Record<P, string>>;
  nameW: number;
  startMs: number;
  tick: number;
}

function PhaseRow<P extends string>({
  row,
  phases,
  phaseLabels,
  nameW,
  startMs,
  tick,
}: PhaseRowProps<P>): React.ReactElement {
  const { phase, state } = rowCurrent(row.phases, phases);
  const glyph = stateGlyph(state, tick);
  const labelText =
    state === "pending"
      ? ""
      : state === "failed"
        ? `${String(phase)} failed`
        : (row.status ?? phaseLabels?.[phase] ?? String(phase));

  const isLastPhase = phases[phases.length - 1] === phase;
  const looksLikePodStatus =
    isLastPhase && row.status != null && state !== "failed";
  const labelDisplay = looksLikePodStatus ? colorPods(labelText) : labelText;

  const elapsedMs = Date.now() - startMs;
  const elapsed =
    state === "pending" ? "" : `${(elapsedMs / 1000).toFixed(1)}s`;

  return (
    <>
      <Box flexDirection="row">
        <Text>{ROW_INDENT}</Text>
        <Text>{glyph} </Text>
        <Box width={nameW}>
          <Text>{row.displayName ?? row.name}</Text>
        </Box>
        <Text>  </Text>
        <Box flexGrow={1}>
          <Text wrap="truncate-end">{labelDisplay}</Text>
        </Box>
        <Box width={ELAPSED_W} justifyContent="flex-end">
          <Text>{elapsed}</Text>
        </Box>
      </Box>
      {state === "failed" && row.error ? (
        <Text>{ERROR_INDENT}{colors.dim(row.error)}</Text>
      ) : null}
    </>
  );
}

function visibleNameWidth(rows: ServiceRow<string>[]): number {
  let w = 0;
  for (const r of rows) {
    const dn = typeof r.displayName === "string" ? r.displayName : r.name;
    const len = String(dn).length;
    if (len > w) w = len;
  }
  return w;
}

/** Concurrent multi-service progress with phase columns. (FR-004) */
export function PhaseTable<P extends string>(
  props: PhaseTableProps<P>,
): React.ReactElement {
  const {
    header,
    status,
    services,
    phases,
    phaseLabels,
    hidePending,
    preflight,
    tail,
    tailVariant,
    tailEntry,
  } = props;

  const startRef = useRef(Date.now());
  const [tick, setTick] = React.useState(0);
  useInterval(() => setTick((t) => t + 1), TICK_MS);

  const visibleRows = useMemo(
    () =>
      hidePending
        ? services.filter((r) => {
            const all = phases.length > 0
              ? phases.every((p) => r.phases[p] === "pending")
              : true;
            return !all;
          })
        : services,
    [services, phases, hidePending],
  );

  const aggregateStatus: FrameStatus = useMemo(() => {
    if (status) return status;
    if (visibleRows.some((r) => rowFailed(r.phases))) return "failed";
    if (visibleRows.length > 0 && visibleRows.every((r) => rowDone(r.phases, phases))) {
      return "passed";
    }
    if (phases.length === 0) return "passed";
    return "running";
  }, [status, visibleRows, phases]);

  const readyCount = visibleRows.filter((r) => rowDone(r.phases, phases)).length;
  const totalElapsedS = ((Date.now() - startRef.current) / 1000).toFixed(1);
  const nameW = visibleNameWidth(visibleRows);

  const failureCount = visibleRows.filter((r) => rowFailed(r.phases)).length;
  const computedTail =
    tail ??
    (aggregateStatus === "failed"
      ? `${failureCount} service${failureCount === 1 ? "" : "s"} failed`
      : aggregateStatus === "passed" && tailEntry
        ? <Text color="cyan" underline>{`https://${tailEntry.name}.${tailEntry.baseDomain}`}</Text>
        : undefined);
  const computedTailVariant: TailVariant =
    tailVariant ?? (aggregateStatus === "failed" ? "error" : "success");

  return (
    <Frame
      header={header}
      status={aggregateStatus}
      tail={computedTail}
      tailVariant={computedTailVariant}
    >
      {preflight}
      {visibleRows.length > 0 && <Text> </Text>}
      {visibleRows.map((row, i) => (
        <PhaseRow
          key={`${row.name}-${i}`}
          row={row}
          phases={phases}
          phaseLabels={phaseLabels}
          nameW={nameW}
          startMs={startRef.current}
          tick={tick}
        />
      ))}
      <Text> </Text>
      <Text>
        {colors.dim(
          `  elapsed ${totalElapsedS}s · ${readyCount}/${visibleRows.length} ready`,
        )}
      </Text>
    </Frame>
  );
}

void PHASE_GLYPHS;
