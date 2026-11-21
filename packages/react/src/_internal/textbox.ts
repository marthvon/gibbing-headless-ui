import type { InputEventHandler } from "react";

export type TextMode = "text" | "search" | "none" | "tel" | "url" | "email" | "numeric" | "decimal";
export type TextField = HTMLInputElement | HTMLTextAreaElement;

const MODE_TYPES: Readonly<Partial<Record<TextMode, string>>> = { none: "text", numeric: "number", decimal: "number" };

export function inputType(mode: TextMode): string {
  return MODE_TYPES[mode] ?? mode;
}

export function guardInput(guard: RegExp): InputEventHandler<TextField> {
  return (event) => {
    const field = event.currentTarget;
    const next = field.value.slice(0, field.selectionStart ?? 0) + (event.nativeEvent.data ?? "") + field.value.slice(field.selectionEnd ?? 0);
    if (!guard.test(next)) event.preventDefault();
  };
}
