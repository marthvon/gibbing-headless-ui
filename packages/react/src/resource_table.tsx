"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { sortPosition, type Sort } from "./_internal/sorts";
import {
  PAGE_SIZES, cardWidths, cellText, columnFloor, columnPixels, columnShares, columnWidth, pageSelection, stackName, tableStack,
  type ColumnKind, type Measure, type RowStatus, type StackWidth, type TableAction
} from "./_internal/table_layout";
import { ify } from "./utils";

export type { ActionTone, RowStatus, StackWidth, TableAction } from "./_internal/table_layout";
export type TableColumn = { key: string; label: string; date?: boolean };

export type ResourceTableProps<Row extends { id: string }> = {
  columns: readonly TableColumn[];
  rows: readonly Row[];
  busy?: boolean;
  cell?: (row: Row, key: string) => string;
  cellNote?: (row: Row, key: string) => string | null;
  cellClass?: (row: Row, key: string) => string | null;
  badge?: (row: Row, key: string) => string | null;
  rowClass?: (row: Row) => string | null;
  rowEdge?: (row: Row) => { tone: string; label: string } | null;
  status?: (row: Row) => RowStatus;
  statusKey?: string;
  statusLabel?: string;
  faded?: (row: Row) => boolean;
  actions?: (row: Row) => TableAction[];
  menu?: boolean;
  onOpen?: (row: Row) => void;
  sorts?: readonly Sort[];
  sortable?: ReadonlySet<string>;
  page?: number;
  pages?: number;
  from?: number;
  to?: number;
  total?: number;
  pageSize?: number;
  pageSizes?: readonly number[];
  onPage?: (page: number) => void;
  onPageSize?: (size: number) => void;
  cursor?: boolean;
  hasNext?: boolean;
  selectable?: boolean;
  selected?: ReadonlySet<string>;
  onSelect?: (id: string) => void;
  onSelectPage?: (on: boolean) => void;
  fill?: boolean;
  stackAt?: StackWidth;
  empty?: string;
  loadingLabel?: string;
  sortByLabel?: string;
  rowsLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  actionsLabel?: string;
  selectPageLabel?: string;
  selectRowLabel?: string;
  range?: (from: number, to: number, total: number) => string;
  pageLabel?: (page: number, pages: number) => string;
  className?: string;
  scrollClass?: string;
  tableClass?: string;
  headClass?: string;
  headRowClass?: string;
  headingClass?: string;
  checkboxClass?: string;
  pillClass?: string;
  noteClass?: string;
  actionsClass?: string;
  menuButtonClass?: string;
  menuClass?: string;
  actionClass?: string;
  footerClass?: string;
  pagerClass?: string;
  sizeClass?: string;
  pageButtonClass?: string;
  content?: (row: Row, key: string, text: string) => ReactNode;
  menuIcon?: ReactNode;
  sortHeading?: (key: string, label: string) => ReactNode;
};

const NONE: ReadonlySet<string> = new Set();

