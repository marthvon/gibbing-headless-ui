<script lang="ts" module>
  export type { ActionTone, RowStatus, StackWidth, TableAction } from "./_internal/table_layout";
  export type TableColumn = { key: string; label: string; date?: boolean };
</script>

<script lang="ts" generics="Row extends { id: string }">
  import { onDestroy, onMount, type Snippet } from "svelte";
  import { sortPosition, type Sort } from "./_internal/sorts";
  import {
    PAGE_SIZES, cardWidths, cellText, columnFloor, columnPixels, columnShares, columnWidth, pageSelection, stackName, tableStack,
    type ColumnKind, type Measure, type RowStatus, type StackWidth, type TableAction
  } from "./_internal/table_layout";
  import { ify } from "./utils";

  export let columns: readonly TableColumn[];
  export let rows: readonly Row[];
  export let busy: boolean = false;
  export let cell: ((row: Row, key: string) => string) | undefined = undefined;
  export let cellNote: ((row: Row, key: string) => string | null) | undefined = undefined;
  export let cellClass: ((row: Row, key: string) => string | null) | undefined = undefined;
  export let badge: ((row: Row, key: string) => string | null) | undefined = undefined;
  export let rowClass: ((row: Row) => string | null) | undefined = undefined;
  export let rowEdge: ((row: Row) => { tone: string; label: string } | null) | undefined = undefined;
  export let status: ((row: Row) => RowStatus) | undefined = undefined;
  export let statusKey: string = "status";
  export let statusLabel: string = "Status";
  export let faded: ((row: Row) => boolean) | undefined = undefined;
  export let actions: ((row: Row) => TableAction[]) | undefined = undefined;
  export let menu: boolean = false;
  export let onopen: ((row: Row) => void) | undefined = undefined;
  export let sorts: readonly Sort[] = [];
  export let sortable: ReadonlySet<string> = new Set();
  export let page: number = 0;
  export let pages: number = 1;
  export let from: number = 0;
  export let to: number = 0;
  export let total: number = 0;
  export let pageSize: number = 10;
  export let pageSizes: readonly number[] = PAGE_SIZES;
  export let onpage: ((page: number) => void) | undefined = undefined;
  export let onpagesize: ((size: number) => void) | undefined = undefined;
  export let cursor: boolean = false;
  export let hasNext: boolean = false;
  export let selectable: boolean = false;
  export let selected: ReadonlySet<string> = new Set();
  export let onselect: ((id: string) => void) | undefined = undefined;
  export let onselectpage: ((on: boolean) => void) | undefined = undefined;
  export let fill: boolean = false;
  export let stackAt: StackWidth | undefined = undefined;
  export let empty: string = "Nothing here yet.";
  export let loadingLabel: string = "Loading…";
  export let sortByLabel: string = "Sort by";
  export let rowsLabel: string = "Rows";
  export let previousLabel: string = "Previous";
  export let nextLabel: string = "Next";
  export let actionsLabel: string = "Actions";
  export let selectPageLabel: string = "Select every row on this page";
  export let selectRowLabel: string = "Select this row";
  export let range: (from: number, to: number, total: number) => string = (start, end, count) => `${start + 1}–${end} of ${count}`;
  export let pageLabel: (page: number, pages: number) => string = (current, count) => `Page ${current + 1} of ${count}`;
  export let className: string | undefined = undefined;
  export let scrollClass: string | undefined = undefined;
  export let tableClass: string | undefined = undefined;
  export let headClass: string | undefined = undefined;
  export let headRowClass: string | undefined = undefined;
  export let headingClass: string | undefined = undefined;
  export let checkboxClass: string | undefined = undefined;
  export let pillClass: string | undefined = undefined;
  export let noteClass: string | undefined = undefined;
  export let actionsClass: string | undefined = undefined;
  export let menuButtonClass: string | undefined = undefined;
  export let menuClass: string | undefined = undefined;
  export let actionClass: string | undefined = undefined;
  export let footerClass: string | undefined = undefined;
  export let pagerClass: string | undefined = undefined;
  export let sizeClass: string | undefined = undefined;
  export let pageButtonClass: string | undefined = undefined;
  export let content: Snippet<[Row, string, string]> | undefined = undefined;
  export let menuIcon: Snippet | undefined = undefined;
  export let sortHeading: Snippet<[string, string]> | undefined = undefined;

  let tableWidth = 0;
  let tableNode: HTMLTableElement | undefined;
  let rem = 16;
  let pen: CanvasRenderingContext2D | null = null;
  let fontsLoaded = 0;
  let openMenu: string | null = null;
  let detach: (() => void) | undefined;

  $: textOf = (row: Row, key: string) => (cell ? cell(row, key) : cellText(row, key));
  $: statusColumn = status !== undefined;
  $: actionColumn = actions !== undefined;
  $: pageState = pageSelection(selected, rows.map((row) => row.id));
  $: span = columns.length + (selectable ? 1 : 0) + (actionColumn ? 1 : 0) + (statusColumn ? 1 : 0);
  $: stack = stackAt ?? tableStack(columns.length + (statusColumn ? 1 : 0) + (actionColumn ? 1 : 0));
  $: measured = [
    ...(selectable ? [{ key: "select", kind: "select" as ColumnKind, label: "", values: [] as string[] }] : []),
    ...columns.map((column) => ({
      key: column.key,
      kind: (column.date ? "date" : "text") as ColumnKind,
      label: column.label,
      values: rows.map((row) => textOf(row, column.key)),
    })),
    ...(status ? [{ key: statusKey, kind: "status" as ColumnKind, label: statusLabel, values: rows.map((row) => status(row).label) }] : []),
    ...(actionColumn ? [{ key: "actions", kind: "actions" as ColumnKind, label: "", values: [] as string[] }] : []),
  ];
  $: shares = columnShares(measured);
  $: pixels = columnPixels(shares, measured.map((column) => columnFloor(column.kind) * rem), tableWidth);
  $: sortsAny = !!sortHeading && [...columns.map((column) => column.key), ...(statusColumn ? [statusKey] : [])].some((key) => sortable.has(key));
  $: dateKeys = new Set(columns.filter((column) => column.date).map((column) => column.key));
  $: cardWidth = measureCards(pen, tableNode, rem, fontsLoaded, columns, rows, textOf, status, cellNote, badge);
  $: listen(openMenu);

  onMount(() => {
    rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    pen = document.createElement("canvas").getContext("2d");
    let live = true;
    document.fonts?.ready.then(() => {
      if (live) fontsLoaded += 1;
    });
    return () => {
      live = false;
    };
  });

  onDestroy(() => detach?.());

  // `_fonts` is unused: passing it makes the reactive statement measure again once web fonts finish loading.
  function measureCards(
    context: CanvasRenderingContext2D | null,
    node: HTMLTableElement | undefined,
    size: number,
    _fonts: number,
    shown: readonly TableColumn[],
    list: readonly Row[],
    textOf: (row: Row, key: string) => string,
    standing: typeof status,
    note: typeof cellNote,
    pill: typeof badge,
  ): Record<string, number> {
    if (!context || !node) return {};
    const family = getComputedStyle(node).fontFamily;
    const measure: Measure = (value, scale, caps) => {
      const px = (scale === "sm" ? 0.875 : 0.75) * size;
      context.font = `400 ${px}px ${family}`;
      const drawn = caps ? value.toUpperCase() : value;
      return context.measureText(drawn).width + (caps ? drawn.length * 0.025 * px : 0);
    };
    return cardWidths(
      [
        ...shown.slice(1).map((column) => ({
          key: column.key,
          label: column.label,
          cells: list.map((row) => ({ text: textOf(row, column.key), note: note?.(row, column.key), pill: !!pill?.(row, column.key) })),
        })),
        ...(standing
          ? [{
              key: statusKey,
              label: statusLabel,
              cells: list.map((row) => {
                const entry = standing(row);
                return { text: entry.label, pill: true, tag: entry.tag };
              }),
            }]
          : []),
      ],
      measure,
      size,
    );
  }

  function listen(on: string | null) {
    detach?.();
    detach = undefined;
    if (!on) return;
    const close = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("[data-row-menu]")) return;
      openMenu = null;
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") openMenu = null;
    };
    window.addEventListener("click", close);
    window.addEventListener("keydown", key);
    detach = () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", key);
    };
  }

  function mixed(node: HTMLInputElement, on: boolean) {
    node.indeterminate = on;
    return {
      update(next: boolean) {
        node.indeterminate = next;
      },
    };
  }

  function openRow(row: Row) {
    if (selectable) onselect?.(row.id);
    else onopen?.(row);
  }

  $: order = (key: string): "ascending" | "descending" | "none" => {
    const position = sortPosition(sorts, key);
    if (!position) return "none";
    else return position.direction === "asc" ? "ascending" : "descending";
  };
