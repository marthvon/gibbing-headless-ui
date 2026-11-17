<script lang="ts">
  import type { Snippet } from "svelte";
  import { ify, twId } from "./utils";

  export let label: string;
  export let value: string = "";
  export let name: string | undefined = undefined;
  export let maxLength: number = 64;
  export let autocomplete: "current-password" | "new-password" = "current-password";
  export let formId: string | undefined = undefined;
  export let error: string | null | undefined = undefined;
  export let showLabel: string = "Show password";
  export let hideLabel: string = "Hide password";
  export let className: string | undefined = undefined;
  export let boxClass: string | undefined = undefined;
  export let labelClass: string | undefined = undefined;
  export let revealClass: string | undefined = undefined;
  export let showIcon: Snippet | undefined = undefined;
  export let hideIcon: Snippet | undefined = undefined;
  export let onchange: ((value: string) => void) | undefined = undefined;

  const id = twId("password", label, formId);
  let revealed = false;
</script>

<div class={ify("password-field", className)}>
  <input
    {id}
    {name}
    type={revealed ? "text" : "password"}
    class={ify("peer textbox-a0 password-input", error ? "field-invalid" : "textbox-a1", boxClass)}
    placeholder="ㅤ"
    maxlength={maxLength}
    {autocomplete}
    spellcheck="false"
    bind:value
    oninput={(event) => onchange?.(event.currentTarget.value)}
  />
  <label class={ify("textbox-text-a textbox-label-a pointer-events-none", labelClass)} for={id}>{error ?? label}</label>
  <button
    type="button"
    class={ify("password-reveal", revealClass)}
    aria-label={revealed ? hideLabel : showLabel}
    aria-pressed={revealed}
    aria-controls={id}
    onmousedown={(event) => event.preventDefault()}
    onclick={() => (revealed = !revealed)}
  >
    {#if revealed}
      {#if hideIcon}
        {@render hideIcon()}
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.9 5.1A10 10 0 0 1 12 4.8c5.5 0 9.2 4.4 10.2 6.2a13 13 0 0 1-2.2 3.1" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.1 6.1C3.8 7.6 2.2 9.8 1.8 11a13 13 0 0 0 5.2 6.1 10 10 0 0 0 6.3 1.1" />
        </svg>
      {/if}
    {:else if showIcon}
      {@render showIcon()}
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.75" />
      </svg>
    {/if}
  </button>
</div>
