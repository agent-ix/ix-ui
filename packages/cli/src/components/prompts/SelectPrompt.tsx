import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import SelectInput from "ink-select-input";
import { colors } from "../../style.js";
import {
  PromptHeader,
  PromptHint,
  FrozenSummary,
  useRawStdinSupported,
  type BasePromptProps,
  type PromptResult,
} from "./shared.js";

export interface SelectOption<T> {
  label: string;
  value: T;
  hint?: string;
}

export interface SelectPromptProps<T> extends BasePromptProps {
  options: SelectOption<T>[];
  defaultValue?: T;
  onSubmit: (result: PromptResult<T>) => void;
}

export function SelectPrompt<T>(props: SelectPromptProps<T>): React.ReactElement {
  const { message, hint, options, defaultValue, onSubmit } = props;
  const [submitted, setSubmitted] = useState<
    null | { ok: true; value: T; label: string } | { ok: false }
  >(null);
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

  const items = options.map((o) => ({
    label: o.hint ? `${o.label}  ${colors.dim(o.hint)}` : o.label,
    value: o.value,
    key: String(o.value),
  }));

  const initialIndex = defaultValue !== undefined
    ? options.findIndex((o) => o.value === defaultValue)
    : 0;

  if (submitted != null) {
    if (submitted.ok === false) {
      return (
        <FrozenSummary
          message={message}
          rendered={colors.dim(rawOK ? "«cancelled»" : "«no interactive stdin»")}
        />
      );
    }
    return <FrozenSummary message={message} rendered={submitted.label} />;
  }

  return (
    <Box flexDirection="column">
      <PromptHeader message={message} />
      <SelectInput
        items={items}
        initialIndex={initialIndex >= 0 ? initialIndex : 0}
        onSelect={(item: { label: string; value: T }) => {
          if (submitted != null) return;
          const opt = options.find((o) => o.value === item.value);
          const label = opt?.label ?? String(item.value);
          setSubmitted({ ok: true, value: item.value, label });
          onSubmit({ ok: true, value: item.value });
        }}
        indicatorComponent={({ isSelected }: { isSelected?: boolean }) => (
          <Text>{isSelected ? colors.cyan("›") : " "} </Text>
        )}
      />
      <PromptHint hint={hint} />
    </Box>
  );
}

// Suppress unused-import warning for Text where SelectInput overrides indicator.
void Text;
