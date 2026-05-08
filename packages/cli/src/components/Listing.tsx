import React from "react";
import { Box, Text } from "ink";
import {
  ROW_INDENT,
  NOTE_INDENT,
  FLOW_INDENT,
  GLYPH_DONE,
  GLYPH_COMPLETE,
  GLYPH_PIPE,
  GLYPH_WAITING,
  colors,
} from "../style.js";
import { Frame, type FrameStatus, type TailVariant } from "./Frame.js";

export interface ListingProps {
  header: string;
  status?: FrameStatus;
  tail?: React.ReactNode;
  tailVariant?: TailVariant;
  variant?: "framed" | "flow";
  pre?: React.ReactNode;
  children?: React.ReactNode;
}

/** Frame for static listings, status views, mixed flows. (FR-003) */
export const Listing: React.FC<ListingProps> = ({
  variant = "framed",
  children,
  tail,
  tailVariant,
  pre,
  ...props
}) => {
  if (variant !== "flow") {
    return (
      <Frame {...props} pre={pre} tail={tail} tailVariant={tailVariant}>
        {children}
      </Frame>
    );
  }

  const successTail = tail != null && (tailVariant ?? "success") === "success";

  return (
    <Frame
      {...props}
      pre={
        pre != null ? (
          <>
            <Text>{`${FLOW_INDENT}${GLYPH_PIPE}`}</Text>
            {pre}
          </>
        ) : null
      }
      post={
        successTail ? (
          <>
            <Text> </Text>
            <Box flexDirection="row">
              <Text>{`${FLOW_INDENT}${GLYPH_COMPLETE}   `}</Text>
              <Text>{tail}</Text>
            </Box>
          </>
        ) : null
      }
      tail={successTail ? undefined : tail}
      tailVariant={tailVariant}
    >
      {children}
    </Frame>
  );
};

export interface GroupProps {
  name: string;
  children?: React.ReactNode;
}

export const Group: React.FC<GroupProps> = ({ name, children }) => (
  <Box flexDirection="column" marginTop={1}>
    <Text>
      {ROW_INDENT}
      {colors.bold(colors.cyan(name))}
    </Text>
    {children}
  </Box>
);

export interface ItemProps {
  name: React.ReactNode;
  description?: React.ReactNode;
}

export const Item: React.FC<ItemProps> = ({ name, description }) => (
  <Box flexDirection="row">
    <Text>
      {ROW_INDENT}
      {GLYPH_DONE}{" "}
    </Text>
    <Text>{name}</Text>
    {description ? (
      <>
        <Text>{colors.dim("  — ")}</Text>
        <Text dimColor>{description}</Text>
      </>
    ) : null}
  </Box>
);

export interface NoteProps {
  children: React.ReactNode;
}

export const Note: React.FC<NoteProps> = ({ children }) => (
  <Box flexDirection="row">
    <Text>{NOTE_INDENT}</Text>
    <Text dimColor>{children}</Text>
  </Box>
);

export interface InfoProps {
  name: React.ReactNode;
  description?: React.ReactNode;
}

/**
 * Info row — a key/value body row for action listings, rendered with a
 * dim `·` glyph to distinguish informational metadata from active
 * Item rows (which use `•`). Used for "result" details like user IDs,
 * timestamps, and config values.
 */
export const Info: React.FC<InfoProps> = ({ name, description }) => (
  <Box flexDirection="row">
    <Text>
      {"   "}
      {GLYPH_WAITING}{" "}
    </Text>
    <Text dimColor>{name}</Text>
    {description ? (
      <>
        <Text>{colors.dim("  ")}</Text>
        <Text>{description}</Text>
      </>
    ) : null}
  </Box>
);
