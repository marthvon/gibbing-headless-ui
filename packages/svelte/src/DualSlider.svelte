<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { formatValue, labelWidth, snapValue } from "./_internal/slider";
  import { disable, ify, twId } from "./utils";

  function findPercent(min: number, curr: number, max: number) {
    return (curr - min) / (max - min);
  }
  function findFraction(x: number, rect: DOMRect) {
    return (x - rect.left) / rect.width;
  }

  export let formId: string | undefined = undefined;
  export let label: string | undefined = undefined;
  export let max: number;
  export let min: number = 0;
  export let step: number = 1;
  export let className: string | undefined = undefined;
  export let trackClass: string | undefined = undefined;
  export let thumbClass: string | undefined = undefined;
  export let backtrackClass: string | undefined = undefined;
  export let labelPos: "i" | "o" | undefined = undefined;
  export let labelClass: string | undefined = undefined;
  export let labelParse: ((n: number) => string) | undefined = undefined;

  const dispatch = createEventDispatcher<{ input: Event; change: string | undefined }>();
  const id = twId("dual-slider", label, formId);

  let internalRefEl: HTMLInputElement | undefined = undefined;
  export { internalRefEl as ref };

  let sliderEl: HTMLButtonElement;
  let sliderRect: DOMRect | undefined;
  let touchIds: [number | null, number | null] = [null, null];
  let left_thumb_pos = min;
  let right_thumb_pos = max;

  function measure() {
    if(!sliderEl) return false;
    sliderRect = sliderEl.getBoundingClientRect();
    return true;
  }

  function createThumbHandlers(self: number, setter: (value: number) => void) {
    function handleMouseMove(e: MouseEvent | Touch) {
      if(sliderRect == undefined) return;
      const value = snapValue(findFraction(e.clientX, sliderRect), min, max, step);
      const valSplit = internalRefEl?.value ? internalRefEl.value.split(",") : [String(min), String(max)];
      const limit = Number(valSplit[(self + 1) % 2]);
      if(self ? value <= limit : value >= limit) return;
      valSplit[self] = String(value);
      internalRefEl && (internalRefEl.value = valSplit.join(","));
      setter(value);
      e instanceof MouseEvent && dispatch("input", e);
    }
    function handleMouseUp() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("visibilitychange", handleMouseUp);
      window.removeEventListener("blur", handleMouseUp);
      dispatch("change", internalRefEl?.value);
    }
    function handleMouseDown(e: MouseEvent) {
      e.preventDefault();
      if(!measure()) return;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("visibilitychange", handleMouseUp);
      window.addEventListener("blur", handleMouseUp);
    }
    function handleTouchMove(e: TouchEvent) {
      for(const touch of Array.from(e.touches))
        if(touch.identifier === touchIds[self]) {
          handleMouseMove(touch);
          dispatch("input", e);
          break;
        }
    }
    function handleTouchEnd() {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("visibilitychange", handleTouchEnd);
      window.removeEventListener("blur", handleTouchEnd);
      touchIds[self] = null;
      dispatch("change", internalRefEl?.value);
    }
    function handleTouchStart(e: TouchEvent) {
      e.preventDefault();
      if(!measure()) return;
      touchIds[self] = e.targetTouches[0].identifier;
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
      document.addEventListener("visibilitychange", handleTouchEnd);
      window.addEventListener("blur", handleTouchEnd);
    }
    return [handleMouseDown, handleTouchStart, handleMouseMove] as const;
  }

  const [handleMinMouseDown, handleMinTouchStart, handleMinMouseMove] = createThumbHandlers(0, (v) => left_thumb_pos = v);
  const [handleMaxMouseDown, handleMaxTouchStart, handleMaxMouseMove] = createThumbHandlers(1, (v) => right_thumb_pos = v);

  $: lp = findPercent(min, left_thumb_pos, max) * 100;
  $: rp = findPercent(min, right_thumb_pos, max) * 100;
  $: width = labelWidth(min, max, step, labelParse);

  function inferTrackMouseDown(e: MouseEvent) {
    e.preventDefault();
    if(!measure()) return;
    if(findFraction(e.clientX, sliderRect!) < 0.5)
      (handleMinMouseDown(e) as undefined) || handleMinMouseMove(e);
    else
      (handleMaxMouseDown(e) as undefined) || handleMaxMouseMove(e);
  }

  function inferTrackTouchEnd(e: TouchEvent) {
    e.preventDefault();
    if(e.targetTouches.length === 0 || !measure()) return;
    if(findFraction(e.targetTouches[0].clientX, sliderRect!) < 0.5)
      (handleMinTouchStart(e) as undefined) || handleMinMouseMove(e.targetTouches[0]);
    else
      (handleMaxTouchStart(e) as undefined) || handleMaxMouseMove(e.targetTouches[0]);
  }

</script>

{#snippet core()}
  <div role="group" aria-label={label ?? "Dual range slider"} class={ify("layers items-center w-full select-none drag-none", labelPos || labelPos == "o" || className)}>
    <input {id} bind:this={internalRefEl} type="hidden" />
    <button type="button" aria-label="Range track" draggable={false} on:dragstart={disable} on:mousedown={inferTrackMouseDown} on:touchend={inferTrackTouchEnd}
      on:click={disable} bind:this={sliderEl} class={ify("layer slider-backtrack w-full select-none drag-none", backtrackClass)}></button>
    <div aria-hidden="true" draggable={false} style:margin-left={lp + "%"} style:width={(rp - lp) + "%"}
      class={ify("layer slider-track select-none drag-none pointer-events-none", trackClass)}></div>
    <button type="button" role="slider" aria-label={label ? label + " minimum" : "Minimum value"} aria-valuemin={min} aria-valuemax={right_thumb_pos} aria-valuenow={left_thumb_pos}
      draggable={false} on:dragstart={disable} on:mousedown={handleMinMouseDown} on:touchstart={handleMinTouchStart} on:click={disable}
      style:margin-left={lp + "%"} style:transform={"translateX(-" + lp + "%)"} class={ify("layer slider-thumb flex box select-none drag-none", thumbClass)}>
      {#if labelPos == "i"}<span class={ify("flex box slider-label-in", labelClass)}>{formatValue(left_thumb_pos, step, labelParse)}</span>{/if}
    </button>
    <button type="button" role="slider" aria-label={label ? label + " maximum" : "Maximum value"} aria-valuemin={left_thumb_pos} aria-valuemax={max} aria-valuenow={right_thumb_pos}
      draggable={false} on:dragstart={disable} on:mousedown={handleMaxMouseDown} on:touchstart={handleMaxTouchStart} on:click={disable}
      style:margin-left={rp + "%"} style:transform={"translateX(-" + rp + "%)"} class={ify("layer slider-thumb flex box select-none drag-none", thumbClass)}>
      {#if labelPos == "i"}<span class={ify("flex box slider-label-in", labelClass)}>{formatValue(right_thumb_pos, step, labelParse)}</span>{/if}
    </button>
  </div>
{/snippet}

{#if labelPos && labelPos == "o"}
  <div class={ify("flex", className)}>
    <span style:width={width} class={ify("slider-label-out text-left", labelClass)}>{formatValue(left_thumb_pos, step, labelParse)}</span>
    {@render core()}
    <span style:width={width} class={ify("slider-label-out text-right", labelClass)}>{formatValue(right_thumb_pos, step, labelParse)}</span>
  </div>
{:else}
  {@render core()}
{/if}
