<script lang="ts" module>
  export type { FilterSize } from "./_internal/filters";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { CLEAR_SIZE, SEARCH_SIZE, filterRow, fits, type FilterSize } from "./_internal/filters";
  import { ify, type Content } from "./utils";

  export let id: string;
  export let query: string;
  export let placeholder: string = "";
  export let label: string = "Search";
  export let toggleLabel: string = "More filters";
  export let sizes: readonly FilterSize[] = [];
  export let searchSize: FilterSize = SEARCH_SIZE;
  export let clearSize: FilterSize = CLEAR_SIZE;
  export let applied: boolean = false;
  export let clearable: boolean = false;
  export let refreshing: boolean = false;
  export let className: string | undefined = undefined;
  export let flowClass: string | undefined = undefined;
  export let slotClass: string | undefined = undefined;
  export let searchClass: string | undefined = undefined;
  export let caption: Snippet<[string]> | undefined = undefined;
  export let clear: Content<[() => void]> | undefined = undefined;
  export let toggle: Content<[string, boolean]> | undefined = undefined;
  export let refresh: Content<[() => void, boolean]> | undefined = undefined;
  export let controls: Snippet<[(index: number) => string]> | undefined = undefined;
  export let oninput: (text: string) => void;
  export let onclear: (() => void) | undefined = undefined;
  export let onrefresh: (() => void) | undefined = undefined;

  $: clearing = clearable && onclear !== undefined;
  $: layout = filterRow([searchSize, ...sizes], onrefresh ? 1 : 0, clearing ? clearSize.width : 0);
</script>

{#snippet defaultCaption(text: string)}<span class="field-label">{text}</span>{/snippet}
{#snippet defaultClear(run: () => void, text: string)}
  <button type="button" class="field-button filter-clear" style="--filter-clear-width: {clearSize.width}rem" onclick={run}>{text}</button>
{/snippet}
{#snippet defaultToggle(target: string, on: boolean, text: string | undefined)}
  <label for={target} title={toggleLabel} class={ify("field-icon-button filter-toggle", on && "filter-applied")}>
    {#if text}{text}{:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M4 5h16M7 12h10M10 19h4" stroke-linecap="round" />
      </svg>
    {/if}
  </label>
{/snippet}
{#snippet defaultRefresh(run: () => void, busy: boolean, text: string | undefined)}
  <button type="button" class="field-icon-button filter-refresh" title="Refresh" aria-label="Refresh" aria-busy={busy} disabled={busy} onclick={run}>
    {#if text}{text}{:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    {/if}
  </button>
{/snippet}

<div class={ify("filter-row", className)} style={layout.row} data-fits={layout.fit === 0 || undefined} use:fits={layout.fit}>
  <input {id} type="checkbox" aria-label={toggleLabel} class="filter-switch" />
  {#if clearing && onclear}{#if typeof clear === "function"}{@render clear(onclear)}{:else}{@render defaultClear(onclear, clear ?? "Clear")}{/if}{/if}
  {#if typeof toggle === "function"}{@render toggle(id, applied)}{:else}{@render defaultToggle(id, applied, toggle)}{/if}
  {#if onrefresh}{#if typeof refresh === "function"}{@render refresh(onrefresh, refreshing)}{:else}{@render defaultRefresh(onrefresh, refreshing, refresh)}{/if}{/if}
  <div class={ify("filter-flow", flowClass)}>
    <label class={ify("field filter-slot", slotClass)} style={layout.slots[0]}>
      {@render (caption ?? defaultCaption)(label)}
      <input
        type="search"
        class={ify("field-box", searchClass)}
        value={query}
        {placeholder}
        oninput={(event) => oninput(event.currentTarget.value)}
      />
    </label>
    {#if controls}{@render controls((index) => layout.slots[index + 1])}{/if}
  </div>
</div>
