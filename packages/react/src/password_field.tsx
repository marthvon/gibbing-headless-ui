"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";
import { ify } from "./utils";

export default function PasswordField({
  label, value, name, maxLength = 64, autoComplete = "current-password", formId, error,
  showLabel = "Show password", hideLabel = "Hide password", className, boxClass, labelClass, revealClass,
  showIcon, hideIcon, onChange
}: {
  label: string;
  value?: string;
  name?: string;
  maxLength?: number;
  autoComplete?: "current-password" | "new-password";
  formId?: string;
  error?: string | null;
  showLabel?: string;
  hideLabel?: string;
  className?: string;
  boxClass?: string;
  labelClass?: string;
  revealClass?: string;
  showIcon?: ReactNode;
  hideIcon?: ReactNode;
  onChange?: (value: string) => void;
}) {
  const id = (formId ? `${formId}-` : "--tw-password-") + useId();
  const [revealed, setRevealed] = useState(false);
  return (
    <div className={ify("password-field", className)}>
      <input
        id={id}
        name={name}
        type={revealed ? "text" : "password"}
        className={ify("peer textbox-a0 password-input", error ? "field-invalid" : "textbox-a1", boxClass)}
        placeholder="ㅤ"
        maxLength={maxLength}
        autoComplete={autoComplete}
        spellCheck={false}
        value={value}
        onChange={(event) => onChange?.(event.currentTarget.value)}
      />
      <label className={ify("textbox-text-a textbox-label-a pointer-events-none", labelClass)} htmlFor={id}>{error ?? label}</label>
      <button
        type="button"
        className={ify("password-reveal", revealClass)}
        aria-label={revealed ? hideLabel : showLabel}
        aria-pressed={revealed}
        aria-controls={id}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setRevealed(!revealed)}
      >
        {revealed
          ? hideIcon ?? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 5.1A10 10 0 0 1 12 4.8c5.5 0 9.2 4.4 10.2 6.2a13 13 0 0 1-2.2 3.1" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.1 6.1C3.8 7.6 2.2 9.8 1.8 11a13 13 0 0 0 5.2 6.1 10 10 0 0 0 6.3 1.1" />
              </svg>
            )
          : showIcon ?? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
                <circle cx="12" cy="12" r="2.75" />
              </svg>
            )}
      </button>
    </div>
  );
}
