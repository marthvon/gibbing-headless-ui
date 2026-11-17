<script lang="ts" module>
  export type { DialCountry } from "./_internal/phone";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import Select from "./Select.svelte";
  import { FLAGS } from "./_internal/flags";
  import { DIAL_COUNTRIES, countryFor, dialLabel, digitsOnly, joinPhone, splitPhone, type DialCountry } from "./_internal/phone";
  import { DropdownPreset } from "./presets.client";
  import { ify, twId } from "./utils";

  export let label: string;
  export let value: string = "";
  export let maxLength: number = 16;
  export let countries: readonly DialCountry[] = DIAL_COUNTRIES;
  export let floating: boolean = false;
  export let preset: DropdownPreset = DropdownPreset.TOP;
  export let codeLabel: string | undefined = undefined;
  export let format: (country: DialCountry) => string = dialLabel;
  export let formId: string | undefined = undefined;
  export let error: string | null | undefined = undefined;
  export let className: string | undefined = undefined;
  export let labelClass: string | undefined = undefined;
  export let rowClass: string | undefined = undefined;
  export let dialClass: string | undefined = undefined;
  export let triggerClass: string | undefined = undefined;
  export let menuClass: string | undefined = undefined;
  export let optionClass: string | undefined = undefined;
  export let flagClass: string | undefined = undefined;
  export let numberClass: string | undefined = undefined;
  export let inputClass: string | undefined = undefined;
  export let errorClass: string | undefined = undefined;
  export let flag: Snippet<[DialCountry]> | undefined = undefined;
  export let onchange: ((value: string) => void) | undefined = undefined;
  export let onblur: (() => void) | undefined = undefined;

  const id = twId("phone", label, formId);
  const dialId = twId("phone-dial", label, formId);
  let root: HTMLDivElement;
  let { iso, national } = splitPhone(value, countries);
  let lastValue = value;

  $: if (value !== lastValue) {
    lastValue = value;
    ({ iso, national } = splitPhone(value, countries));
  }
  $: nationalMax = Math.max(1, maxLength - countryFor(iso, countries).dial.length);
  $: options = countries.map((country) => ({ value: country.iso, label: format(country) }));

  function emit(nextIso: string, nextNational: string) {
    const capped = joinPhone(countryFor(nextIso, countries).dial, nextNational).slice(0, maxLength);
    lastValue = capped;
    value = capped;
    onchange?.(capped);
  }

  function pickCountry(next: string) {
    iso = next;
    emit(next, national);
  }

  function onNational(event: Event & { currentTarget: HTMLInputElement }) {
    national = digitsOnly(event.currentTarget.value);
    emit(iso, national);
  }

  function leave(event: FocusEvent) {
    const next = event.relatedTarget;
    if (next instanceof Node && root?.contains(next)) return;
    onblur?.();
  }
</script>

<div bind:this={root} class={ify("field phone-field", className)}>
  {#if !floating}<label class={ify("field-label", labelClass)} for={id}>{label}</label>{/if}
  <div class={ify("phone-row", rowClass)}>
    <Select
      label={codeLabel ?? `${label} country code`}
      formId={dialId}
      labelled={false}
      {preset}
      className={ify("phone-dial", dialClass)}
      {triggerClass}
      {menuClass}
      {optionClass}
      {options}
      value={iso}
      {error}
      onchange={pickCountry}
    >
      {#snippet option(choice)}
        {#if flag}
          {@render flag(countryFor(choice.value, countries))}
        {:else}
          <svg viewBox="0 0 20 14" class={ify("phone-flag", flagClass)} aria-hidden="true">{@html FLAGS[choice.value] ?? ""}</svg>
        {/if}
        {choice.label}
      {/snippet}
    </Select>
    <div class={ify("phone-number", numberClass)}>
      <input
        {id}
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
        class={floating
          ? ify("peer textbox-a0 phone-floating", error ? "field-invalid" : "textbox-a1", inputClass)
          : ify("field-box", error && "field-invalid", inputClass)}
        placeholder={floating ? "ㅤ" : undefined}
        maxlength={nationalMax}
        value={national}
        oninput={onNational}
        onblur={leave}
      />
      {#if floating}
        <label class={ify("textbox-text-a textbox-label-a pointer-events-none", labelClass)} for={id}>{error ?? label}</label>
      {/if}
    </div>
  </div>
  {#if error && !floating}<p class={ify("field-error", errorClass)}>{error}</p>{/if}
</div>
