<script lang="ts" module>
  export type { TextMode } from "./_internal/textbox";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import Reveal from "./_internal/Reveal.svelte";
  import { guardInput, inputType, type TextField, type TextMode } from "./_internal/textbox";
  import { ify, twId, type Content } from "./utils";

  export let label: string | undefined = undefined;
  export let error: string | null | undefined = undefined;
  export let value: string = "";
  export let formId: string | undefined = undefined;
  export let maxLength: number | undefined = undefined;
  export let mode: TextMode = "text";
  export let guard: RegExp | undefined = undefined;
  export let height: number = 2.75;
  export let wrap: boolean = false;
  export let className: string | undefined = undefined;
  export let boxClass: string | undefined = undefined;
  export let ref: TextField | undefined = undefined;
  export let secret: boolean = false;
  export let revealed: boolean = false;
  export let showLabel: string = "Show password";
  export let hideLabel: string = "Hide password";
  export let showIcon: Content | undefined = undefined;
  export let hideIcon: Content | undefined = undefined;
  export let revealClass: string | undefined = undefined;
  export let caption: Snippet<[string, string]> | undefined = undefined;
  export let message: Snippet<[string | undefined, string]> | undefined = undefined;

  const id = twId("textbox", label, formId);
  const messageId = `${id}-message`;
  $: hidden = secret && height <= 3.25;
  $: guarded = guard ? guardInput(guard) : undefined;
  $: boxClasses = ify("textbox-b-box", !wrap && "whitespace-nowrap", hidden && (typeof showIcon === "string" || typeof hideIcon === "string" ? "pr-16" : "pr-10"), boxClass);
</script>

{#snippet defaultCaption(text: string, target: string)}<label for={target} class="textbox-b-label textbox-b-float">{text}</label>{/snippet}
{#snippet defaultMessage(text: string | undefined, target: string)}<p id={target} aria-live="polite" class="textbox-b-message">{text || "ㅤ"}</p>{/snippet}

<div class={ify("textbox-b", className)}>
  <div class="textbox-b-frame">
    {#if height > 3.25}
      <textarea
        {...$$restProps}
        bind:this={ref}
        bind:value
        {id}
        inputmode={mode}
        maxlength={maxLength}
        placeholder="ㅤ"
        aria-invalid={!!error}
        aria-describedby={messageId}
        class={boxClasses}
        style:height="{height}rem"
        onbeforeinput={guarded}
      ></textarea>
    {:else}
      <input
        {...$$restProps}
        bind:this={ref}
        bind:value
        {id}
        type={hidden && !revealed ? "password" : inputType(mode)}
        inputmode={mode}
        maxlength={maxLength}
        placeholder="ㅤ"
        aria-invalid={!!error}
        aria-describedby={messageId}
        class={boxClasses}
        style:height="{height}rem"
        onbeforeinput={guarded}
      />
    {/if}
    {#if label}{@render (caption ?? defaultCaption)(label, id)}{/if}
    {#if hidden}
      <Reveal {revealed} target={id} {showLabel} {hideLabel} {showIcon} {hideIcon} className={revealClass} ontoggle={() => (revealed = !revealed)} />
    {/if}
  </div>
  {@render (message ?? defaultMessage)(error ?? undefined, messageId)}
</div>
