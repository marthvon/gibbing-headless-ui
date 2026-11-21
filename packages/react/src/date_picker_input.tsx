"use client";

import type { ChangeEvent, ForwardedRef, ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import DatePicker, { type DayCtx, type HeadingCtx, type WeekdayCtx } from "./date_picker";
import Dropdown from "./dropdown";
import TextboxA from "./textbox.a";
import { DropdownPreset, Interact } from "./presets.client";
import { ify, zLayer } from "./utils";

export type DateInput = {
  formId: string | undefined;
  label: string | undefined;
  value: string;
  maxLength: number;
  guard: RegExp;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
};

const ISO_TYPING = /^\d{0,4}(-(\d{0,2}(-(\d{0,2})?)?)?)?$/;

export type DatePickerInputProps = {
  value?: string;
  formId?: string;
  label?: string;
  locale?: string;
  zIndex?: number;
  className?: string;
  headingClass?: string;
  gridClass?: string;
  cellClass?: string;
  weekdayClass?: string;
  pickerClass?: string;
  modalClass?: string;
  innerModalClass?: string;
  preset?: DropdownPreset;
  interact?: Interact;
  clickOut?: boolean;
  onInput?: (iso: string) => void;
  onChange?: (iso: string) => void;
  prev?: ReactNode;
  next?: ReactNode;
  heading?: (ctx: HeadingCtx) => ReactNode;
  weekday?: (ctx: WeekdayCtx) => ReactNode;
  day?: (ctx: DayCtx) => ReactNode;
  dayMini?: (ctx: DayCtx) => ReactNode;
  children?: ReactNode;
  field?: (input: DateInput) => ReactNode;
};

const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(function DatePickerInput({
  value, formId, label, locale, zIndex, className, headingClass, gridClass, cellClass, weekdayClass,
  pickerClass, modalClass, innerModalClass, preset = DropdownPreset.BOTTOM, interact = Interact.CLICK, clickOut = true,
  onInput, onChange, prev, next, heading, weekday, day, dayMini, children, field
}: DatePickerInputProps, ref: ForwardedRef<HTMLInputElement>) {
  const wrapEl = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(value ?? "");
  const [text, setText] = useState(selected);

  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  useEffect(() => setText(selected), [selected]);

  function openMenu(event: { target: EventTarget }) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (target.classList.contains("ghost-node") || target.closest(".dropdown-wrapper")) return;
    const box = wrapEl.current?.querySelector<HTMLInputElement>("input.ghost-node");
    if (box) box.checked = true;
  }

  function closeMenu() {
    const box = wrapEl.current?.querySelector<HTMLInputElement>("input.ghost-node");
    if (box) box.checked = false;
  }

  function commit(iso: string) {
    setSelected(iso);
    setText(iso);
    onInput?.(iso);
    onChange?.(iso);
    closeMenu();
  }

  function leave() {
    if (text === "") return commit("");
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined;
    if (m && date && date.getFullYear() === Number(m[1]) && date.getMonth() === Number(m[2]) - 1 && date.getDate() === Number(m[3])) commit(text);
    else setText(selected);
  }

  const input: DateInput = {
    formId, label, value: text, maxLength: 10, guard: ISO_TYPING,
    onChange: (event) => setText(event.currentTarget.value),
    onBlur: leave
  };

  return (
    <div ref={wrapEl} style={zLayer(zIndex)} onFocus={openMenu} onClick={openMenu}>
      <Dropdown preset={preset} interact={interact} clickOut={clickOut} className={className} modalClass={modalClass} innerModalClass={innerModalClass}
        menu={[
          <div key="datepicker" onMouseDown={(e) => e.preventDefault()}>
            <DatePicker ref={ref} value={selected} formId={formId} label={label} locale={locale} className={ify("datepicker-popup", pickerClass)}
              headingClass={headingClass} gridClass={gridClass} cellClass={cellClass} weekdayClass={weekdayClass}
              prev={prev} next={next} heading={heading} weekday={weekday} day={day} dayMini={dayMini}
              onInput={(iso) => { setSelected(iso); onInput?.(iso); }}
              onChange={(iso) => { setSelected(iso); onChange?.(iso); closeMenu(); }}>
              {children}
            </DatePicker>
          </div>
        ]}>
        {field ? field(input) : <TextboxA {...input} />}
      </Dropdown>
    </div>
  );
});
DatePickerInput.displayName = "DatePickerInput";
export default DatePickerInput;
