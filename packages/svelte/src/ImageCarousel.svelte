<script lang="ts">
  import { type Snippet } from "svelte";
  import { ify } from "./utils";

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

  let {
    images, timeout = undefined, className = undefined, cursor_color = undefined,
    indicators = undefined, loader = undefined, children
  }: {
    images: [string, Snippet][];
    timeout?: number;
    className?: string;
    cursor_color?: string;
    indicators?: { indicated_color: string; dormant_color: string };
    loader?: { type: "linear-loader"; fill_color: string; empty_color: string; duration: string; onBottom?: boolean };
    children?: Snippet;
  } = $props();

  let carousel_index = $state(0);
  let intervalHandler: ReturnType<typeof setInterval> | null = null;
  let touchX: number | null = null;
  let clockEl = $state<HTMLDivElement | undefined>(undefined);

  function signalIntervalHandler() {
    if(intervalHandler == null) return;
    clearInterval(intervalHandler);
    intervalHandler = setInterval(carousel_next, timeout! * 1000);
    if(clockEl && loader) {
      clockEl.classList.remove(loader.type);
      void clockEl.offsetHeight;
      setTimeout(() => clockEl?.classList.add(loader.type), 10);
    }
  }

  function carousel_next() {
    carousel_index = (carousel_index + 1) % images.length;
    signalIntervalHandler();
  }

  function carousel_prev() {
    carousel_index = (carousel_index ? carousel_index : images.length) - 1;
    signalIntervalHandler();
  }

  function pauseCarousel() {
    if(!loader) return;
    if(intervalHandler) {
      clearInterval(intervalHandler);
      intervalHandler = null;
      clockEl?.classList.remove(loader.type);
    } else {
      clockEl?.classList.add(loader.type);
      intervalHandler = setInterval(carousel_next, timeout! * 1000);
    }
  }

  function set_carousel(index: number) {
    carousel_index = index;
    signalIntervalHandler();
  }

  $effect(() => {
    if(intervalHandler !== null) {
      clearInterval(intervalHandler);
      intervalHandler = null;
    }
    if(timeout === undefined) return;
    loader && clockEl?.classList.add(loader.type);
    intervalHandler = setInterval(carousel_next, timeout * 1000);
    return () => { if(intervalHandler !== null) clearInterval(intervalHandler); };
  });
</script>

<section class={ify("image_carousel with-navbar with-sides mx-auto", className)}>
  {#if children || (loader && loader["onBottom"] !== true)}
    <div class="flex top-nav pb-3"><div class="flex mx-auto w-full max-w-[inherit]">
      {#if children}{@render children()}{/if}
      {#if loader && loader["onBottom"] !== true}
        <button type="button" aria-label="Pause carousel" onclick={pauseCarousel} class="ml-auto mr-3 my-1 cursor-pointer z-10">
          <div bind:this={clockEl} class={ify(loader.type + "-base", loader.fill_color, loader.empty_color, loader.duration)}></div>
        </button>
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
      <li class="carousel layer flex box w-full h-full" style={getDegrees(index, carousel_index, images.length)}>{@render image()}</li>
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
        <button type="button" aria-label="Pause carousel" onclick={pauseCarousel} class="layer ml-auto mr-3 my-1 z-10">
          <div bind:this={clockEl} class={ify(loader.type + "-base", loader.fill_color, loader.empty_color, loader.duration)}></div>
        </button>
      {/if}
    </div>
  {/if}
</section>