export default function ResourceTable<Row extends { id: string }>({
  columns, rows, busy = false, cell, cellNote, cellClass, badge, rowClass, rowEdge, status, statusKey = "status",
  statusLabel = "Status", faded, actions, menu = false, onOpen, sorts = [], sortable = NONE,
  page = 0, pages = 1, from = 0, to = 0, total = 0, pageSize = 10, pageSizes = PAGE_SIZES, onPage, onPageSize,
  cursor = false, hasNext = false, selectable = false, selected = NONE, onSelect, onSelectPage, fill = false, stackAt,
  empty = "Nothing here yet.", loadingLabel = "Loading…", sortByLabel = "Sort by", rowsLabel = "Rows",
  previousLabel = "Previous", nextLabel = "Next", actionsLabel = "Actions", selectPageLabel = "Select every row on this page",
  selectRowLabel = "Select this row", range = (start, end, count) => `${start + 1}–${end} of ${count}`,
  pageLabel = (current, count) => `Page ${current + 1} of ${count}`, className, scrollClass, tableClass, headClass,
  headRowClass, headingClass, checkboxClass, pillClass, noteClass, actionsClass, menuButtonClass, menuClass, actionClass,
  footerClass, pagerClass, sizeClass, pageButtonClass, content, menuIcon, sortHeading
}: ResourceTableProps<Row>) {
  const scroller = useRef<HTMLDivElement>(null);
  const table = useRef<HTMLTableElement>(null);
  const pen = useRef<CanvasRenderingContext2D | null>(null);
  const [tableWidth, setTableWidth] = useState(0);
  const [rem, setRem] = useState(16);
  const [, setFontsLoaded] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const text = (row: Row, key: string) => (cell ? cell(row, key) : cellText(row, key));
  const statusColumn = status !== undefined;
  const actionColumn = actions !== undefined;
  const pageState = pageSelection(selected, rows.map((row) => row.id));
  const span = columns.length + (selectable ? 1 : 0) + (actionColumn ? 1 : 0) + (statusColumn ? 1 : 0);
  const stack = stackAt ?? tableStack(columns.length + (statusColumn ? 1 : 0) + (actionColumn ? 1 : 0));
  const measured = [
    ...(selectable ? [{ key: "select", kind: "select" as ColumnKind, label: "", values: [] as string[] }] : []),
    ...columns.map((column) => ({
      key: column.key,
      kind: (column.date ? "date" : "text") as ColumnKind,
      label: column.label,
      values: rows.map((row) => text(row, column.key)),
    })),
    ...(status ? [{ key: statusKey, kind: "status" as ColumnKind, label: statusLabel, values: rows.map((row) => status(row).label) }] : []),
    ...(actionColumn ? [{ key: "actions", kind: "actions" as ColumnKind, label: "", values: [] as string[] }] : []),
  ];
  const shares = columnShares(measured);
  const pixels = columnPixels(shares, measured.map((column) => columnFloor(column.kind) * rem), tableWidth);
  const sortsAny = !!sortHeading && [...columns.map((column) => column.key), ...(statusColumn ? [statusKey] : [])].some((key) => sortable.has(key));
  const dateKeys = new Set(columns.filter((column) => column.date).map((column) => column.key));

  useEffect(() => {
    setRem(parseFloat(getComputedStyle(document.documentElement).fontSize));
    pen.current = document.createElement("canvas").getContext("2d");
    let live = true;
    document.fonts?.ready.then(() => {
      if (live) setFontsLoaded((count) => count + 1);
    });
    const node = scroller.current;
    if (!node) return () => void (live = false);
    const resized = new ResizeObserver(() => setTableWidth(node.clientWidth));
    resized.observe(node);
    setTableWidth(node.clientWidth);
    return () => {
      live = false;
      resized.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const close = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("[data-row-menu]")) return;
      setOpenMenu(null);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("click", close);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", key);
    };
  }, [openMenu]);

  let cardWidth: Record<string, number> = {};
  const context = pen.current;
  if (context && table.current) {
    const family = getComputedStyle(table.current).fontFamily;
    const measure: Measure = (value, size, caps) => {
      const px = (size === "sm" ? 0.875 : 0.75) * rem;
      context.font = `400 ${px}px ${family}`;
      const drawn = caps ? value.toUpperCase() : value;
      return context.measureText(drawn).width + (caps ? drawn.length * 0.025 * px : 0);
    };
    cardWidth = cardWidths(
      [
        ...columns.slice(1).map((column) => ({
          key: column.key,
          label: column.label,
          cells: rows.map((row) => ({ text: text(row, column.key), note: cellNote?.(row, column.key), pill: !!badge?.(row, column.key) })),
        })),
        ...(status
          ? [{
              key: statusKey,
              label: statusLabel,
              cells: rows.map((row) => {
                const standing = status(row);
                return { text: standing.label, pill: true, tag: standing.tag };
              }),
            }]
          : []),
      ],
      measure,
      rem,
    );
  }

  function openRow(row: Row) {
    if (selectable) onSelect?.(row.id);
    else onOpen?.(row);
  }

  function order(key: string): "ascending" | "descending" | "none" {
    const position = sortPosition(sorts, key);
    if (!position) return "none";
    else return position.direction === "asc" ? "ascending" : "descending";
  }

  function heading(key: string, label: string) {
    const date = dateKeys.has(key) && "resource-table-date-col";
    return sortHeading && sortable.has(key) ? (
      <th key={key} className={ify("resource-table-sortable", date, headingClass)} aria-sort={order(key)} aria-label={label}>
        {sortHeading(key, label)}
      </th>
    ) : (
      <th key={key} className={ify("resource-table-heading", date, headingClass)} aria-sort={order(key)}>
        <span className="resource-table-heading-text">{label}</span>
      </th>
    );
  }

  const cardStyle = (key: string): CSSProperties | undefined =>
    cardWidth[key] ? ({ "--card-w": `${cardWidth[key]}px` } as CSSProperties) : undefined;

  return (
    <div
      className={ify("resource-table", fill && "resource-table-fill", rows.length > 2 && "resource-table-many", className)}
      style={{ containerName: stackName(stack) }}
    >
      <div ref={scroller} className={ify("resource-table-scroll", fill && "resource-table-scroll-bound", scrollClass)}>
        <table ref={table} className={ify("resource-table-grid", tableClass)}>
          <colgroup>
            {shares.map((share, index) => (
              <col
                key={`${index}:${measured[index].key}`}
                className={measured[index].kind === "date" ? "resource-table-date-col" : undefined}
                style={{ width: pixels[index] ? `${pixels[index]}px` : columnWidth(share, measured[index].kind) }}
              />
            ))}
          </colgroup>
          <thead className={ify("resource-table-head", !(selectable || sortsAny) && "resource-table-head-quiet", headClass)}>
            <tr className={ify("resource-table-head-row", headRowClass)}>
              {selectable ? (
                <th className="resource-table-check-heading">
                  <input
                    type="checkbox"
                    className={ify("resource-table-checkbox", checkboxClass)}
                    aria-label={selectPageLabel}
                    checked={pageState === "all"}
                    ref={(node) => {
                      if (node) node.indeterminate = pageState === "some";
                    }}
                    disabled={rows.length === 0}
                    onChange={(event) => onSelectPage?.(event.currentTarget.checked)}
                  />
                </th>
              ) : null}
              {sortsAny ? <th aria-hidden="true" className="resource-table-sort-by">{sortByLabel}</th> : null}
              {columns.map((column) => heading(column.key, column.label))}
              {statusColumn ? heading(statusKey, statusLabel) : null}
              {actionColumn ? <th className="resource-table-action-heading"></th> : null}
            </tr>
          </thead>
          <tbody className="resource-table-body">
            {busy ? (
              <tr className="resource-table-message"><td colSpan={span}>{loadingLabel}</td></tr>
            ) : rows.length === 0 ? (
              <tr className="resource-table-message"><td colSpan={span}>{empty}</td></tr>
            ) : (
              rows.map((row) => {
                const dimmed = !!faded?.(row);
                const rowActions = actions?.(row) ?? [];
                const clickable = !!onOpen || selectable;
                const standing = status?.(row);
                return (
                  <tr
                    key={row.id}
                    className={ify(
                      "resource-table-row",
                      selectable && "resource-table-selectable",
                      clickable && "resource-table-clickable",
                      selectable && selected.has(row.id) && "resource-table-selected",
                      rowClass?.(row),
                    )}
                    tabIndex={clickable ? 0 : undefined}
                    onClick={(event) => {
                      if (event.target instanceof Element && event.target.closest("[data-row-menu]")) return;
                      openRow(row);
                    }}
                    onKeyDown={(event) => {
                      if (!clickable || event.key !== "Enter") return;
                      if (event.target instanceof Element && event.target.closest("[data-row-menu]")) return;
                      event.preventDefault();
                      openRow(row);
                    }}
                  >
                    {selectable ? (
                      <td className={ify("resource-table-check", dimmed && "resource-table-dimmed")}>
                        <input
                          type="checkbox"
                          className={ify("resource-table-checkbox", checkboxClass)}
                          aria-label={selectRowLabel}
                          checked={selected.has(row.id)}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => onSelect?.(row.id)}
                        />
                      </td>
                    ) : null}
                    {columns.map((column) => {
                      const value = text(row, column.key);
                      const tone = badge?.(row, column.key);
                      const note = cellNote?.(row, column.key);
                      const lead = column.key === columns[0]?.key;
                      const edge = lead ? rowEdge?.(row) : null;
                      return (
                        <td
                          key={column.key}
                          className={ify(
                            "resource-table-cell",
                            lead ? "resource-table-lead" : "resource-table-rest",
                            column.date && "resource-table-date-col",
                            edge && "resource-table-edged",
                            dimmed && "resource-table-dimmed",
                            cellClass?.(row, column.key),
                          )}
                          style={lead ? undefined : cardStyle(column.key)}
                        >
                          {edge ? (
                            <>
                              <span aria-hidden="true" className={ify("resource-table-edge", edge.tone)}></span>
                              <span className="resource-table-edge-label">{edge.label}</span>
                            </>
                          ) : null}
                          {lead ? null : <span className="resource-table-card-label">{column.label}</span>}
                          {content ? content(row, column.key, value) : tone ? (
                            <span className={ify("resource-table-pill", pillClass, tone)}>{value}</span>
                          ) : (
                            <>
                              <span className="resource-table-value">
                                <span className={ify("resource-table-line", column.date && "resource-table-date")}>{value}</span>
                              </span>
                              {note ? <span className={ify("resource-table-note", noteClass)}>{note}</span> : null}
                            </>
                          )}
                        </td>
                      );
                    })}
                    {standing ? (
                      <td className={ify("resource-table-cell resource-table-rest", dimmed && "resource-table-dimmed")} style={cardStyle(statusKey)}>
                        <span className="resource-table-card-label">{statusLabel}</span>
                        <span className={ify("resource-table-pill", pillClass, standing.tone)}>{standing.label}</span>
                        {standing.tag ? <span className="resource-table-tag">{standing.tag}</span> : null}
                      </td>
                    ) : null}
                    {actionColumn ? (
                      <td className={ify("resource-table-actions", actionsClass)}>
                        {menu && rowActions.length > 0 ? (
                          <div className="resource-table-menu-anchor" data-row-menu>
                            <button
                              type="button"
                              className={ify("resource-table-menu-button", menuButtonClass)}
                              aria-label={actionsLabel}
                              aria-haspopup="menu"
                              aria-expanded={openMenu === row.id}
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenMenu(openMenu === row.id ? null : row.id);
                              }}
                            >
                              {menuIcon ?? (
                                <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                  <circle cx="8" cy="3" r="1.4" />
                                  <circle cx="8" cy="8" r="1.4" />
                                  <circle cx="8" cy="13" r="1.4" />
                                </svg>
                              )}
                            </button>
                            {openMenu === row.id ? (
                              <div role="menu" className={ify("resource-table-menu", menuClass)}>
                                {rowActions.map((action) => (
                                  <button
                                    key={action.id}
                                    type="button"
                                    role="menuitem"
                                    className={ify("resource-table-menu-item", actionClass)}
                                    data-tone={action.tone ?? "neutral"}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setOpenMenu(null);
                                      action.run();
                                    }}
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          rowActions.map((action) => (
                            <button
                              key={action.id}
                              type="button"
                              className={ify("resource-table-link", actionClass)}
                              data-tone={action.tone ?? "neutral"}
                              onClick={(event) => {
                                event.stopPropagation();
                                action.run();
                              }}
                            >
                              {action.label}
                            </button>
                          ))
                        )}
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {(cursor ? rows.length > 0 || page > 0 : total > 0) ? (
        <div className={ify("resource-table-footer", footerClass)}>
          {cursor ? null : <p>{range(from, to, total)}</p>}
          <div className={ify("resource-table-pager", cursor && "resource-table-pager-end", pagerClass)}>
            <label className="resource-table-size">
              {rowsLabel}
              <select className={ify("resource-table-size-select", sizeClass)} value={pageSize} onChange={(event) => onPageSize?.(Number(event.currentTarget.value))}>
                {pageSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
            <button type="button" className={ify("resource-table-page-button", pageButtonClass)} disabled={page <= 0} onClick={() => onPage?.(page - 1)}>
              {previousLabel}
            </button>
            {cursor ? null : <span>{pageLabel(page, pages)}</span>}
            <button
              type="button"
              className={ify("resource-table-page-button", pageButtonClass)}
              disabled={cursor ? !hasNext : page + 1 >= pages}
              onClick={() => onPage?.(page + 1)}
            >
              {nextLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
