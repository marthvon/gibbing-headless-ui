<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { cacheRect, disable, ify, twId } from "./utils";

  function findPercent(min: number, curr: number, max: number) {
    return (curr - min) / (max - min);
  }
  function findValue(x: number, rect: DOMRect, range: number) {
    return ((x - rect.left) / rect.width) * range;
  }

  export let formId: string | undefined = undefined;
  export let label: string | undefined = undefined;
  export let max: number;
  export let min: number = 0;
  export let step: number | undefined = undefined;
  export let className: string | undefined = undefined;
  export let trackClass: string | undefined = undefined;
  export let thumbClass: string | undefined = undefined;
  export let backtrackClass: string | undefined = undefined;
  export let labelPos: "i" | "o" | undefined = undefined;
  export let labelClass: string | undefined = undefined;
  export let labelParse: ((n: number) => string) | undefined = undefined;

  const dispatch = createEventDispatcher<{ input: Event; change: string | undefined }>();
  const id = twId("dual-slider", label, formId);

  let internalRefEl: HTMLInputElement;
  export { internalRefEl as ref };

  let sliderEl: HTMLButtonElement;
  let sliderRect: DOMRect | undefined;
  let touchIds: [number | null, number | null] = [null, null];
  let left_thumb_pos = min;
  let right_thumb_pos = max;

  function createThumbHandlers(self: number, setter: (value: number) => void) {
    function handleMouseMove(e: MouseEvent | Touch) {
      if(sliderRect == undefined) return;
      let value = findValue(e.clientX, sliderRect, max - min);
      const valSplit = internalRefEl?.value ? internalRefEl.value.split(",") : [String(min), String(max)];
      const limit = Number(valSplit[(self + 1) % 2]);
      if(step)
        value = Math.round((value - min) / step) * step;
      if(self) {
        if(value <= limit) return;
        else if(value > max) value = max;
      } else {
        if(value >= limit) return;
        else if(value < min) value = min;
      }
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
      if(sliderRect == undefined) return;
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
    function handleTouchStart(e: TouchEvent & { currentTarget: HTMLElement }) {
      e.preventDefault();
      if(sliderRect == undefined) return;
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

  function inferTrackMouseDown(e: MouseEvent) {
    e.preventDefault();
    if(!sliderRect) return;
    if(findValue(e.clientX, sliderRect, max - min) < ((max - min) / 2))
      (handleMinMouseDown(e) as undefined) || handleMinMouseMove(e);
    else
      (handleMaxMouseDown(e) as undefined) || handleMaxMouseMove(e);
  }

  function inferTrackTouchEnd(e: TouchEvent) {
    e.preventDefault();
    if(!sliderRect || e.targetTouches.length === 0) return;
    if(findValue(e.targetTouches[0].clientX, sliderRect, max - min) < ((max - min) / 2))
      (handleMinTouchStart(e) as undefined) || handleMinMouseMove(e.targetTouches[0]);
    else
      (handleMaxTouchStart(e) as undefined) || handleMaxMouseMove(e.targetTouches[0]);
  }

  onMount(() => cacheRect(sliderEl, (rect) => sliderRect = rect));
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
      {#if labelPos == "i"}<span class={ify("flex box slider-label-in", labelClass)}>{labelParse ? labelParse(left_thumb_pos) : left_thumb_pos}</span>{/if}
    </button>
    <button type="button" role="slider" aria-label={label ? label + " maximum" : "Maximum value"} aria-valuemin={left_thumb_pos} aria-valuemax={max} aria-valuenow={right_thumb_pos}
      draggable={false} on:dragstart={disable} on:mousedown={handleMaxMouseDown} on:touchstart={handleMaxTouchStart} on:click={disable}
      style:margin-left={rp + "%"} style:transform={"translateX(-" + rp + "%)"} class={ify("layer slider-thumb flex box select-none drag-none", thumbClass)}>
      {#if labelPos == "i"}<span class={ify("flex box slider-label-in", labelClass)}>{labelParse ? labelParse(right_thumb_pos) : right_thumb_pos}</span>{/if}
    </button>
  </div>
{/snippet}

{#if labelPos && labelPos == "o"}
  <div class={ify("flex", className)}>
    <span class={ify("p-2", labelClass)}>{labelParse ? labelParse(left_thumb_pos) : left_thumb_pos}</span>
    {@render core()}
    <span class={ify("p-2", labelClass)}>{labelParse ? labelParse(right_thumb_pos) : right_thumb_pos}</span>
  </div>
{:else}
  {@render core()}
{/if}
