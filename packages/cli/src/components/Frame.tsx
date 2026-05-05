import React, { Children } from "react";
import { Box, Text } from "ink";
import {
  PHASE_PASS,
  PHASE_FAIL,
  ROUTE_INDENT,
  ROUTE_OUT,
  GLYPH_RESULT,
  GLYPH_FAIL_MARK,
  renderHeader,
  colors,
} from "../style.js";
import { HeaderSpinner } from "./HeaderSpinner.js";

export type FrameStatus = "running" | "passed" | "failed";
export type TailVariant = "success" | "warn" | "error";

export interface FrameProps {
  header: string;
  status?: FrameStatus;
  tail?: React.ReactNode;
  tailVariant?: TailVariant;
  children?: React.ReactNode;
  marginTop?: number;
  marginLeft?: number;
}

function hasChildren(children: React.ReactNode): boolean {
  let present = false;
  Children.forEach(children, (c) => {
    if (c != null && c !== false) present = true;
  });
  return present;
}

const HeaderIndicator: React.FC<{ status: FrameStatus }> = ({ status }) => {
  if (status === "passed") return <Text>{PHASE_PASS}</Text>;
  if (status === "failed") return <Text>{PHASE_FAIL}</Text>;
  return <HeaderSpinner />;
};

const Tail: React.FC<{ tail: React.ReactNode; variant: TailVariant }> = ({
  tail,
  variant,
}) => {
  if (variant === "error") {
    return (
      <Box flexDirection="row">
        <Text>{ROUTE_OUT}</Text>
        <Text>{GLYPH_FAIL_MARK}</Text>
        <Text>{"  "}</Text>
        <Text color="red">{tail}</Text>
      </Box>
    );
  }
  const colored = variant === "warn"
    ? <Text color="yellow">{tail}</Text>
    : <Text>{tail}</Text>;
  return (
    <Box flexDirection="row">
      <Text>{ROUTE_OUT}</Text>
      <Text>   </Text>
      <Text>{GLYPH_RESULT}</Text>
      <Text>{"  "}</Text>
      {colored}
    </Box>
  );
};

/**
 * Base layout: animated/frozen orbit header, `└──┐` opener, body, optional
 * `└──•` tail. Used by Listing, PhaseTable, TaskList. (FR-002)
 */
export const Frame: React.FC<FrameProps> = ({
  header,
  status = "running",
  tail,
  tailVariant = "success",
  children,
  marginTop,
  marginLeft,
}) => {
  const showBody = hasChildren(children) || tail != null;
  // Prefer error tail when status is failed and a plain text tail was provided.
  const variant: TailVariant =
    status === "failed" && tailVariant === "success" ? "error" : tailVariant;

  return (
    <Box flexDirection="column" marginTop={marginTop} marginLeft={marginLeft}>
      <Box flexDirection="row">
        <HeaderIndicator status={status} />
        <Text>{renderHeader(header)}</Text>
      </Box>
      {showBody && <Text>{ROUTE_INDENT}</Text>}
      {showBody && <Box flexDirection="column">{children}</Box>}
      {tail != null && (
        <>
          <Text> </Text>
          <Tail tail={tail} variant={variant} />
        </>
      )}
    </Box>
  );
};

// Re-export internal helpers so tests can target them.
export { HeaderIndicator };
// Silence "colors imported but unused" if optimisations remove it.
void colors;
