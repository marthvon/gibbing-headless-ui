"use client";

import type { ReactNode } from "react";
import { sortPosition, type Sort, type SortDirection } from "./_internal/sorts";
import { ify } from "./utils";

export type { Sort, SortDirection, SortMode } from "./_internal/sorts";

export default function SortHeading({
  sortKey, label, sorts, ascTitle = "Ascending", descTitle = "Descending", ascLabel, descLabel,
  className, labelClass, textClass, arrowsClass, buttonClass, arrow, onSort
}: {
  sortKey: string;
  label: string;
  sorts: readonly Sort[];
  ascTitle?: string;
  descTitle?: string;
  ascLabel?: string;
  descLabel?: string;
  className?: string;
  labelClass?: string;
  textClass?: string;
  arrowsClass?: string;
  buttonClass?: string;
  arrow?: (direction: SortDirection) => ReactNode;
  onSort?: (key: string, direction: SortDirection) => void;
}) {
  const position = sortPosition(sorts, sortKey);
  const glyph = (direction: SortDirection) => (arrow ? arrow(direction) : direction === "asc" ? "↑" : "↓");
  return (
    <div className={ify("sort-heading", className)}>
      <div className={ify("sort-heading-label", labelClass)}>
        <span className={ify("sort-heading-text", textClass)}>{label}</span>
        <span aria-hidden="true" className={ify("sort-arrows", arrowsClass)}>
          {position ? (
            <span className="sort-arrow" data-sort={position.direction}>
              {glyph(position.direction)}{sorts.length > 1 ? position.rank : ""}
            </span>
          ) : null}
          {position?.direction !== "asc" ? <span className="sort-hint" data-sort="asc">{glyph("asc")}</span> : null}
          {position?.direction !== "desc" ? <span className="sort-hint" data-sort="desc">{glyph("desc")}</span> : null}
        </span>
      </div>
      <div className="sort-buttons">
        <button
          type="button"
          className={ify("sort-button", buttonClass)}
          data-sort="asc"
          title={ascTitle}
          aria-label={ascLabel ?? `Sort ${label} ascending`}
          aria-pressed={position?.direction === "asc"}
          onClick={() => onSort?.(sortKey, "asc")}
        ></button>
        <button
          type="button"
          className={ify("sort-button", buttonClass)}
          data-sort="desc"
          title={descTitle}
          aria-label={descLabel ?? `Sort ${label} descending`}
          aria-pressed={position?.direction === "desc"}
          onClick={() => onSort?.(sortKey, "desc")}
        ></button>
      </div>
    </div>
  );
}
