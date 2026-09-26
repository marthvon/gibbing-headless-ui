<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { ify, twId } from "./utils";

  export let formId: string | undefined = undefined;
  export let label: string | undefined = undefined;
  export let digits: number;
  export let isNumeric: boolean = true;
  export let disabled: boolean = false;
  export let className: string | undefined = undefined;
  export let digitClass: string | undefined = undefined;

  const dispatch = createEventDispatcher<{ input: Event & { currentTarget: HTMLInputElement }; change: Event & { currentTarget: HTMLInputElement } }>();
  const id = twId("digitbox", label, formId);

  let internalRef: HTMLInputElement;
  export { internalRef as ref };

  let digitEls: HTMLInputElement[] = [];
  $: if(digitEls.length !== digits) digitEls.length = digits;

  function updateDigits(e: Event & { currentTarget: HTMLInputElement }) {
    if(internalRef == null) return;
    internalRef.value = digitEls.reduce((prev, el) => prev + (el?.value || " "), "");
    dispatch("input", e);
  }
</script>

<div class={ify("flex gap-2 h-12", className)}>
  <input bind:this={internalRef} {id} type="hidden" />
  {#each Array.from({ length: digits }, (_, i) => i) as i (i)}
    <input bind:this={digitEls[i]} type={isNumeric ? "number" : "text"} maxlength={1} class={ify("code-box", digitClass)}
      on:focus={() => digitEls[i] && (digitEls[i].value = "")} {disabled}
      on:input={(i + 1) == digits ? (e) => { digitEls[i]?.blur(); updateDigits(e); dispatch("change", e); } : (e) => { digitEls[i + 1]?.focus(); updateDigits(e); }} />
  {/each}
</div>
