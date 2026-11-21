<script lang="ts">
  import { type Snippet } from "svelte";
  import { ify } from "./utils";

  export let className: string | undefined = undefined;
  export let innerClass: string | undefined = undefined;
  export let cardClass: string | undefined = undefined;
  export let childrens: [string, Snippet][];
  export let columns: number | undefined = undefined;
</script>

<div class={ify("@container w-full overflow-y-auto overflow-x-hidden", className)}>
  <ul class={ify("grid-view w-full gap-3", innerClass)} style:columns={columns}>
    {#each childrens as [key, child] (key)}
      <li class={ify("h-fit w-full my-3 break-inside-avoid", cardClass)}>{@render child()}</li>
    {/each}
  </ul>
</div>
