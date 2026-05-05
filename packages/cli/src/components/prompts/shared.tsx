import React from "react";
import { Box, Text, useStdin } from "ink";
import { colors } from "../../style.js";

export type PromptResult<T> =
  | { ok: true; value: T }
  | { ok: false; cancelled: true };

export interface BasePromptProps {
  message: string;
  hint?: string;
}

/**
 * Renders the prompt header line: cyan `?` glyph + message.
 */
export const PromptHeader: React.FC<{ message: string }> = ({ message }) => (
  <Box flexDirection="row">
    <Text color="cyan">? </Text>
    <Text>{message}</Text>
  </Box>
);

export const PromptHint: React.FC<{ hint?: string }> = ({ hint }) =>
  hint ? <Text>{colors.dim(`  ${hint}`)}</Text> : null;

export const PromptError: React.FC<{ error: string | null }> = ({ error }) =>
  error ? (
    <Text>
      {colors.dim(colors.red(`  ${error}`))}
    </Text>
  ) : null;

export interface FrozenSummaryProps {
  message: string;
  rendered: React.ReactNode;
}

export const FrozenSummary: React.FC<FrozenSummaryProps> = ({
  message,
  rendered,
}) => (
  <Box flexDirection="row">
    <Text color="cyan">? </Text>
    <Text>{message}  </Text>
    <Text>{rendered}</Text>
  </Box>
);

/**
 * Returns whether stdin supports raw mode. Used for FR-006-AC-20:
 * non-interactive stdin → graceful cancel.
 */
export function useRawStdinSupported(): boolean {
  const { isRawModeSupported, stdin } = useStdin();
  return Boolean(isRawModeSupported && stdin);
}
