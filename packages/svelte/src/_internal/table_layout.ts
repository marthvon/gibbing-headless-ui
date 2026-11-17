export type ColumnKind = "text" | "date" | "select" | "status" | "actions";
export type ColumnShare = { key: string; kind: ColumnKind; label: string; values: readonly string[] };

export type ActionTone = "neutral" | "danger" | "restore" | "caution";
export type TableAction = { id: string; label: string; tone?: ActionTone; run: () => void };
export type RowStatus = { label: string; tone?: string; tag?: string | null };
export type PageSelection = "none" | "some" | "all";

export const PAGE_SIZES: readonly number[] = [10, 20, 50, 100];
export const STACK_WIDTHS = [24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112] as const;
export type StackWidth = (typeof STACK_WIDTHS)[number];

const FIXED_WEIGHT = 4;
const TEXT_CAP = 40;
const FLOORS: Readonly<Record<ColumnKind, number>> = { text: 0, date: 9, select: 2.5, status: 6, actions: 3.25 };

const STACK_STEP = 6;
const STACK_FLOOR: StackWidth = 80;
const STACK_CAP: StackWidth = 88;

export function columnFloor(kind: ColumnKind): number {
  return FLOORS[kind];
}

export function columnWidth(share: number, kind: ColumnKind): string {
  const floor = FLOORS[kind];
  return floor > 0 ? `max(${share}%, ${floor}rem)` : `${share}%`;
}

/** Pixel widths that sum to the table: a column under its floor is raised to it, and the columns without a floor give that space up in proportion. */
export function columnPixels(shares: readonly number[], floors: readonly number[], tableWidth: number): number[] {
  if (tableWidth <= 0 || shares.length === 0) return [];
  const widths = shares.map((share) => (share / 100) * tableWidth);
  let deficit = 0;
  const raised = widths.map((width, index) => {
    const floor = floors[index] ?? 0;
    if (width >= floor) return width;
    deficit += floor - width;
    return floor;
  });
  if (deficit === 0) return raised;
  const flex = raised.map((width, index) => ((floors[index] ?? 0) > 0 ? 0 : width));
  const flexSum = flex.reduce((sum, width) => sum + width, 0);
  if (flexSum <= 0) return raised;
  const take = Math.min(deficit, flexSum);
  return raised.map((width, index) => width - take * (flex[index] / flexSum));
}

/** Percentage width of each column, summing to 100: as wide as its longest text, and no wider than 40 characters. */
export function columnShares(columns: readonly ColumnShare[]): number[] {
  if (columns.length === 0) return [];
  const weights = columns.map((column) => {
    if (column.kind === "select" || column.kind === "actions") return FIXED_WEIGHT;
    const longest = column.values.reduce((max, value) => Math.max(max, value.length), 0);
    return Math.min(TEXT_CAP, Math.max(column.label.length, longest, 1));
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const exact = weights.map((weight) => (weight / total) * 10000);
  const floors = exact.map((value) => Math.floor(value));
  let left = 10000 - floors.reduce((sum, value) => sum + value, 0);
  const ranked = exact
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest || a.index - b.index);
  const shares = [...floors];
  for (let step = 0; left > 0; step += 1) {
    shares[ranked[step % ranked.length].index] += 1;
    left -= 1;
  }
  return shares.map((value) => value / 100);
}

/** 6rem a column, never under 80rem nor past 88rem: the container width below which rows become cards. */
export function tableStack(columnCount: number): StackWidth {
  const need = Math.max(columnCount * STACK_STEP, STACK_FLOOR);
  return STACK_WIDTHS.filter((width) => width <= STACK_CAP).find((width) => width >= need) ?? STACK_CAP;
}

export function stackName(width: StackWidth): string {
  return `table-stack-${width}`;
}

export type CardCell = { text: string; note?: string | null; pill?: boolean; tag?: string | null };
export type CardColumn = { key: string; label: string; cells: readonly CardCell[] };
export type Measure = (text: string, size: "sm" | "xs", caps?: boolean) => number;

const PILL_PAD_REM = 1;
const TAG_GAP_REM = 0.25;

function cellWidth(cell: CardCell, measure: Measure, rem: number): number {
  let line = cell.pill ? measure(cell.text, "xs") + PILL_PAD_REM * rem : measure(cell.text, "sm");
  if (cell.tag) line += TAG_GAP_REM * rem + measure(cell.tag, "xs") + PILL_PAD_REM * rem;
  const note = (cell.note ?? "").split("\n").reduce((widest, part) => Math.max(widest, measure(part, "xs")), 0);
  return Math.max(line, note);
}

/** The whole-px width each card field takes so it lines up on every card: its widest label or value. */
export function cardWidths(columns: readonly CardColumn[], measure: Measure, rem: number): Record<string, number> {
  const widths: Record<string, number> = {};
  for (const column of columns) {
    const label = column.label ? measure(column.label, "xs", true) : 0;
    widths[column.key] = Math.ceil(column.cells.reduce((max, cell) => Math.max(max, cellWidth(cell, measure, rem)), label));
  }
  return widths;
}

export function pageSelection(selected: ReadonlySet<string>, ids: readonly string[]): PageSelection {
  const count = ids.filter((id) => selected.has(id)).length;
  if (count === 0) return "none";
  else return count === ids.length ? "all" : "some";
}

export function cellText(row: object, key: string): string {
  const value = (row as Record<string, unknown>)[key];
  if (value === null || value === undefined || value === "") return "—";
  else if (value instanceof Date) return value.toLocaleDateString();
  else return String(value);
}
