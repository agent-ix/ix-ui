import React, { Children } from "react";
import { Box, Text } from "ink";
import {
  PHASE_PASS,
  PHASE_FAIL,
  CONNECTOR_HEADER,
  CONNECTOR_OPEN,
  FLOW_INDENT,
  GLYPH_COMPLETE,
  GLYPH_FAIL_MARK,
  renderHeader,
  colors,
} from "../style.js";
import { RED_HEX } from "../colors.js";
import { HeaderSpinner } from "./HeaderSpinner.js";

export type FrameStatus = "running" | "passed" | "failed";
export type TailVariant = "success" | "warn" | "error";

export interface FrameProps {
  header: string;
  status?: FrameStatus;
  tail?: React.ReactNode;
  tailVariant?: TailVariant;
  /**
   * Outer-level content rendered between the header and the body opener
   * (ROUTE_INDENT). Sits at the planet column with no body indent.
   */
  pre?: React.ReactNode;
  /**
   * Outer-level content rendered after the body, before the framed tail.
   * Used by flow-style commands that keep body rows framed but finish with
   * their own result marker.
   */
  post?: React.ReactNode;
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
        <Text>{`${FLOW_INDENT}${GLYPH_FAIL_MARK} `}</Text>
        <Text color={RED_HEX}>{tail}</Text>
      </Box>
    );
  }
  const colored =
    variant === "warn" ? (
      <Text color="yellow">{tail}</Text>
    ) : (
      <Text>{tail}</Text>
    );
  return (
    <Box flexDirection="row">
      <Text>{`${FLOW_INDENT}${GLYPH_COMPLETE} `}</Text>
      {colored}
    </Box>
  );
};

/**
 * Base layout: orbit header, opener (ROUTE_INDENT), body, optional tail
 * Used by Listing, PhaseTable, TaskList. (FR-002)
 */
export const Frame: React.FC<FrameProps> = ({
  header,
  status = "running",
  tail,
  tailVariant = "success",
  pre,
  post,
  children,
  marginTop,
  marginLeft,
}) => {
  const childrenPresent = hasChildren(children);
  const prePresent = hasChildren(pre);
  // Prefer error tail when status is failed and a plain text tail was provided.
  const variant: TailVariant =
    status === "failed" && tailVariant === "success" ? "error" : tailVariant;

  return (
    <Box flexDirection="column" marginTop={marginTop} marginLeft={marginLeft}>
      <Box flexDirection="row">
        <HeaderIndicator status={status} />
        <Text>{renderHeader(header)}</Text>
      </Box>
      {(prePresent || childrenPresent) && <Text>{CONNECTOR_HEADER}</Text>}
      {prePresent && <Box flexDirection="column">{pre}</Box>}
      {prePresent && childrenPresent && <Text>{CONNECTOR_OPEN}</Text>}
      {childrenPresent && <Box flexDirection="column">{children}</Box>}
      {post != null && <Box flexDirection="column">{post}</Box>}
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
void colors;
