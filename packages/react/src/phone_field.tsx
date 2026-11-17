"use client";

import type { FocusEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import Select from "./select";
import { FLAGS } from "./_internal/flags";
import { DIAL_COUNTRIES, countryFor, dialLabel, digitsOnly, joinPhone, splitPhone, type DialCountry } from "./_internal/phone";
import { DropdownPreset } from "./presets.client";
import { ify } from "./utils";

export type { DialCountry } from "./_internal/phone";

export default function PhoneField({
  label, value, maxLength = 16, countries = DIAL_COUNTRIES, floating = false, preset = DropdownPreset.TOP, codeLabel,
  format = dialLabel, formId, error, className, labelClass, rowClass, dialClass, triggerClass, menuClass, optionClass,
  flagClass, numberClass, inputClass, errorClass, flag, onChange, onBlur
}: {
  label: string;
  value?: string;
  maxLength?: number;
  countries?: readonly DialCountry[];
  floating?: boolean;
  preset?: DropdownPreset;
  codeLabel?: string;
  format?: (country: DialCountry) => string;
  formId?: string;
  error?: string | null;
  className?: string;
  labelClass?: string;
  rowClass?: string;
  dialClass?: string;
  triggerClass?: string;
  menuClass?: string;
  optionClass?: string;
  flagClass?: string;
  numberClass?: string;
  inputClass?: string;
  errorClass?: string;
  flag?: (country: DialCountry) => ReactNode;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}) {
  const id = (formId ? `${formId}-` : "--tw-phone-") + useId();
  const root = useRef<HTMLDivElement>(null);
  const last = useRef(value);
  const [iso, setIso] = useState(() => splitPhone(value, countries).iso);
  const [national, setNational] = useState(() => splitPhone(value, countries).national);

  useEffect(() => {
    if (value === undefined || value === last.current) return;
    last.current = value;
    const parts = splitPhone(value, countries);
    setIso(parts.iso);
    setNational(parts.national);
  }, [value, countries]);

  const nationalMax = Math.max(1, maxLength - countryFor(iso, countries).dial.length);
  const options = countries.map((country) => ({ value: country.iso, label: format(country) }));

  function emit(nextIso: string, nextNational: string) {
    const capped = joinPhone(countryFor(nextIso, countries).dial, nextNational).slice(0, maxLength);
    last.current = capped;
    onChange?.(capped);
  }

  function leave(event: FocusEvent<HTMLInputElement>) {
    const next = event.relatedTarget;
    if (next instanceof Node && root.current?.contains(next)) return;
    onBlur?.();
  }

  return (
    <div ref={root} className={ify("field phone-field", className)}>
      {floating ? null : <label className={ify("field-label", labelClass)} htmlFor={id}>{label}</label>}
      <div className={ify("phone-row", rowClass)}>
        <Select
          label={codeLabel ?? `${label} country code`}
          labelled={false}
          preset={preset}
          className={ify("phone-dial", dialClass)}
          triggerClass={triggerClass}
          menuClass={menuClass}
          optionClass={optionClass}
          options={options}
          value={iso}
          error={error}
          option={(choice) => (
            <>
              {flag ? flag(countryFor(choice.value, countries)) : (
                <svg viewBox="0 0 20 14" className={ify("phone-flag", flagClass)} aria-hidden="true" dangerouslySetInnerHTML={{ __html: FLAGS[choice.value] ?? "" }} />
              )}
              {choice.label}
            </>
          )}
          onChange={(next) => {
            setIso(next);
            emit(next, national);
          }}
        />
        <div className={ify("phone-number", numberClass)}>
          <input
            id={id}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            className={floating
              ? ify("peer textbox-a0 phone-floating", error ? "field-invalid" : "textbox-a1", inputClass)
              : ify("field-box", error && "field-invalid", inputClass)}
            placeholder={floating ? "ㅤ" : undefined}
            maxLength={nationalMax}
            value={national}
            onChange={(event) => {
              const next = digitsOnly(event.currentTarget.value);
              setNational(next);
              emit(iso, next);
            }}
            onBlur={leave}
          />
          {floating ? (
            <label className={ify("textbox-text-a textbox-label-a pointer-events-none", labelClass)} htmlFor={id}>{error ?? label}</label>
          ) : null}
        </div>
      </div>
      {error && !floating ? <p className={ify("field-error", errorClass)}>{error}</p> : null}
    </div>
  );
}
