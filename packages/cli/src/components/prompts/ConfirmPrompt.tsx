import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { colors } from "../../style.js";
import {
  PromptHeader,
  PromptHint,
  FrozenSummary,
  useRawStdinSupported,
  type BasePromptProps,
  type PromptResult,
} from "./shared.js";

export interface ConfirmPromptProps extends BasePromptProps {
  defaultValue?: boolean;
  onSubmit: (result: PromptResult<boolean>) => void;
}

export const ConfirmPrompt: React.FC<ConfirmPromptProps> = ({
  message,
  hint,
  defaultValue = true,
  onSubmit,
}) => {
  const [submitted, setSubmitted] = useState<
    null | { ok: true; value: boolean } | { ok: false }
  >(null);
  const rawOK = useRawStdinSupported();

  useEffect(() => {
    if (!rawOK && submitted == null) {
      setSubmitted({ ok: false });
      onSubmit({ ok: false, cancelled: true });
    }
  }, [rawOK, submitted, onSubmit]);

  useInput((input, key) => {
    if (submitted != null) return;
    if (key.escape) {
      setSubmitted({ ok: false });
      onSubmit({ ok: false, cancelled: true });
      return;
    }
    if (key.return) {
      const v = defaultValue;
      setSubmitted({ ok: true, value: v });
      onSubmit({ ok: true, value: v });
      return;
    }
    if (input === "y" || input === "Y") {
      setSubmitted({ ok: true, value: true });
      onSubmit({ ok: true, value: true });
      return;
    }
    if (input === "n" || input === "N") {
      setSubmitted({ ok: true, value: false });
      onSubmit({ ok: true, value: false });
    }
  }, { isActive: rawOK && submitted == null });

  if (submitted != null) {
    if (submitted.ok === false) {
      return (
        <FrozenSummary
          message={message}
          rendered={colors.dim(rawOK ? "«cancelled»" : "«no interactive stdin»")}
        />
      );
    }
    return (
      <FrozenSummary message={message} rendered={submitted.value ? "Yes" : "No"} />
    );
  }

  const indicator = defaultValue ? "(Y/n)" : "(y/N)";
  return (
    <Box flexDirection="column">
      <PromptHeader message={message} />
      <Box flexDirection="row">
        <Text>  {colors.cyan("›")} </Text>
        <Text>{indicator}</Text>
      </Box>
      <PromptHint hint={hint} />
    </Box>
  );
};
