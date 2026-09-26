"use client";

import type { ReactNode, ForwardedRef } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import DatePicker, { type DayCtx, type HeadingCtx, type WeekdayCtx } from "./date_picker";
import Dropdown from "./dropdown";
import TextboxA from "./textbox.a";
import { DropdownPreset, Interact } from "./presets.client";

export type DatePickerInputProps = {
  value?: string;
  formId?: string;
  label?: string;
  locale?: string;
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
  trigger?: ReactNode;
};

const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(function DatePickerInput({
  value, formId, label, locale, className, headingClass, gridClass, cellClass, weekdayClass,
  pickerClass, modalClass, innerModalClass, preset = DropdownPreset.BOTTOM, interact = Interact.CLICK, clickOut = true,
  onInput, onChange, prev, next, heading, weekday, day, dayMini, children, trigger
}: DatePickerInputProps, ref: ForwardedRef<HTMLInputElement>) {
  const wrapEl = useRef<HTMLDivElement>(null);
  const textboxEl = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [selected, setSelected] = useState(value ?? "");

  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  useEffect(() => {
    if (textboxEl.current) textboxEl.current.value = selected;
  }, [selected]);

  function closeMenu() {
    const box = wrapEl.current?.querySelector<HTMLInputElement>("input.ghost-node");
    if (box) box.checked = false;
  }

  function commit(iso: string) {
    setSelected(iso);
    onInput?.(iso);
    onChange?.(iso);
    closeMenu();
  }

  function onBlur() {
    const typed = textboxEl.current?.value ?? "";
    if (typed === "") commit("");
    else {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typed);
      const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined;
      if (date && date.getFullYear() === Number(m![1]) && date.getMonth() === Number(m![2]) - 1 && date.getDate() === Number(m![3])) commit(typed);
      else if (textboxEl.current) textboxEl.current.value = selected;
    }
  }

  return (
    <div ref={wrapEl}>
      <Dropdown preset={preset} interact={interact} clickOut={clickOut} className={className} modalClass={modalClass} innerModalClass={innerModalClass}
        menu={[
          <div key="datepicker" onMouseDown={(e) => e.preventDefault()}>
            <DatePicker ref={ref} value={selected} formId={formId} label={label} locale={locale} className={pickerClass}
              headingClass={headingClass} gridClass={gridClass} cellClass={cellClass} weekdayClass={weekdayClass}
              prev={prev} next={next} heading={heading} weekday={weekday} day={day} dayMini={dayMini}
              onInput={(iso) => { setSelected(iso); onInput?.(iso); }}
              onChange={(iso) => { setSelected(iso); onChange?.(iso); closeMenu(); }}>
              {children}
            </DatePicker>
          </div>
        ]}>
        {trigger ?? (
          <TextboxA ref={textboxEl} label={label} maxLength={10} guard={/^\d{0,4}(-(\d{0,2}(-(\d{0,2})?)?)?)?$/} onBlur={onBlur} />
        )}
      </Dropdown>
    </div>
  );
});
DatePickerInput.displayName = "DatePickerInput";
export default DatePickerInput;
