<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { formatValue, labelWidth } from "./_internal/slider";
  import { ify, twId } from "./utils";

  function findPercent(min: number, curr: number, max: number) {
    return (curr - min) / (max - min);
  }

  export let formId: string | undefined = undefined;
  export let label: string | undefined = undefined;
  export let max: number;
  export let min: number = 0;
  export let step: number | undefined = undefined;
  export let defaultValue: number | undefined = undefined;
  export let className: string | undefined = undefined;
  export let trackClass: string | undefined = undefined;
  export let thumbClass: string | undefined = undefined;
  export let backtrackClass: string | undefined = undefined;
  export let labelPos: "l" | "i" | "r" | undefined = undefined;
  export let labelClass: string | undefined = undefined;
  export let labelParse: ((n: number) => string) | undefined = undefined;

  const dispatch = createEventDispatcher<{
    input: Event & { currentTarget: HTMLInputElement };
    change: Event & { currentTarget: HTMLInputElement };
  }>();

  const id = twId("slider", label, formId);

  export let ref: HTMLInputElement | undefined = undefined;

  let thumb_pos = defaultValue ?? min;
  $: p = (findPercent(min, thumb_pos, max) * 100) + "%";
  $: shown = formatValue(thumb_pos, step ?? 1, labelParse);
</script>

{#snippet core()}
  <div class={ify("layers items-center w-full", (labelPos == undefined) || labelPos != "i" || className)}>
    <div class="layer slider-backtrack w-full"></div>
    <div style:width={p} class={ify("layer slider-track pointer-events-none", trackClass)}></div>
    <div style:margin-left={p} style:transform={"translateX(-" + p + ")"}
      class={ify("layer slider-thumb flex box pointer-events-none", thumbClass)}>
      {#if labelPos == "i"}<span class={ify("flex box slider-label-in", labelClass)}>{shown}</span>{/if}
    </div>
    <input {id} type="range" bind:this={ref} bind:value={thumb_pos} {max} {min} {step}
      class={ify("layer w-full appearance-none cursor-pointer opacity-0", backtrackClass)} on:change={(e) => dispatch("change", e)}
      on:input={(e) => { thumb_pos = Number(e.currentTarget.value); dispatch("input", e); }} />
  </div>
{/snippet}

{#if labelPos && labelPos != "i"}
  <div class={ify("flex", labelPos == "r" && "flex-row-reverse", className)}>
    <span style:width={labelWidth(min, max, step ?? 1, labelParse)} class={ify("slider-label-out", labelPos == "r" ? "text-right" : "text-left", labelClass)}>{shown}</span>
    {@render core()}
  </div>
{:else}
  {@render core()}
{/if}
