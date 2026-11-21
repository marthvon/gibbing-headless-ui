"use client";

import type { ComponentProps } from "react";
import { forwardRef } from "react";
import TextboxA from "./textbox.a";
import TextboxB from "./textbox.b";
import TextboxC from "./textbox.c";
import type { TextField } from "./_internal/textbox";

type Shared = Omit<ComponentProps<typeof TextboxC>, "secret" | "onChange" | "value" | "ref" | "mode" | "height" | "wrap">;

export type PasswordFieldProps = Shared & {
  variant?: "a" | "b" | "c";
  label: string;
  value?: string;
  maxLength?: number;
  autoComplete?: "current-password" | "new-password";
  onChange?: (value: string) => void;
};

const TEXTBOXES = { a: TextboxA, b: TextboxB, c: TextboxC } as const;

const PasswordField = forwardRef<TextField, PasswordFieldProps>(({
  variant = "a", maxLength = 64, autoComplete = "current-password", onChange, ...rest
}, ref) => {
  const Textbox = TEXTBOXES[variant] as typeof TextboxC;
  return (
    <Textbox
      {...rest}
      ref={ref}
      secret
      maxLength={maxLength}
      autoComplete={autoComplete}
      spellCheck={false}
      onChange={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
    />
  );
});
PasswordField.displayName = "PasswordField";
export default PasswordField;
