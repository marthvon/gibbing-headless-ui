import type { CSSProperties } from "react";

export type FilterSize = { width: number; min: number; grow: boolean };

export const FILTER_GAP = 0.75;
export const FILTER_TOGGLE = 2.25;
export const FILTER_ASIDE = FILTER_TOGGLE + FILTER_GAP;
export const FILTER_LABEL = 1.5;
export const FILTER_LINE = FILTER_LABEL + 2.25;
export const FILTER_PAD = 0.25;

export const SEARCH_SIZE: FilterSize = { width: 12, min: 10, grow: true };
export const FILTER_SIZE: FilterSize = { width: 12, min: 10, grow: true };
export const WIDE_SIZE: FilterSize = { width: 20, min: 18, grow: true };
export const CLEAR_SIZE: FilterSize = { width: 4, min: 4, grow: false };

const STEP = 0.25;
const LAST = 9999;

function ends(sizes: readonly FilterSize[]): number[] {
  let end = -FILTER_GAP;
  return sizes.map((size) => (end += FILTER_GAP + size.width));
}

export function filterLines(sizes: readonly FilterSize[], width: number, aside = FILTER_ASIDE): number {
  const at = ends(sizes);
  let first = 1;
  while (first < sizes.length && at[first] + aside <= width) first += 1;
  let lines = 1;
  let used = Infinity;
  for (const size of sizes.slice(first)) {
    const placed = Math.min(size.width, width);
    if (used + FILTER_GAP + placed <= width) used += FILTER_GAP + placed;
    else {
      lines += 1;
      used = placed;
    }
  }
  return lines;
}

export function filterBreaks(sizes: readonly FilterSize[], aside = FILTER_ASIDE): number[] {
  const widest = (ends(sizes).at(-1) ?? 0) + aside;
  const breaks: number[] = [];
  let lines = filterLines(sizes, STEP, aside);
  for (let width = STEP; width <= widest; width += STEP) {
    const now = filterLines(sizes, width, aside);
    for (let line = lines; line > now; line -= 1) breaks.push(width);
    lines = Math.min(lines, now);
  }
  return breaks;
}

export function filterRow(
  sizes: readonly FilterSize[],
  aside = FILTER_ASIDE,
  tools = 1,
): { row: CSSProperties; slots: CSSProperties[] } {
  const at = ends(sizes);
  const slots = sizes.map((size, index) => ({
    "--filter-width": `${size.width}rem`,
    "--filter-min": index === 0 ? `min(${size.min}rem, 100% - ${aside}rem)` : `${size.min}rem`,
    "--filter-end": `${index === 0 ? 0 : at[index]}rem`,
    "--filter-next": `${at[index + 1] ?? LAST}rem`,
    ...(size.grow ? {} : { "--filter-grow": "0" }),
  }) as CSSProperties);
  const open = [
    `${FILTER_LINE + 2 * FILTER_PAD}rem`,
    ...filterBreaks(sizes, aside).map(
      (width) => `clamp(0rem, (${width}rem - 100cqw) * 1000, ${FILTER_LINE + FILTER_GAP}rem)`,
    ),
  ].join(" + ");
  const row = {
    "--filter-gap": `${FILTER_GAP}rem`,
    "--filter-aside": `${aside}rem`,
    "--filter-clear": `${tools * FILTER_ASIDE}rem`,
    "--filter-toggle": `${(tools - 1) * FILTER_ASIDE}rem`,
    "--filter-label": `${FILTER_LABEL}rem`,
    "--filter-line": `${FILTER_LINE}rem`,
    "--filter-pad": `${FILTER_PAD}rem`,
    "--filter-open": `calc(${open})`,
  } as CSSProperties;
  return { row, slots };
}
