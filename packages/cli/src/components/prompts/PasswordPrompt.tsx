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

export interface PasswordPromptProps extends BasePromptProps {
  validate?: (value: string) => string | null;
  onSubmit: (result: PromptResult<string>) => void;
}

const FIXED_BULLETS = "••••••••";

export const PasswordPrompt: React.FC<PasswordPromptProps> = ({
  message,
  hint,
  validate,
  onSubmit,
}) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<null | { ok: boolean }>(null);
  const rawOK = useRawStdinSupported();

  useEffect(() => {
    if (!rawOK && submitted == null) {
      setSubmitted({ ok: false });
      onSubmit({ ok: false, cancelled: true });
    }
  }, [rawOK, submitted, onSubmit]);

  useInput((_input, key) => {
    if (submitted != null) return;
    if (key.escape) {
      setSubmitted({ ok: false });
      onSubmit({ ok: false, cancelled: true });
    }
  }, { isActive: rawOK && submitted == null });

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
    setSubmitted({ ok: true });
    onSubmit({ ok: true, value: v });
  };

  if (submitted != null) {
    return (
      <FrozenSummary
        message={message}
        rendered={
          submitted.ok
            ? FIXED_BULLETS
            : colors.dim(rawOK ? "«cancelled»" : "«no interactive stdin»")
        }
      />
    );
  }

  return (
    <Box flexDirection="column">
      <PromptHeader message={message} />
      <Box flexDirection="row">
        <Text>  {colors.cyan("›")} </Text>
        <TextInput
          value={value}
          onChange={(v: string) => {
            setValue(v);
            if (error) setError(null);
          }}
          onSubmit={handleSubmit}
          mask="•"
        />
      </Box>
      <PromptHint hint={hint} />
      <PromptError error={error} />
    </Box>
  );
};
