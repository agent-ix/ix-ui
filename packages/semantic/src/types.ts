export type PhaseState = "pending" | "queued" | "running" | "done" | "failed";

export interface PhaseGlyph {
  tty: string;
  nonTty: string;
  animated: boolean;
}
