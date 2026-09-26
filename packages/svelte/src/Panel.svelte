<script lang="ts">
  import { onMount } from "svelte";
  import { cacheRect, disable, ify } from "./utils";
  import type { PanelPreset } from "./presets.client";

  function scanPanelResize(value: number, ratio: (number | ("<" | "<=") | "x")[]) {
    const evalRatioComp = {
      "<": (a: number, b: number) => a < b,
      "<=": (a: number, b: number) => a <= b,
    } as const;
    let left = 0; let right = ratio.length - 1;
    while(left <= right) {
      const mid = (left + right) / 2;
      switch( // @ts-ignore
        evalRatioComp[ratio[mid + 1] as "<" | "<="](value, ratio[mid + 2] as number) // @ts-ignore val < x
        + (evalRatioComp[ratio[mid - 1] as "<" | "<="](ratio[mid - 2] as number, value) << 1) // x < val
      ) {
        case 1: right = mid - 2; break;
        case 2: left = mid + 2; break;
        case 3: return ratio[mid] as number | "x";
      }
    }
    return left == 0 ? "-" : "+";
  }

  function panelPercentSize(side: "t" | "l" | "r" | "b", e: MouseEvent | Touch, prect: DOMRect) {
    return Math.min(Math.max((() => {
      switch(side) {
        case "l": return (e.clientX - prect.left) / prect.width;
        case "r": return (prect.right - e.clientX) / prect.width;
        case "t": return (e.clientY - prect.top) / prect.height;
        case "b": return (prect.bottom - e.clientY) / prect.height;
      }
    })(), 0.0), 1.0);
  }

  function applyPanelLockSize(
    container: HTMLDivElement, draggable: HTMLElement,
    side: "t" | "l" | "r" | "b", ratio: (number | ("<" | "<=") | "x")[]
  ) {
    const resize_lock = scanPanelResize(
      parseFloat(container.style[(side == "l" || side == "r") ? "width" : "height"]
        .match(/max\((.*?)%/)![1]
      ) / 100,
      ratio
    );
    if(resize_lock != "x") {
      const new_style = "max(" + (resize_lock as number * 100) + "%, "
        + draggable[(side == "l" || side == "r") ? "offsetWidth" : "offsetHeight"] + "px)";
      (side == "l" || side == "r") ? (container.style.width = new_style)
        : (container.style.height = new_style);
    }
  }

  export let preset: PanelPreset;
  export let className: string | undefined = undefined;
  export let modalClass: string | undefined = undefined;
  export let dragClass: string | undefined = undefined;
  export let default_ratio: number | string | undefined = undefined;
  export let ratio: (number | ("<" | "<=") | "x")[] = [0, "<=", "x", "<=", 1.0];

  const styles = preset.split(" ");
  const side = styles.pop() as "t" | "l" | "r" | "b";

  let parentEl: HTMLDivElement;
  let containerEl: HTMLDivElement;
  let draggableEl: HTMLButtonElement;
  let prect: DOMRect | undefined;
  let touchRef: number | null = null;

  function handleMouseMove(e: MouseEvent | Touch) { if(prect && containerEl && parentEl && draggableEl) {
    const new_size = "max(" + (panelPercentSize(side, e, prect) * 100) + "%, "
      + draggableEl[(side == "l" || side == "r") ? "offsetWidth" : "offsetHeight"] + "px)";
    (side == "l" || side == "r") ? (containerEl.style.width = new_size)
      : (containerEl.style.height = new_size);
  }}

  function handleMouseUp() {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("visibilitychange", handleMouseUp);
    window.removeEventListener("blur", handleMouseUp);
    applyPanelLockSize(containerEl, draggableEl, side, ratio);
  }

  function handleMouseDown(e: MouseEvent) {
    e.preventDefault();
    if(prect == undefined) return;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("visibilitychange", handleMouseUp);
    window.addEventListener("blur", handleMouseUp);
  }

  function handleTouchMove(e: TouchEvent) {
    for(const touch of Array.from(e.touches))
      if(touch.identifier === touchRef) {
        handleMouseMove(touch);
        break;
      }
  }

  function handleTouchEnd() {
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
    document.removeEventListener("visibilitychange", handleTouchEnd);
    window.removeEventListener("blur", handleTouchEnd);
    touchRef = null;
    applyPanelLockSize(containerEl, draggableEl, side, ratio);
  }

  const handleTouchStart = (e: TouchEvent & { currentTarget: HTMLButtonElement }) => {
    e.preventDefault();
    if(prect == undefined) return;
    touchRef = e.targetTouches[0].identifier;
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("visibilitychange", handleTouchEnd);
    window.addEventListener("blur", handleTouchEnd);
  };

  onMount(() => cacheRect(parentEl, (rect) => prect = rect));

  $: if(containerEl) {
    containerEl.style.width = "";
    containerEl.style.height = "";
  }

  $: if(containerEl && parentEl && draggableEl) {
    const new_size = default_ratio ? (typeof default_ratio == "string" ?
      default_ratio : (ratio[2 + (default_ratio * 4)] + "%")
    ) : "50%";
    (side == "l" || side == "r") ? (containerEl.style.width = new_size == "x" ? "50%" : new_size)
      : (containerEl.style.height = new_size == "x" ? "50%" : new_size);
  }
</script>

<div bind:this={parentEl} class={ify("layers w-full h-full", className)}>
  <div class="layer w-full h-full"><slot /></div>
  <div draggable={false} bind:this={containerEl} class={ify("flex layer overflow-hidden transition-all border-slate-200", styles[0], modalClass)}>
    <article draggable={false} class={ify("flex flex-col shrink w-full h-full select-none drag-none", side == "b" ? "pt-4" : (side == "t" && "pb-4"))}><slot name="modal" /></article>
    <button type="button" aria-label="Resize panel" bind:this={draggableEl} draggable={false}
      on:dragstart={disable} on:mousedown={handleMouseDown} on:touchstart={handleTouchStart} on:click={(e) => e.preventDefault()}
      class={ify("flex sticky gap-1 p-1 bg-slate-100 border-slate-400", styles[1], dragClass)}>
      {#if side == "l" || side == "r"}
        <svg class={ify("my-auto h-1/4", side == "r" && "-scale-x-100")} height="100%" width="12" preserveAspectRatio="none" viewBox="0 0 16 80">
          <line x1="4" y1="25" x2="4" y2="55" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
          <line x1="12" y1="10" x2="12" y2="70" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
        </svg>
      {:else}
        <svg class={ify("mx-auto w-1/8", side == "b" && "-scale-y-100")} height="14" width="100%" preserveAspectRatio="none" viewBox="0 0 320 20">
          <line y1="5" x1="100" y2="5" x2="220" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
          <line y1="15" x1="40" y2="15" x2="280" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
        </svg>
      {/if}
    </button>
  </div>
</div>
