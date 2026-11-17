<script lang="ts" module>
  export type { FilterSize } from "./_internal/filters";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { CLEAR_SIZE, FILTER_ASIDE, FILTER_GAP, SEARCH_SIZE, filterRow, type FilterSize } from "./_internal/filters";
  import { ify } from "./utils";

  export let id: string;
  export let query: string;
  export let placeholder: string = "";
  export let label: string = "Search";
  export let sizes: readonly FilterSize[] = [];
  export let searchSize: FilterSize = SEARCH_SIZE;
  export let clearSize: FilterSize = CLEAR_SIZE;
  export let applied: boolean = false;
  export let clearable: boolean = false;
  export let refreshing: boolean = false;
  export let clearLabel: string = "Clear";
  export let toggleLabel: string = "More filters";
  export let refreshLabel: string = "Refresh";
  export let className: string | undefined = undefined;
  export let flowClass: string | undefined = undefined;
  export let slotClass: string | undefined = undefined;
  export let labelClass: string | undefined = undefined;
  export let searchClass: string | undefined = undefined;
  export let clearClass: string | undefined = undefined;
  export let toggleClass: string | undefined = undefined;
  export let refreshClass: string | undefined = undefined;
  export let toggleIcon: Snippet | undefined = undefined;
  export let refreshIcon: Snippet | undefined = undefined;
  export let controls: Snippet<[(index: number) => string]> | undefined = undefined;
  export let oninput: (text: string) => void;
  export let onclear: (() => void) | undefined = undefined;
  export let onrefresh: (() => void) | undefined = undefined;

  $: clearing = clearable && onclear !== undefined;
  $: tools = onrefresh ? 2 : 1;
  $: aside = tools * FILTER_ASIDE + (clearing ? FILTER_GAP + clearSize.width : 0);
  $: layout = filterRow([searchSize, ...sizes], aside, tools);
</script>

<div class={ify("filter-row", className)} style={layout.row}>
  <input {id} type="checkbox" aria-label={toggleLabel} class="filter-switch" />
  {#if clearing}
    <button type="button" class={ify("field-button filter-clear", clearClass)} style="--filter-clear-width: {clearSize.width}rem" onclick={onclear}>
      {clearLabel}
    </button>
  {/if}
  <label for={id} title={toggleLabel} class={ify("field-icon-button filter-toggle", applied && "filter-applied", toggleClass)}>
    {#if toggleIcon}
      {@render toggleIcon()}
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M4 5h16M7 12h10M10 19h4" stroke-linecap="round" />
      </svg>
    {/if}
  </label>
  {#if onrefresh}
    <button
      type="button"
      class={ify("field-icon-button filter-refresh", refreshClass)}
      title={refreshLabel}
      aria-label={refreshLabel}
      aria-busy={refreshing}
      disabled={refreshing}
      onclick={onrefresh}
    >
      {#if refreshIcon}
        {@render refreshIcon()}
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      {/if}
    </button>
  {/if}
  <div class={ify("filter-flow", flowClass)}>
    <label class={ify("field filter-slot", slotClass)} style={layout.slots[0]}>
      <span class={ify("field-label", labelClass)}>{label}</span>
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
