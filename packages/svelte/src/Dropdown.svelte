<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import { ify, twId } from "./utils";
  import { type DropdownPreset, Interact } from "./presets.client";

  let {
    className, modalClass, innerModalClass, formId, label, preset, interact, clickOut, menu, children
  }: {
    className?: string;
    modalClass?: string;
    innerModalClass?: string;
    formId?: string;
    label?: string;
    preset: DropdownPreset;
    interact: Interact;
    clickOut?: boolean;
    menu?: Snippet;
    children?: Snippet;
  } = $props();

  const id = untrack(() => twId("dropdown-modal", label, formId));
  const styles = $derived(preset.split(" "));
</script>

<div class={ify("flex group", styles[0], className)}>
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
    (interact & Interact.HOVER) && styles[2]
  )}>
    <div class={ify("dropdown-outer-modal cursor-pointer", modalClass)}><div class={ify("dropdown-modal", innerModalClass)}>
      {#if menu}{@render menu()}{/if}
    </div></div>
  </label>
</div>
