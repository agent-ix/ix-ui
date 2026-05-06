import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
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

export interface MultiSelectOption<T> {
  label: string;
  value: T;
  hint?: string;
}

export interface MultiSelectPromptProps<T> extends BasePromptProps {
  options: MultiSelectOption<T>[];
  defaultValues?: T[];
  required?: boolean;
  onSubmit: (result: PromptResult<T[]>) => void;
}

export function MultiSelectPrompt<T>(
  props: MultiSelectPromptProps<T>,
): React.ReactElement {
  const { message, hint, options, defaultValues, required, onSubmit } = props;
  const [focus, setFocus] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(() => {
    const set = new Set<number>();
    if (defaultValues) {
      for (let i = 0; i < options.length; i++) {
        if (defaultValues.includes(options[i].value)) set.add(i);
      }
    }
    return set;
  });
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<
    null | { ok: true; values: T[]; labels: string[] } | { ok: false }
  >(null);
  const rawOK = useRawStdinSupported();

  useEffect(() => {
    if (!rawOK && submitted == null) {
      setSubmitted({ ok: false });
      onSubmit({ ok: false, cancelled: true });
    }
  }, [rawOK, submitted, onSubmit]);

  useInput(
    (input, key) => {
      if (submitted != null) return;
      if (key.escape) {
        setSubmitted({ ok: false });
        onSubmit({ ok: false, cancelled: true });
        return;
      }
      if (key.upArrow) {
        setFocus((f) => (f - 1 + options.length) % options.length);
        return;
      }
      if (key.downArrow) {
        setFocus((f) => (f + 1) % options.length);
        return;
      }
      if (input === " ") {
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(focus)) next.delete(focus);
          else next.add(focus);
          return next;
        });
        if (error) setError(null);
        return;
      }
      if (key.return) {
        if (required && selected.size === 0) {
          setError("select at least one option");
          return;
        }
        const values: T[] = [];
        const labels: string[] = [];
        for (let i = 0; i < options.length; i++) {
          if (selected.has(i)) {
            values.push(options[i].value);
            labels.push(options[i].label);
          }
        }
        setSubmitted({ ok: true, values, labels });
        onSubmit({ ok: true, value: values });
      }
    },
    { isActive: rawOK && submitted == null },
  );

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
      submitted.labels.length === 0
        ? colors.dim("«none»")
        : submitted.labels.join(", ");
    return <FrozenSummary message={message} rendered={display} />;
  }

  return (
    <Box flexDirection="column">
      <PromptHeader message={message} />
      {options.map((o, i) => {
        const checked = selected.has(i);
        const focused = i === focus;
        const box = checked ? "[•]" : "[ ]";
        const label = o.hint ? `${o.label}  ${colors.dim(o.hint)}` : o.label;
        return (
          <Box key={i} flexDirection="row">
            <Text>{focused ? colors.cyan("› ") : "  "}</Text>
            <Text>
              {box} {label}
            </Text>
          </Box>
        );
      })}
      <PromptHint hint={hint} />
      <PromptError error={error} />
    </Box>
  );
}