</script>

{#snippet heading(key: string, label: string)}
  {#if sortHeading && sortable.has(key)}
    <th class={ify("resource-table-sortable", dateKeys.has(key) && "resource-table-date-col", headingClass)} aria-sort={order(key)} aria-label={label}>
      {@render sortHeading(key, label)}
    </th>
  {:else}
    <th class={ify("resource-table-heading", dateKeys.has(key) && "resource-table-date-col", headingClass)} aria-sort={order(key)}>
      <span class="resource-table-heading-text">{label}</span>
    </th>
  {/if}
{/snippet}

<div
  class={ify("resource-table", fill && "resource-table-fill", rows.length > 2 && "resource-table-many", className)}
  style="container-name: {stackName(stack)}"
>
  <div bind:clientWidth={tableWidth} class={ify("resource-table-scroll", fill && "resource-table-scroll-bound", scrollClass)}>
    <table bind:this={tableNode} class={ify("resource-table-grid", tableClass)}>
      <colgroup>
        {#each shares as share, index (`${index}:${measured[index].key}`)}
          <col
            class={measured[index].kind === "date" ? "resource-table-date-col" : undefined}
            style="width: {pixels[index] ? `${pixels[index]}px` : columnWidth(share, measured[index].kind)}"
          />
        {/each}
      </colgroup>
      <thead class={ify("resource-table-head", !(selectable || sortsAny) && "resource-table-head-quiet", headClass)}>
        <tr class={ify("resource-table-head-row", headRowClass)}>
          {#if selectable}
            <th class="resource-table-check-heading">
              <input
                type="checkbox"
                class={ify("resource-table-checkbox", checkboxClass)}
                aria-label={selectPageLabel}
                checked={pageState === "all"}
                use:mixed={pageState === "some"}
                disabled={rows.length === 0}
                onchange={(event) => onselectpage?.(event.currentTarget.checked)}
              />
            </th>
          {/if}
          {#if sortsAny}<th aria-hidden="true" class="resource-table-sort-by">{sortByLabel}</th>{/if}
          {#each columns as column (column.key)}
            {@render heading(column.key, column.label)}
          {/each}
          {#if statusColumn}{@render heading(statusKey, statusLabel)}{/if}
          {#if actionColumn}<th class="resource-table-action-heading"></th>{/if}
        </tr>
      </thead>
      <tbody class="resource-table-body">
        {#if busy}
          <tr class="resource-table-message"><td colspan={span}>{loadingLabel}</td></tr>
        {:else if rows.length === 0}
          <tr class="resource-table-message"><td colspan={span}>{empty}</td></tr>
        {:else}
          {#each rows as row (row.id)}
            {@const dimmed = !!faded?.(row)}
            {@const rowActions = actions?.(row) ?? []}
            {@const clickable = !!onopen || selectable}
            <tr
              class={ify(
                "resource-table-row",
                selectable && "resource-table-selectable",
                clickable && "resource-table-clickable",
                selectable && selected.has(row.id) && "resource-table-selected",
                rowClass?.(row),
              )}
              tabindex={clickable ? 0 : undefined}
              onclick={(event) => {
                if (event.target instanceof Element && event.target.closest("[data-row-menu]")) return;
                openRow(row);
              }}
              onkeydown={(event) => {
                if (!clickable || event.key !== "Enter") return;
                if (event.target instanceof Element && event.target.closest("[data-row-menu]")) return;
                event.preventDefault();
                openRow(row);
              }}
            >
              {#if selectable}
                <td class={ify("resource-table-check", dimmed && "resource-table-dimmed")}>
                  <input
                    type="checkbox"
                    class={ify("resource-table-checkbox", checkboxClass)}
                    aria-label={selectRowLabel}
                    checked={selected.has(row.id)}
                    onclick={(event) => event.stopPropagation()}
                    onchange={() => onselect?.(row.id)}
                  />
                </td>
              {/if}
              {#each columns as column (column.key)}
                {@const value = textOf(row, column.key)}
                {@const tone = badge?.(row, column.key)}
                {@const note = cellNote?.(row, column.key)}
                {@const lead = column.key === columns[0]?.key}
                {@const edge = lead ? rowEdge?.(row) : null}
                <td
                  class={ify(
                    "resource-table-cell",
                    lead ? "resource-table-lead" : "resource-table-rest",
                    column.date && "resource-table-date-col",
                    edge && "resource-table-edged",
                    dimmed && "resource-table-dimmed",
                    cellClass?.(row, column.key),
                  )}
                  style={lead || !cardWidth[column.key] ? undefined : `--card-w: ${cardWidth[column.key]}px`}
                >
                  {#if edge}
                    <span aria-hidden="true" class={ify("resource-table-edge", edge.tone)}></span>
                    <span class="resource-table-edge-label">{edge.label}</span>
                  {/if}
                  {#if !lead}<span class="resource-table-card-label">{column.label}</span>{/if}
                  {#if content}
                    {@render content(row, column.key, value)}
                  {:else if tone}
                    <span class={ify("resource-table-pill", pillClass, tone)}>{value}</span>
                  {:else}
                    <span class="resource-table-value">
                      <span class={ify("resource-table-line", column.date && "resource-table-date")}>{value}</span>
                    </span>
                    {#if note}<span class={ify("resource-table-note", noteClass)}>{note}</span>{/if}
                  {/if}
                </td>
              {/each}
              {#if status}
                {@const standing = status(row)}
                <td
                  class={ify("resource-table-cell resource-table-rest", dimmed && "resource-table-dimmed")}
                  style={cardWidth[statusKey] ? `--card-w: ${cardWidth[statusKey]}px` : undefined}
                >
                  <span class="resource-table-card-label">{statusLabel}</span>
                  <span class={ify("resource-table-pill", pillClass, standing.tone)}>{standing.label}</span>
                  {#if standing.tag}<span class="resource-table-tag">{standing.tag}</span>{/if}
                </td>
              {/if}
              {#if actionColumn}
                <td class={ify("resource-table-actions", actionsClass)}>
                  {#if menu && rowActions.length > 0}
                    <div class="resource-table-menu-anchor" data-row-menu>
                      <button
                        type="button"
                        class={ify("resource-table-menu-button", menuButtonClass)}
                        aria-label={actionsLabel}
                        aria-haspopup="menu"
                        aria-expanded={openMenu === row.id}
                        onclick={(event) => {
                          event.stopPropagation();
                          openMenu = openMenu === row.id ? null : row.id;
                        }}
                      >
                        {#if menuIcon}
                          {@render menuIcon()}
                        {:else}
                          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <circle cx="8" cy="3" r="1.4" />
                            <circle cx="8" cy="8" r="1.4" />
                            <circle cx="8" cy="13" r="1.4" />
                          </svg>
                        {/if}
                      </button>
                      {#if openMenu === row.id}
                        <div role="menu" class={ify("resource-table-menu", menuClass)}>
                          {#each rowActions as action (action.id)}
                            <button
                              type="button"
                              role="menuitem"
                              class={ify("resource-table-menu-item", actionClass)}
                              data-tone={action.tone ?? "neutral"}
                              onclick={(event) => {
                                event.stopPropagation();
                                openMenu = null;
                                action.run();
                              }}
                            >
                              {action.label}
                            </button>
                          {/each}
                        </div>
                      {/if}
                    </div>
                  {:else}
                    {#each rowActions as action (action.id)}
                      <button
                        type="button"
                        class={ify("resource-table-link", actionClass)}
                        data-tone={action.tone ?? "neutral"}
                        onclick={(event) => {
                          event.stopPropagation();
                          action.run();
                        }}
                      >
                        {action.label}
                      </button>
                    {/each}
                  {/if}
                </td>
              {/if}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
  {#if cursor ? rows.length > 0 || page > 0 : total > 0}
    <div class={ify("resource-table-footer", footerClass)}>
      {#if !cursor}<p>{range(from, to, total)}</p>{/if}
      <div class={ify("resource-table-pager", cursor && "resource-table-pager-end", pagerClass)}>
        <label class="resource-table-size">
          {rowsLabel}
          <select
            class={ify("resource-table-size-select", sizeClass)}
            value={pageSize}
            onchange={(event) => onpagesize?.(Number(event.currentTarget.value))}
          >
            {#each pageSizes as size (size)}
              <option value={size}>{size}</option>
            {/each}
          </select>
        </label>
        <button type="button" class={ify("resource-table-page-button", pageButtonClass)} disabled={page <= 0} onclick={() => onpage?.(page - 1)}>
          {previousLabel}
        </button>
        {#if !cursor}<span>{pageLabel(page, pages)}</span>{/if}
        <button
          type="button"
          class={ify("resource-table-page-button", pageButtonClass)}
          disabled={cursor ? !hasNext : page + 1 >= pages}
          onclick={() => onpage?.(page + 1)}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  {/if}
</div>
