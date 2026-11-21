<script lang="ts">
  import type { Snippet } from "svelte";
  import { overflow } from "./_internal/field_guide";
  import { ify, twId, type Content } from "./utils";

  export let text: string;
  export let id: string | undefined = undefined;
  export let className: string | undefined = undefined;
  export let limit: number = 3;
  export let body: Snippet<[string]> | undefined = undefined;
  export let expand: Content<[string]> | undefined = undefined;
  export let collapse: Content<[string]> | undefined = undefined;

  const toggleId = twId("field-guide");
</script>

{#snippet defaultBody(value: string)}<p class="field-guide-text">{value}</p>{/snippet}
{#snippet defaultExpand(target: string, text: string)}<label for={target} class="field-guide-toggle field-guide-expand">{text}</label>{/snippet}
{#snippet defaultCollapse(target: string, text: string)}<label for={target} class="field-guide-toggle field-guide-collapse">{text}</label>{/snippet}

<div {id} class={ify("field-guide", className)} style:--field-guide-limit="{limit}rem">
  <input id={toggleId} type="checkbox" class="field-guide-switch" />
  <div class="field-guide-body">
    <div use:overflow={limit} class="field-guide-content">
      {@render (body ?? defaultBody)(text)}
    </div>
  </div>
  {#if typeof expand === "function"}{@render expand(toggleId)}{:else}{@render defaultExpand(toggleId, expand ?? "See more")}{/if}
  {#if typeof collapse === "function"}{@render collapse(toggleId)}{:else}{@render defaultCollapse(toggleId, collapse ?? "See less")}{/if}
</div>
