"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import Dropdown from "./dropdown";
import { DropdownPreset, Interact } from "./presets.client";
import { ify } from "./utils";

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
  tickMark?: string;
  style?: CSSProperties;
  className?: string;
  labelClass?: string;
  dropdownClass?: string;
  triggerClass?: string;
  valueClass?: string;
  wrapperClass?: string;
  modalClass?: string;
  menuClass?: string;
  optionClass?: string;
  tickClass?: string;
  errorClass?: string;
  trigger?: (selected: SelectOption | undefined, shown: string) => ReactNode;
  option?: (option: SelectOption) => ReactNode;
  onChange?: (value: string) => void;
  onToggle?: (value: string) => void;
};

export default function Select({
  label, options, value = "", values = [], multiple = false, summary = "", placeholder = "—", clearable = false,
  labelled = true, error, preset = DropdownPreset.BOTTOM, interact = Interact.CLICK, tickMark = "✓", style,
  className, labelClass, dropdownClass, triggerClass, valueClass, wrapperClass, modalClass, menuClass, optionClass,
  tickClass, errorClass, trigger, option, onChange, onToggle
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

  const menu = options.map((choice) => (
    <button
      key={`option-${choice.value}`}
      type="button"
      className={ify("select-option", optionClass)}
      aria-pressed={multiple ? values.includes(choice.value) : undefined}
      onClick={(event) => pick(choice.value, event)}
    >
      {multiple ? <span className={ify("select-tick", tickClass)}>{values.includes(choice.value) ? tickMark : ""}</span> : null}
      {option ? option(choice) : choice.label}
    </button>
  ));
  if (clearable && !multiple)
    menu.unshift(
      <button key="clear" type="button" className={ify("select-option", optionClass)} onClick={(event) => pick("", event)}>{placeholder}</button>
    );

  return (
    <div className={ify("field", className)} style={style}>
      {labelled ? <span className={ify("field-label", labelClass)}>{label}</span> : null}
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
              : <span className={ify("select-value", valueClass)} title={shown}>{shown}</span>}
        </span>
      </Dropdown>
      {labelled && error ? <span className={ify("field-error", errorClass)}>{error}</span> : null}
    </div>
  );
}
