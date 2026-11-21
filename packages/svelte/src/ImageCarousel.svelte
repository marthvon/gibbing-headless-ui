<script lang="ts" context="module">
  import { LoaderPreset } from "./presets.client";

  export type CarouselLoader = { preset?: LoaderPreset; fill_color: string; empty_color: string; onBottom?: boolean };
</script>

<script lang="ts">
  import { onDestroy, onMount, type Snippet } from "svelte";
  import { ify } from "./utils";
  import { restartLoader } from "./_internal/loader";

  function getDegrees(index: number, curr_idx: number, length: number, inactive_opacity: number = 0.5) {
    if(length < 3)
      return index == curr_idx
        ? "--tw-degrees-left:0deg;--tw-degrees-right:0deg;--tw-opacity:1"
        : "--tw-degrees-left:90deg;--tw-degrees-right:-90deg;--tw-opacity:" + inactive_opacity;
    switch(index - curr_idx) {
      case ((c) => c === 0 || c === 1 ? 2 : c)(length - 1):
      case -1:
        return "--tw-degrees-left:-60deg;--tw-degrees-right:60deg;--tw-opacity:" + inactive_opacity;
      case 0:
        return "--tw-degrees-left:0deg;--tw-degrees-right:-0deg;--tw-opacity:1";
      case (-length + 1):
      case 1:
        return "--tw-degrees-left:60deg;--tw-degrees-right:-60deg;--tw-opacity:" + inactive_opacity;
      default:
        return "--tw-degrees-left:180deg;--tw-degrees-right:-180deg;--tw-opacity:0";
    }
  }

  export let images: [string, Snippet][];
  export let timeout: number | undefined = undefined;
  export let className: string | undefined = undefined;
  export let bg_img_opacity = 0.5;
  export let cursor_color: string | undefined = undefined;
  export let indicators: { indicated_color: string; dormant_color: string } | undefined = undefined;
  export let loader: CarouselLoader | undefined = undefined;
  export let children: Snippet | undefined = undefined;

  let carousel_index = 0;
  let paused = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  let touchX: number | null = null;
  let clockEl: HTMLSpanElement | undefined;
  let mounted = false;

  $: [trackClass, fillClass] = (loader?.preset ?? LoaderPreset.LINEAR).split(" | ");

  $: if (mounted) schedule(timeout, paused, clockEl);

  onMount(() => (mounted = true));
  onDestroy(stop);

  function stop() {
    if (timer !== null) clearInterval(timer);
    timer = null;
  }

  function advance() {
    carousel_index = (carousel_index + 1) % images.length;
    restartLoader(clockEl, true);
  }

  function schedule(seconds = timeout, halted = paused, clock = clockEl) {
    stop();
    const running = seconds !== undefined && !halted;
    if (running) timer = setInterval(advance, seconds * 1000);
    restartLoader(clock, running);
  }

  function carousel_next() {
    carousel_index = (carousel_index + 1) % images.length;
    schedule();
  }

  function carousel_prev() {
    carousel_index = (carousel_index ? carousel_index : images.length) - 1;
    schedule();
  }

  function set_carousel(index: number) {
    carousel_index = index;
    schedule();
  }
</script>

{#snippet clock(place: string, bar: CarouselLoader)}
  <button type="button" aria-label={paused ? "Resume carousel" : "Pause carousel"} aria-pressed={paused} onclick={() => (paused = !paused)} class={ify(place, "cursor-pointer z-[var(--z-raised,1)]")}>
    <span bind:this={clockEl} class={ify(trackClass, bar.empty_color)} style:--loader-duration={`${timeout ?? 5}s`}>
      <span class={ify(fillClass, bar.fill_color)}></span>
    </span>
  </button>
{/snippet}

<section class={ify("image_carousel with-navbar with-sides mx-auto", className)}>
  {#if children || (loader && loader["onBottom"] !== true)}
    <div class="flex top-nav pb-3"><div class="flex mx-auto w-full max-w-[inherit]">
      {#if children}{@render children()}{/if}
      {#if loader && loader["onBottom"] !== true}
        {@render clock("ml-auto mr-3 my-1", loader)}
      {/if}
    </div></div>
  {/if}
  {#if cursor_color}
    <button type="button" aria-label="Previous slide" onclick={carousel_prev} class="group left-nav -carousel-arrows">
      <div class="semi-absolute m-auto"><div class={"carousel-arrows " + cursor_color}>&lt;</div></div>
    </button>
  {/if}
  <ul class="main-content layers w-full h-full preserve-3d overflow-visible mx-auto"
    ontouchend={(event) => {
      if(touchX === null || event.changedTouches.length === 0) return;
      if((event.changedTouches[0].clientX - touchX) < 0) carousel_next();
      else if((event.changedTouches[0].clientX - touchX) > 0) carousel_prev();
      touchX = null;
    }}
    ontouchstart={(event) => { if(event.targetTouches.length !== 0) touchX = event.targetTouches[0].clientX; }}
  >
    {#each images as [id, image], index (id)}
      <li class="carousel layer flex box w-full h-full" style={getDegrees(index, carousel_index, images.length, bg_img_opacity)}>{@render image()}</li>
    {/each}
  </ul>
  {#if cursor_color}
    <button type="button" aria-label="Next slide" onclick={carousel_next} class="group right-nav -carousel-arrows">
      <div class="semi-absolute m-auto"><div class={"carousel-arrows " + cursor_color}>&gt;</div></div>
    </button>
  {/if}
  {#if indicators || (loader && loader["onBottom"] === true)}
    <div class="layers bottom-nav w-full pt-3">
      {#if indicators}
        <div class="layer flex box w-full">
          {#each images as [id], index (id)}
            <button type="button" aria-label={"Go to slide " + (index + 1)} disabled={index === carousel_index} onclick={() => set_carousel(index)}
              class={"mb-3 mx-1 rounded-full duration-500 transition-all cursor-pointer "
                + (index === carousel_index ? ify("h-4 w-4", indicators.indicated_color) : ify("h-3 w-3", indicators.dormant_color))}></button>
          {/each}
        </div>
      {/if}
      {#if loader && loader["onBottom"] === true}
        {@render clock("layer ml-auto mr-3 my-1", loader)}
      {/if}
    </div>
  {/if}
</section>
