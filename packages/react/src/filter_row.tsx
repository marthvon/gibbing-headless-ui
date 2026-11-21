"use client";

import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import { CLEAR_SIZE, SEARCH_SIZE, filterRow, fitRef, type FilterSize } from "./_internal/filters";
import { ify, type Content } from "./utils";

export type { FilterSize } from "./_internal/filters";

export default function FilterRow({
  id, query, placeholder = "", label = "Search", toggleLabel = "More filters", sizes = [], searchSize = SEARCH_SIZE,
  clearSize = CLEAR_SIZE, applied = false, clearable = false, refreshing = false, className, flowClass, slotClass,
  searchClass, caption, clear, toggle, refresh, controls, onInput, onClear, onRefresh
}: {
  id: string;
  query: string;
  placeholder?: string;
  label?: string;
  toggleLabel?: string;
  sizes?: readonly FilterSize[];
  searchSize?: FilterSize;
  clearSize?: FilterSize;
  applied?: boolean;
  clearable?: boolean;
  refreshing?: boolean;
  className?: string;
  flowClass?: string;
  slotClass?: string;
  searchClass?: string;
  caption?: (label: string) => ReactNode;
  clear?: Content<[run: () => void]>;
  toggle?: Content<[id: string, applied: boolean]>;
  refresh?: Content<[run: () => void, refreshing: boolean]>;
  controls?: (slot: (index: number) => CSSProperties) => ReactNode;
  onInput: (text: string) => void;
  onClear?: () => void;
  onRefresh?: () => void;
}) {
  const clearing = clearable && onClear !== undefined;
  const layout = filterRow([searchSize, ...sizes], onRefresh ? 1 : 0, clearing ? clearSize.width : 0);
  const watch = useMemo(() => (layout.fit > 0 ? fitRef(layout.fit) : undefined), [layout.fit]);

  return (
    <div ref={watch} className={ify("filter-row", className)} style={layout.row} data-fits={layout.fit === 0 ? "" : undefined}>
      <input id={id} type="checkbox" aria-label={toggleLabel} className="filter-switch" />
      {clearing && onClear ? (typeof clear === "function" ? clear(onClear) : (
        <button
          type="button"
          className="field-button filter-clear"
          style={{ "--filter-clear-width": `${clearSize.width}rem` } as CSSProperties}
          onClick={onClear}
        >
          {clear ?? "Clear"}
        </button>
      )) : null}
      {typeof toggle === "function" ? toggle(id, applied) : (
        <label htmlFor={id} title={toggleLabel} className={ify("field-icon-button filter-toggle", applied && "filter-applied")}>
          {toggle ?? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 5h16M7 12h10M10 19h4" strokeLinecap="round" />
            </svg>
          )}
        </label>
      )}
      {onRefresh ? (typeof refresh === "function" ? refresh(onRefresh, refreshing) : (
        <button
          type="button"
          className="field-icon-button filter-refresh"
          title="Refresh"
          aria-label="Refresh"
          aria-busy={refreshing}
          disabled={refreshing}
          onClick={onRefresh}
        >
          {refresh ?? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      )) : null}
      <div className={ify("filter-flow", flowClass)}>
        <label className={ify("field filter-slot", slotClass)} style={layout.slots[0]}>
          {caption ? caption(label) : <span className="field-label">{label}</span>}
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
