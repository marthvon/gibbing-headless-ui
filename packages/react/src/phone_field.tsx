"use client";

import type { ChangeEvent, FocusEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import Select from "./select";
import { FLAGS } from "./_internal/flags";
import { DIAL_COUNTRIES, countryFor, dialLabel, digitsOnly, joinPhone, splitPhone, type DialCountry } from "./_internal/phone";
import { DropdownPreset } from "./presets.client";
import { ify, zLayer } from "./utils";

export type { DialCountry } from "./_internal/phone";
export type PhoneInput = {
  label: string;
  value: string;
  error: string | null | undefined;
  maxLength: number;
  mode: "tel";
  autoComplete: "tel-national";
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function PhoneField({
  label, value, maxLength = 16, countries = DIAL_COUNTRIES, preset = DropdownPreset.TOP, codeLabel,
  format = dialLabel, formId, error, zIndex, className, rowClass, dialClass, triggerClass, menuClass, optionClass,
  numberClass, inputClass, caption, flag, message, field, onChange, onBlur
}: {
  label: string;
  value?: string;
  maxLength?: number;
  countries?: readonly DialCountry[];
  preset?: DropdownPreset;
  codeLabel?: string;
  format?: (country: DialCountry) => string;
  formId?: string;
  error?: string | null;
  zIndex?: number;
  className?: string;
  rowClass?: string;
  dialClass?: string;
  triggerClass?: string;
  menuClass?: string;
  optionClass?: string;
  numberClass?: string;
  inputClass?: string;
  caption?: (text: string, id: string) => ReactNode;
  flag?: (country: DialCountry) => ReactNode;
  message?: (error: string) => ReactNode;
  field?: (input: PhoneInput) => ReactNode;
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

  function typed(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const next = digitsOnly(event.currentTarget.value);
    setNational(next);
    emit(iso, next);
  }

  function leave(event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const next = event.relatedTarget;
    if (next instanceof Node && root.current?.contains(next)) return;
    onBlur?.();
  }

  return (
    <div ref={root} className={ify("field phone-field", className)} style={zLayer(zIndex)}>
      {field ? null : caption ? caption(label, id) : <label className="field-label" htmlFor={id}>{label}</label>}
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
                <svg viewBox="0 0 20 14" className="phone-flag" aria-hidden="true" dangerouslySetInnerHTML={{ __html: FLAGS[choice.value] ?? "" }} />
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
          {field
            ? field({ label, value: national, error, maxLength: nationalMax, mode: "tel", autoComplete: "tel-national", onChange: typed, onBlur: leave })
            : (
              <input
                id={id}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                className={ify("field-box", error && "field-invalid", inputClass)}
                maxLength={nationalMax}
                value={national}
                onChange={typed}
                onBlur={leave}
              />
            )}
        </div>
      </div>
      {error && !field ? (message ? message(error) : <p className="field-error">{error}</p>) : null}
    </div>
  );
}
