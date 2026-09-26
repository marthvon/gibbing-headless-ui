<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { ify, twId } from "./utils";

  export let formId: string | undefined = undefined;
  export let label: string | undefined = undefined;
  export let className: string | undefined = undefined;
  export let trackClass: string | undefined = undefined;
  export let thumbClass: string | undefined = undefined;
  export let ref: HTMLInputElement;

  const dispatch = createEventDispatcher<{ change: Event & { currentTarget: HTMLInputElement } }>();
  const id = twId("toggle", label, formId);
</script>

<div class={ify("layers toggle-base", className)}>
  <input bind:this={ref} {id} type="checkbox" class="peer ghost-node"
    on:change={(e) => (e.currentTarget.value = e.currentTarget.checked.toString()) && dispatch("change", e)} />
  <div class={ify("layer toggle-track", trackClass)}></div>
  <div class="layer toggle-thumb-wrapper"><div class={ify("toggle-thumb", thumbClass)}><slot /></div></div>
  <label for={id} class="layer cursor-pointer"></label>
</div>
