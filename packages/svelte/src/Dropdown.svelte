<script lang="ts">
  import type { Snippet } from "svelte";
  import { ify, twId, zLayer } from "./utils";
  import { type DropdownPreset, Interact } from "./presets.client";

  export let zIndex: number | undefined = undefined;
  export let className: string | undefined = undefined;
  export let modalClass: string | undefined = undefined;
  export let innerModalClass: string | undefined = undefined;
  export let wrapperClass: string | undefined = undefined;
  export let formId: string | undefined = undefined;
  export let label: string | undefined = undefined;
  export let preset: DropdownPreset;
  export let interact: Interact;
  export let clickOut: boolean | undefined = undefined;
  export let menu: Snippet | undefined = undefined;
  export let children: Snippet | undefined = undefined;

  const id = twId("dropdown-modal", label, formId);
  $: styles = preset.split(" ");
</script>

<div class={ify("flex group", styles[0], className)} style={zLayer(zIndex)}>
  <input type="checkbox" {id} class="peer ghost-node" />
  <label for={id} class="group layer cursor-pointer w-full">{#if children}{@render children()}{/if}</label>
  {#if (interact & Interact.CLICK) && clickOut}
    <label for={id} class="modal-background hidden-modal transition-all duration-300 peer-checked:appear-modal">
      <div class="h-full w-screen"></div>
    </label>
  {/if}
  <label for={id} class={ify(
    "dropdown-wrapper semi-absolute",
    (interact & Interact.CLICK) && styles[1],
    (interact & Interact.HOVER) && styles[2],
    wrapperClass
  )}>
    <div class={ify("dropdown-outer-modal cursor-pointer", modalClass)}><div class={ify("dropdown-modal", innerModalClass)}>
      {#if menu}{@render menu()}{/if}
    </div></div>
  </label>
</div>
