export type SortDirection = "asc" | "desc";

export type Sort = {
  key: string;
  direction: SortDirection;
};

export type SortMode = "single" | "multiple";

export function sortPosition(sorts: readonly Sort[], key: string): { rank: number; direction: SortDirection } | null {
  const index = sorts.findIndex((sort) => sort.key === key);
  return index === -1 ? null : { rank: index + 1, direction: sorts[index].direction };
}

export function headerSort(
  sorts: readonly Sort[],
  key: string,
  direction: SortDirection,
  mode: SortMode = "multiple",
): Sort[] {
  const current = sorts.find((sort) => sort.key === key);
  if (current?.direction === direction) return sorts.filter((sort) => sort.key !== key);
  else if (mode === "single") return [{ key, direction }];
  else if (current) return sorts.map((sort) => (sort.key === key ? { key, direction } : sort));
  else return [...sorts, { key, direction }];
}
