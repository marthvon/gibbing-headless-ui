"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import Dropdown from "./dropdown";
import { DropdownPreset, Interact } from "./presets.client";
import { ify, zLayer, type Content } from "./utils";

export type SelectOption = { value: string; label: string };

export type SelectProps = {
  label: string;
  options: readonly SelectOption[];
  value?: string;
  values?: readonly string[];
  multiple?: boolean;
  summary?: string;
  placeholder?: string;
  clearable?: boolean;
  labelled?: boolean;
  error?: string | null;
  preset?: DropdownPreset;
  interact?: Interact;
  style?: CSSProperties;
  zIndex?: number;
  className?: string;
  dropdownClass?: string;
  triggerClass?: string;
  wrapperClass?: string;
  modalClass?: string;
  menuClass?: string;
  optionClass?: string;
  caption?: (label: string) => ReactNode;
  trigger?: (selected: SelectOption | undefined, shown: string) => ReactNode;
  option?: (option: SelectOption) => ReactNode;
  tick?: Content<[selected: boolean]>;
  chevron?: Content;
  message?: (error: string) => ReactNode;
  onChange?: (value: string) => void;
  onToggle?: (value: string) => void;
};

export default function Select({
  label, options, value = "", values = [], multiple = false, summary = "", placeholder = "—", clearable = false,
  labelled = true, error, preset = DropdownPreset.BOTTOM, interact = Interact.CLICK, style, zIndex, className, dropdownClass,
  triggerClass, wrapperClass, modalClass, menuClass, optionClass, caption, trigger, option, tick, chevron, message, onChange, onToggle
}: SelectProps) {
  const selected = multiple ? undefined : options.find((choice) => choice.value === value);
  const shown = multiple ? summary : (selected?.label ?? placeholder);

  function pick(next: string, event: MouseEvent<HTMLButtonElement>) {
    if (multiple) {
      onToggle?.(next);
      return;
    }
    onChange?.(next);
    const box = event.currentTarget.closest(".select-dropdown")?.querySelector(":scope > input.ghost-node");
    if (box instanceof HTMLInputElement) box.checked = false;
  }

  const menu = options.map((choice) => {
    const on = values.includes(choice.value);
    return (
      <button
        key={`option-${choice.value}`}
        type="button"
        className={ify("select-option", optionClass)}
        aria-pressed={multiple ? on : undefined}
        onClick={(event) => pick(choice.value, event)}
      >
        {multiple ? (typeof tick === "function" ? tick(on) : <span className="select-tick">{on ? tick ?? "✓" : ""}</span>) : null}
        {option ? option(choice) : choice.label}
      </button>
    );
  });
  if (clearable && !multiple)
    menu.unshift(
      <button key="clear" type="button" className={ify("select-option", optionClass)} onClick={(event) => pick("", event)}>{placeholder}</button>
    );

  return (
    <div className={ify("field", className)} style={zLayer(zIndex, style)}>
      {labelled ? (caption ? caption(label) : <span className="field-label">{label}</span>) : null}
      <Dropdown
        preset={preset}
        interact={interact}
        clickOut
        className={ify("select-dropdown", wrapperClass && "select-anchored", dropdownClass)}
        wrapperClass={wrapperClass}
        modalClass={ify("select-outer", modalClass)}
        innerModalClass={ify("select-menu", menuClass)}
        menu={menu}
      >
        <span className={ify("field-box select-trigger", error && "field-invalid", triggerClass)}>
          {trigger
            ? trigger(selected, shown)
            : option && selected
              ? option(selected)
              : <span className="select-value" title={shown}>{shown}</span>}
          {typeof chevron === "function" ? chevron() : <span className="select-chevron" aria-hidden="true">{chevron ?? <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m5 8 5 5 5-5" /></svg>}</span>}
        </span>
      </Dropdown>
      {labelled && error ? (message ? message(error) : <span className="field-error">{error}</span>) : null}
    </div>
  );
}
