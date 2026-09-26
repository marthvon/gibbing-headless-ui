<script lang="ts">
  import { ify, twId } from "./utils";
  import { type CardPreset, Interact } from "./presets.client";

  export let from_color: string;
  export let preset: CardPreset;
  export let className: string | undefined = undefined;
  export let cardClass: string | undefined = undefined;
  export let interact: Interact = Interact.HOVER;

  const id = twId("info-card");
  const styles = preset.split(" | ");
</script>

<article class={ify("group layers overflow-hidden w-full", className)}>
  <input type="checkbox" {id} class="peer ghost-node" />
  <div class="layer w-full h-full"><slot name="image" /></div>
  <label for={id} class={ify(
    "layer w-full h-full transition-all to-transparent", cardClass, styles[0],
    from_color, (interact & Interact.HOVER) && "group-hover:bg-full", (interact & Interact.CLICK) && "peer-checked:bg-full cursor-pointer"
  )}></label>
  <label for={id} class={ify(
    "layer text-wrap overflow-auto contained-bounds transition-all", styles[1], cardClass,
    (interact & Interact.HOVER) && "group-hover:translate-0", (interact & Interact.CLICK) && "peer-checked:translate-0 cursor-pointer"
  )}>
    <slot />
  </label>
</article>
