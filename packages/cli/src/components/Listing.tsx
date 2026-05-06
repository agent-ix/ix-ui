import React from "react";
import { Box, Text } from "ink";
import { ROW_INDENT, NOTE_INDENT, GLYPH_DONE, colors } from "../style.js";
import { Frame, type FrameStatus, type TailVariant } from "./Frame.js";

export interface ListingProps {
  header: string;
  status?: FrameStatus;
  tail?: React.ReactNode;
  tailVariant?: TailVariant;
  children?: React.ReactNode;
}

/** Frame for static listings, status views, mixed flows. (FR-003) */
export const Listing: React.FC<ListingProps> = (props) => <Frame {...props} />;

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
  name: string;
  description?: string;
}

export const Item: React.FC<ItemProps> = ({ name, description }) => (
  <Box flexDirection="row">
    <Text>
      {ROW_INDENT}
      {GLYPH_DONE} {name}
    </Text>
    {description ? <Text>{colors.dim(`  — ${description}`)}</Text> : null}
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
