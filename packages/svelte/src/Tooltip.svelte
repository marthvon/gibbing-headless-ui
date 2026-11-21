<script lang="ts" context="module">
  export type TooltipTrigger = { "aria-describedby": string };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { ify, twId, zLayer, type Content } from "./utils";
  import { DropdownPreset } from "./presets.client";

  export let content: Content;
  export let preset: DropdownPreset = DropdownPreset.TOP;
  export let open = false;
  export let interactive = false;
  export let zIndex: number | undefined = undefined;
  export let className: string | undefined = undefined;
  export let wrapperClass: string | undefined = undefined;
  export let modalClass: string | undefined = undefined;
  export let innerModalClass: string | undefined = undefined;
  export let children: Snippet<[TooltipTrigger]> | undefined = undefined;

  const id = twId("tooltip");
  $: side = "tooltip-" + preset.split(" ")[2].replace("dropdown-hover-", "");
</script>

<span class={ify("tooltip", side, className)} style={zLayer(zIndex)} data-open={open || undefined} data-interactive={interactive || undefined}>
  {#if children}{@render children({ "aria-describedby": id })}{/if}
  <span {id} role="tooltip" class={ify("dropdown-wrapper tooltip-wrapper", wrapperClass)}>
    <span class={ify("dropdown-outer-modal tooltip-outer", modalClass)}>
      <span class={ify("dropdown-modal tooltip-modal", innerModalClass)}>
        {#if typeof content === "function"}{@render content()}{:else}{content}{/if}
      </span>
    </span>
  </span>
</span>
