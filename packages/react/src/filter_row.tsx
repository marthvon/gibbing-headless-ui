"use client";

import type { CSSProperties, ReactNode } from "react";
import { CLEAR_SIZE, FILTER_ASIDE, FILTER_GAP, SEARCH_SIZE, filterRow, type FilterSize } from "./_internal/filters";
import { ify } from "./utils";

export type { FilterSize } from "./_internal/filters";

export default function FilterRow({
  id, query, placeholder = "", label = "Search", sizes = [], searchSize = SEARCH_SIZE, clearSize = CLEAR_SIZE,
  applied = false, clearable = false, refreshing = false, clearLabel = "Clear", toggleLabel = "More filters",
  refreshLabel = "Refresh", className, flowClass, slotClass, labelClass, searchClass, clearClass, toggleClass,
  refreshClass, toggleIcon, refreshIcon, controls, onInput, onClear, onRefresh
}: {
  id: string;
  query: string;
  placeholder?: string;
  label?: string;
  sizes?: readonly FilterSize[];
  searchSize?: FilterSize;
  clearSize?: FilterSize;
  applied?: boolean;
  clearable?: boolean;
  refreshing?: boolean;
  clearLabel?: string;
  toggleLabel?: string;
  refreshLabel?: string;
  className?: string;
  flowClass?: string;
  slotClass?: string;
  labelClass?: string;
  searchClass?: string;
  clearClass?: string;
  toggleClass?: string;
  refreshClass?: string;
  toggleIcon?: ReactNode;
  refreshIcon?: ReactNode;
  controls?: (slot: (index: number) => CSSProperties) => ReactNode;
  onInput: (text: string) => void;
  onClear?: () => void;
  onRefresh?: () => void;
}) {
  const clearing = clearable && onClear !== undefined;
  const tools = onRefresh ? 2 : 1;
  const aside = tools * FILTER_ASIDE + (clearing ? FILTER_GAP + clearSize.width : 0);
  const layout = filterRow([searchSize, ...sizes], aside, tools);

  return (
    <div className={ify("filter-row", className)} style={layout.row}>
      <input id={id} type="checkbox" aria-label={toggleLabel} className="filter-switch" />
      {clearing ? (
        <button
          type="button"
          className={ify("field-button filter-clear", clearClass)}
          style={{ "--filter-clear-width": `${clearSize.width}rem` } as CSSProperties}
          onClick={onClear}
        >
          {clearLabel}
        </button>
      ) : null}
      <label htmlFor={id} title={toggleLabel} className={ify("field-icon-button filter-toggle", applied && "filter-applied", toggleClass)}>
        {toggleIcon ?? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 5h16M7 12h10M10 19h4" strokeLinecap="round" />
          </svg>
        )}
      </label>
      {onRefresh ? (
        <button
          type="button"
          className={ify("field-icon-button filter-refresh", refreshClass)}
          title={refreshLabel}
          aria-label={refreshLabel}
          aria-busy={refreshing}
          disabled={refreshing}
          onClick={onRefresh}
        >
          {refreshIcon ?? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      ) : null}
      <div className={ify("filter-flow", flowClass)}>
        <label className={ify("field filter-slot", slotClass)} style={layout.slots[0]}>
          <span className={ify("field-label", labelClass)}>{label}</span>
          <input
            type="search"
            className={ify("field-box", searchClass)}
            value={query}
            placeholder={placeholder}
            onChange={(event) => onInput(event.currentTarget.value)}
          />
        </label>
        {controls?.((index) => layout.slots[index + 1])}
      </div>
    </div>
  );
}
