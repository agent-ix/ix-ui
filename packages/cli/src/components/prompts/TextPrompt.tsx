import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { colors } from "../../style.js";
import {
  PromptHeader,
  PromptHint,
  PromptError,
  FrozenSummary,
  useRawStdinSupported,
  type BasePromptProps,
  type PromptResult,
} from "./shared.js";

export interface TextPromptProps extends BasePromptProps {
  defaultValue?: string;
  placeholder?: string;
  validate?: (value: string) => string | null;
  onSubmit: (result: PromptResult<string>) => void;
}

export const TextPrompt: React.FC<TextPromptProps> = ({
  message,
  hint,
  defaultValue,
  placeholder,
  validate,
  onSubmit,
}) => {
  const [value, setValue] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<
    null | { ok: true; value: string } | { ok: false }
  >(null);
  const rawOK = useRawStdinSupported();

  useEffect(() => {
    if (!rawOK && submitted == null) {
      setSubmitted({ ok: false });
      onSubmit({ ok: false, cancelled: true });
    }
  }, [rawOK, submitted, onSubmit]);

  useInput(
    (_input, key) => {
      if (submitted != null) return;
      if (key.escape) {
        setSubmitted({ ok: false });
        onSubmit({ ok: false, cancelled: true });
      }
    },
    { isActive: rawOK && submitted == null },
  );

  const handleSubmit = (v: string) => {
    if (submitted != null) return;
    let err: string | null = null;
    if (validate) {
      try {
        err = validate(v);
      } catch (e) {
        err = e instanceof Error ? e.message : String(e);
      }
    }
    if (err) {
      setError(err);
      return;
    }
    setSubmitted({ ok: true, value: v });
    onSubmit({ ok: true, value: v });
  };

  if (submitted != null) {
    if (submitted.ok === false) {
      return (
        <FrozenSummary
          message={message}
          rendered={colors.dim(
            rawOK ? "«cancelled»" : "«no interactive stdin»",
          )}
        />
      );
    }
    const display =
      submitted.value === "" ? colors.dim("«empty»") : submitted.value;
    return <FrozenSummary message={message} rendered={display} />;
  }

  return (
    <Box flexDirection="column">
      <PromptHeader message={message} />
      <Box flexDirection="row">
        <Text> {colors.cyan("›")} </Text>
        <TextInput
          value={value}
          onChange={(v: string) => {
            setValue(v);
            if (error) setError(null);
          }}
          onSubmit={handleSubmit}
          placeholder={placeholder}
        />
      </Box>
      <PromptHint hint={hint} />
      <PromptError error={error} />
    </Box>
  );
};
