"use client";

import type { ForwardedRef, InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";
import { Reveal, useReveal, type RevealProps } from "./_internal/reveal";
import { guardInput, inputType, type TextField, type TextMode } from "./_internal/textbox";
import { ify } from "./utils";

export type { TextMode } from "./_internal/textbox";

export type TextboxProps = {
  label?: string;
  error?: string | null;
  formId?: string;
  mode?: TextMode;
  guard?: RegExp;
  height?: number;
  wrap?: boolean;
  className?: string;
  boxClass?: string;
  caption?: (text: string, id: string) => ReactNode;
  message?: (error: string | undefined, id: string) => ReactNode;
} & RevealProps & Omit<InputHTMLAttributes<TextField>, "className" | "children" | "inputMode" | "type">;

const TextboxC = forwardRef<TextField, TextboxProps>(({
  label, error, formId, mode = "text", guard, height = 2.75, wrap = false,
  className, boxClass, caption, message, style,
  secret = false, revealed, onReveal, showLabel, hideLabel, showIcon, hideIcon, revealClass, ...rest
}, ref) => {
  const id = (formId ? `${formId}-` : "--tw-textbox-") + useId();
  const messageId = `${id}-message`;
  const [shown, toggle] = useReveal(revealed, onReveal);
  const hidden = secret && height <= 3.25;
  const field = {
    ...rest,
    id,
    inputMode: mode,
    "aria-invalid": !!error,
    "aria-describedby": messageId,
    className: ify("textbox-b-box", !wrap && "whitespace-nowrap", hidden && (typeof showIcon === "string" || typeof hideIcon === "string" ? "pr-16" : "pr-10"), boxClass),
    style: { height: `${height}rem`, ...style },
    onBeforeInput: guard ? guardInput(guard) : undefined
  };
  return (
    <div className={ify("textbox-b", className)}>
      <div className="textbox-b-frame">
        {height > 3.25
          ? <textarea {...field} ref={ref as ForwardedRef<HTMLTextAreaElement>}></textarea>
          : <input {...field} ref={ref as ForwardedRef<HTMLInputElement>} type={hidden && !shown ? "password" : inputType(mode)} />}
        {label ? (caption ? caption(label, id) : <label htmlFor={id} className="textbox-b-label">{label}</label>) : null}
        {hidden ? <Reveal revealed={shown} target={id} showLabel={showLabel} hideLabel={hideLabel} showIcon={showIcon} hideIcon={hideIcon} className={revealClass} onToggle={toggle} /> : null}
      </div>
      {message ? message(error ?? undefined, messageId) : <p id={messageId} aria-live="polite" className="textbox-b-message">{error || "ㅤ"}</p>}
    </div>
  );
});
TextboxC.displayName = "TextboxC";
export default TextboxC;
