<script lang="ts" module>
  export type { Sort, SortDirection, SortMode } from "./_internal/sorts";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { sortPosition, type Sort, type SortDirection } from "./_internal/sorts";
  import { ify } from "./utils";

  export let key: string;
  export let label: string;
  export let sorts: readonly Sort[];
  export let ascTitle: string = "Ascending";
  export let descTitle: string = "Descending";
  export let ascLabel: string | undefined = undefined;
  export let descLabel: string | undefined = undefined;
  export let className: string | undefined = undefined;
  export let labelClass: string | undefined = undefined;
  export let arrowsClass: string | undefined = undefined;
  export let buttonClass: string | undefined = undefined;
  export let caption: Snippet<[string]> | undefined = undefined;
  export let arrow: Snippet<[SortDirection]> | undefined = undefined;
  export let onsort: ((key: string, direction: SortDirection) => void) | undefined = undefined;

  $: position = sortPosition(sorts, key);
</script>

{#snippet glyph(direction: SortDirection)}
  {#if arrow}{@render arrow(direction)}{:else}{direction === "asc" ? "↑" : "↓"}{/if}
{/snippet}

<div class={ify("sort-heading", className)}>
  <div class={ify("sort-heading-label", labelClass)}>
    {#if caption}{@render caption(label)}{:else}<span class="sort-heading-text">{label}</span>{/if}
    <span aria-hidden="true" class={ify("sort-arrows", arrowsClass)}>
      {#if position}
        <span class="sort-arrow" data-sort={position.direction}>{@render glyph(position.direction)}{sorts.length > 1 ? position.rank : ""}</span>
      {/if}
      {#if position?.direction !== "asc"}<span class="sort-hint" data-sort="asc">{@render glyph("asc")}</span>{/if}
      {#if position?.direction !== "desc"}<span class="sort-hint" data-sort="desc">{@render glyph("desc")}</span>{/if}
    </span>
  </div>
  <div class="sort-buttons">
    <button
      type="button"
      class={ify("sort-button", buttonClass)}
      data-sort="asc"
      title={ascTitle}
      aria-label={ascLabel ?? `Sort ${label} ascending`}
      aria-pressed={position?.direction === "asc"}
      onclick={() => onsort?.(key, "asc")}
    ></button>
    <button
      type="button"
      class={ify("sort-button", buttonClass)}
      data-sort="desc"
      title={descTitle}
      aria-label={descLabel ?? `Sort ${label} descending`}
      aria-pressed={position?.direction === "desc"}
      onclick={() => onsort?.(key, "desc")}
    ></button>
  </div>
</div>
