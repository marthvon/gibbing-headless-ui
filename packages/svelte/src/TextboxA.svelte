<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { ify, twId } from "./utils";

  const modeTypes: Record<string, string> = { none: "text", numeric: "number", decimal: "number" };

  export let formId: string | undefined = undefined;
  export let label: string | undefined = undefined;
  export let maxLength: number | undefined = undefined;
  export let mode: "text"|"search"|"none"|"tel"|"url"|"email"|"numeric"|"decimal" = "text";
  export let guard: RegExp | undefined = undefined;
  export let height: number = 2.25;
  export let wrap: boolean = false;
  export let text_size: string = "text-base";
  export let border_active: string | undefined = undefined;
  export let border_error: string = "border-red-600";
  export let className: string | undefined = undefined;
  export let boxClass: string | undefined = undefined;
  export let labelClass: string | undefined = undefined;
  export let error: string | null | undefined = undefined;

  const dispatch = createEventDispatcher<{ blur: FocusEvent & { currentTarget: HTMLInputElement | HTMLTextAreaElement } }>();

  export let ref: HTMLInputElement | HTMLTextAreaElement;

  const form_uuid = twId("textbox", label, formId);
  $: guardCallback = guard ? (e: InputEvent & { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => {
    const currentValue = e.currentTarget.value;
    if(!guard!.test(
      currentValue.slice(0, e.currentTarget.selectionStart ?? 0) + (e.data ?? "")
        + currentValue.slice(e.currentTarget.selectionEnd ?? 0)
    )) e.preventDefault();
  } : undefined;
</script>

<div class={ify("flex flex-col m-2", className)}>
  {#if height > 3.25}
    <textarea {...$$restProps} bind:this={ref} class={ify("peer textbox-a0", text_size, boxClass, !wrap && "whitespace-nowrap", error ? border_error : ify("textbox-a1", border_active))} on:beforeinput={guardCallback}
      style:height="{height}rem" inputmode={mode} id={form_uuid} placeholder="ㅤ" on:blur={(e) => dispatch("blur", e)} maxlength={maxLength}></textarea>
  {:else}
    <input {...$$restProps} bind:this={ref} class={ify("peer textbox-a0", text_size, boxClass, !wrap && "whitespace-nowrap", error ? border_error : ify("textbox-a1", border_active))} style:height="{height}rem"
      type={modeTypes[mode] ?? mode} maxlength={maxLength}
      inputmode={mode} id={form_uuid} placeholder="ㅤ" on:blur={(e) => dispatch("blur", e)} on:beforeinput={guardCallback} />
  {/if}
  {#if error}
    <label class={ify("textbox-text-a textbox-error-a pointer-events-none", labelClass)} for={form_uuid}>{error}</label>
  {:else}
    <label class={ify("textbox-text-a textbox-label-a pointer-events-none", labelClass)} for={form_uuid}>{label}</label>
  {/if}
</div>
