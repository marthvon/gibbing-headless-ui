"use client";

import type { ReactNode, ForwardedRef } from "react";
import { forwardRef, useEffect, useId, useMemo, useState } from "react";
import { ify } from "./utils";

export type DayCtx = { date: Date; iso: string; inMonth: boolean; selected: boolean; today: boolean };
export type WeekdayCtx = { dow: number; label: string };
export type HeadingCtx = { view: Date; label: string; setView: (date: Date) => void };

function toIso(date: Date): string {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

function parseIso(iso: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m == null) return undefined;
  else {
    const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (date.getFullYear() !== Number(m[1]) || date.getMonth() !== Number(m[2]) - 1 || date.getDate() !== Number(m[3])) return undefined;
    else return date;
  }
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function firstWeekDay(locale?: string): number {
  try {
    const weekInfo = (new Intl.Locale(locale ?? "en-US") as Intl.Locale & { weekInfo?: { firstDay: number } }).weekInfo;
    if (weekInfo == null) return 0;
    else if (weekInfo.firstDay === 7) return 0;
    else return weekInfo.firstDay;
  } catch {
    return 0;
  }
}

function monthCells(view: Date, weekStart: number): Date[] {
  const first = startOfMonth(view);
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - ((first.getDay() - weekStart + 7) % 7));
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export type DatePickerProps = {
  value?: string;
  formId?: string;
  label?: string;
  locale?: string;
  className?: string;
  headingClass?: string;
  gridClass?: string;
  cellClass?: string;
  weekdayClass?: string;
  onInput?: (iso: string) => void;
  onChange?: (iso: string) => void;
  prev?: ReactNode;
  next?: ReactNode;
  heading?: (ctx: HeadingCtx) => ReactNode;
  weekday?: (ctx: WeekdayCtx) => ReactNode;
  day?: (ctx: DayCtx) => ReactNode;
  dayMini?: (ctx: DayCtx) => ReactNode;
  children?: ReactNode;
};

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker({
  value, formId, label, locale, className, headingClass, gridClass, cellClass, weekdayClass,
  onInput, onChange, prev, next, heading, weekday, day, dayMini, children
}: DatePickerProps, ref: ForwardedRef<HTMLInputElement>) {
  const uid = useId();
  const todayIso = useMemo(() => toIso(new Date()), []);
  const [internalSelected, setInternalSelected] = useState("");
  const [view, setView] = useState(() => startOfMonth(parseIso(value ?? "") ?? new Date()));
  const selected = value !== undefined ? value : internalSelected;
  const weekStart = useMemo(() => firstWeekDay(locale), [locale]);
  const cells = useMemo(() => monthCells(view, weekStart), [view, weekStart]);
  const headingLabel = useMemo(() => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(view), [locale, view]);
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const dow = (weekStart + i) % 7;
    return { dow, label: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, 7 + dow)) };
  }), [locale, weekStart]);

  useEffect(() => {
    if (value === undefined) return;
    const date = parseIso(value);
    if (date != null) setView(startOfMonth(date));
  }, [value]);

  function setViewMonth(date: Date) {
    setView(startOfMonth(date));
  }

  function select(iso: string) {
    const date = parseIso(iso);
    if (date != null) setView(startOfMonth(date));
    if (value === undefined) setInternalSelected(iso);
    onInput?.(iso);
    onChange?.(iso);
  }

  const id = formId ? `${formId}-datepicker-${(label ?? "").toLowerCase().replaceAll(" ", "_")}` : `--tw-datepicker-${uid}`;

  return (
    <div className={ify("datepicker", className)}>
      <input id={id} type="hidden" ref={ref} value={selected} readOnly />
      <div className={ify("datepicker-heading", headingClass)}>
        <button type="button" aria-label="Previous month" onClick={() => setViewMonth(new Date(view.getFullYear(), view.getMonth() - 1, 1))}>
          {prev ?? "‹"}
        </button>
        <div className="flex box">
          {heading ? heading({ view, label: headingLabel, setView: setViewMonth }) : headingLabel}
        </div>
        <button type="button" aria-label="Next month" onClick={() => setViewMonth(new Date(view.getFullYear(), view.getMonth() + 1, 1))}>
          {next ?? "›"}
        </button>
      </div>
      <div className={ify("datepicker-weekdays", weekdayClass)}>
        {weekdays.map((dayOfWeek) => (
          <div key={dayOfWeek.dow} className="datepicker-weekday">
            {weekday ? weekday(dayOfWeek) : dayOfWeek.label}
          </div>
        ))}
      </div>
      <div className={ify("datepicker-grid", gridClass)} role="grid">
        {cells.map((date) => {
          const iso = toIso(date);
          const ctx: DayCtx = {
            date, iso,
            inMonth: date.getMonth() === view.getMonth() && date.getFullYear() === view.getFullYear(),
            selected: iso === selected,
            today: iso === todayIso
          };
          return (
            <button key={iso} type="button" role="gridcell" className={ify("datepicker-cell", cellClass, !ctx.inMonth && "datepicker-cell-outside", ctx.selected && "datepicker-cell-selected", ctx.today && "datepicker-cell-today")}
              aria-selected={ctx.selected} aria-current={ctx.today ? "date" : undefined} onClick={() => select(iso)}>
              {day && dayMini ? (
                <>
                  <div className="datepicker-day-mini">{dayMini(ctx)}</div>
                  <div className="datepicker-day-full">{day(ctx)}</div>
                </>
              ) : day ? day(ctx) : dayMini ? dayMini(ctx) : ctx.date.getDate()}
            </button>
          );
        })}
      </div>
      {children ? <div className="datepicker-footer">{children}</div> : undefined}
    </div>
  );
});
DatePicker.displayName = "DatePicker";
export default DatePicker;
