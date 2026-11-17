<script lang="ts">
  import { onDestroy, type Snippet } from "svelte";
  import { ify } from "./utils";

  type SmartGridImg = [string, number, Snippet][];
  type SmartGridLayout = {
    columns: number, cols: string[][], heights: number[], placed: Set<string>
  };

  function shortestCol(heights: number[]) {
    let shortest = 0;
    for(let i = 1; i < heights.length; ++i)
      if(heights[i] < heights[shortest])
        shortest = i;
    return shortest;
  }

  function relayout(images: SmartGridImg, columns: number, prev: SmartGridLayout): SmartGridLayout {
    const kept = prev.columns === columns
      && images.reduce((count, [ key ]) => count + (prev.placed.has(key)? 1 : 0), 0) === prev.placed.size;
    const appended = kept? images.filter(([ key ]) => !prev.placed.has(key)) : images;
    if(kept && appended.length === 0)
      return prev;
    const layout: SmartGridLayout = kept? {
      columns, cols: prev.cols.map(col => col.slice()),
      heights: prev.heights.slice(), placed: new Set(prev.placed)
    } : {
      columns, cols: Array.from({ length: columns }, () => [] as string[]),
      heights: Array.from({ length: columns }, () => 0), placed: new Set<string>()
    };
    for(const [ key, ratio ] of appended) {
      const col = shortestCol(layout.heights);
      layout.cols[col].push(key);
      layout.heights[col] += ratio > 0? ratio : 1;
      layout.placed.add(key);
    }
    return layout;
  }

  export let images: SmartGridImg;
  export let className: string | undefined = undefined;
  export let innerClass: string | undefined = undefined;
  export let cardClass: string | undefined = undefined;
  export let template: Snippet | undefined = undefined;
  export let columns: number | undefined = undefined;
  export let loading: boolean = false;
  export let threshold: number = 0;
  export let onScrollEnd: (() => void) | undefined = undefined;

  let gridEl: HTMLDivElement | undefined;
  let rowEl: HTMLDivElement | undefined;
  let sentinelEl: HTMLDivElement | undefined;
  let colCount = columns && columns > 0? columns : 1;
  let prevLayout: SmartGridLayout = { columns: 0, cols: [], heights: [], placed: new Set<string>() };
  let loaded = 0;
  let pending = false;
  let unwatchColumns: (() => void) | undefined;
  let unwatchEnd: (() => void) | undefined;

  $: layout = prevLayout = relayout(images, colCount, prevLayout);
  $: cards = new Map(images.map(([ key, _ratio, image ]) => [ key, image ]));
  $: watchColumns(columns, rowEl);
  $: watchEnd(sentinelEl, gridEl, layout, threshold);

  onDestroy(() => {
    unwatchColumns?.();
    unwatchEnd?.();
  });

  function watchColumns(fixed: number | undefined, el: HTMLDivElement | undefined) {
    unwatchColumns?.();
    unwatchColumns = undefined;
    if(fixed && fixed > 0) {
      colCount = fixed;
      return;
    }
    if(el == null)
      return;
    const readCols = () => {
      const declared = parseInt(getComputedStyle(el).getPropertyValue("--tw-smart-grid-cols"));
      colCount = declared > 0? declared : 1;
    };
    readCols();
    const resized = new ResizeObserver(readCols);
    resized.observe(el);
    unwatchColumns = () => resized.disconnect();
  }

  function watchEnd(el: HTMLDivElement | undefined, root: HTMLDivElement | undefined, current: SmartGridLayout, margin: number) {
    unwatchEnd?.();
    unwatchEnd = undefined;
    if(el == null || root == null)
      return;
    if(loaded !== current.placed.size) {
      loaded = current.placed.size;
      pending = false;
    }
    const watcher = new IntersectionObserver(([ entry ]) => {
      if(!entry.isIntersecting) {
        pending = false;
        return;
      }
      if(pending)
        return;
      pending = true;
      onScrollEnd?.();
    }, { root, rootMargin: margin+"px" });
    watcher.observe(el);
    unwatchEnd = () => watcher.disconnect();
  }
</script>

<div bind:this={gridEl} class={ify("smart-grid-view", className)}>
  <div bind:this={rowEl} class="smart-grid-columns">
    {#each layout.cols as col, index (index)}
      <ul class={ify("smart-grid-column", innerClass)}>
        {#each col as key (key)}
          {@const card = cards.get(key)}
          <li class={ify("smart-grid-card", cardClass)}>{#if card}{@render card()}{/if}</li>
        {/each}
        {#if loading && template}
          <li aria-hidden="true" class={ify("smart-grid-card", cardClass)}>{@render template()}</li>
        {/if}
      </ul>
    {/each}
  </div>
  <div bind:this={sentinelEl} aria-hidden="true" class="smart-grid-sentinel"></div>
</div>
