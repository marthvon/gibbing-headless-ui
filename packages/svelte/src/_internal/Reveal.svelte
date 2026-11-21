<script lang="ts">
  import { ify, type Content } from "../utils";

  export let revealed: boolean;
  export let target: string;
  export let showLabel: string;
  export let hideLabel: string;
  export let showIcon: Content | undefined = undefined;
  export let hideIcon: Content | undefined = undefined;
  export let className: string | undefined = undefined;
  export let style: string | undefined = undefined;
  export let ontoggle: () => void;
</script>

<button
  type="button"
  class={ify("textbox-reveal", className)}
  {style}
  aria-label={revealed ? hideLabel : showLabel}
  aria-pressed={revealed}
  aria-controls={target}
  onmousedown={(event) => event.preventDefault()}
  onclick={ontoggle}
>
  {#if revealed}
    {#if typeof hideIcon === "function"}
      {@render hideIcon()}
    {:else if hideIcon}
      {hideIcon}
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.9 5.1A10 10 0 0 1 12 4.8c5.5 0 9.2 4.4 10.2 6.2a13 13 0 0 1-2.2 3.1" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M6.1 6.1C3.8 7.6 2.2 9.8 1.8 11a13 13 0 0 0 5.2 6.1 10 10 0 0 0 6.3 1.1" />
      </svg>
    {/if}
  {:else if typeof showIcon === "function"}
    {@render showIcon()}
  {:else if showIcon}
    {showIcon}
  {:else}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  {/if}
</button>
