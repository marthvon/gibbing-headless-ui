<script lang="ts">
  import { ify, twId } from "./utils";
  import { Interact } from "./presets.client";

  export let className: string | undefined = undefined;
  export let cardClass: string | undefined = undefined;
  export let interact: Interact = Interact.HOVER;

  const id = twId("flip-card");
</script>

<article class={ify("group layers w-full drop-shadow-2xl", className)}>
  {#if (interact & Interact.CLICK) !== 0}
    <input type="checkbox" {id} class="peer ghost-node" />
  {/if}
  <label for={id} class={ify(
    "layer backface-hidden transition-all h-full w-full",
    cardClass, (interact & Interact.HOVER) && "group-hover:flip-xform", (interact & Interact.CLICK) && "peer-checked:flip-xform cursor-pointer"
  )}><slot name="image" /></label>
  <label for={id} class={ify(
    "layer backface-hidden transition-all flip-xform text-wrap overflow-auto contained-bounds",
    cardClass, (interact & Interact.HOVER) && "group-hover:unflip-xform", (interact & Interact.CLICK) && "peer-checked:unflip-xform cursor-pointer"
  )}>
    <slot />
  </label>
</article>
