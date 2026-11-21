<script lang="ts" module>
  export type { DialCountry } from "./_internal/phone";
  export type PhoneInput = {
    label: string;
    value: string;
    error: string | null | undefined;
    maxLength: number;
    mode: "tel";
    autocomplete: "tel-national";
    oninput: (event: Event & { currentTarget: HTMLInputElement }) => void;
    onblur: (event: FocusEvent) => void;
  };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import Select from "./Select.svelte";
  import { FLAGS } from "./_internal/flags";
  import { DIAL_COUNTRIES, countryFor, dialLabel, digitsOnly, joinPhone, splitPhone, type DialCountry } from "./_internal/phone";
  import { DropdownPreset } from "./presets.client";
  import { ify, twId, zLayer } from "./utils";

  export let label: string;
  export let value: string = "";
  export let maxLength: number = 16;
  export let countries: readonly DialCountry[] = DIAL_COUNTRIES;
  export let preset: DropdownPreset = DropdownPreset.TOP;
  export let codeLabel: string | undefined = undefined;
  export let format: (country: DialCountry) => string = dialLabel;
  export let formId: string | undefined = undefined;
  export let error: string | null | undefined = undefined;
  export let zIndex: number | undefined = undefined;
  export let className: string | undefined = undefined;
  export let rowClass: string | undefined = undefined;
  export let dialClass: string | undefined = undefined;
  export let triggerClass: string | undefined = undefined;
  export let menuClass: string | undefined = undefined;
  export let optionClass: string | undefined = undefined;
  export let numberClass: string | undefined = undefined;
  export let inputClass: string | undefined = undefined;
  export let caption: Snippet<[string, string]> | undefined = undefined;
  export let flag: Snippet<[DialCountry]> | undefined = undefined;
  export let message: Snippet<[string]> | undefined = undefined;
  export let field: Snippet<[PhoneInput]> | undefined = undefined;
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
  $: input = { label, value: national, error, maxLength: nationalMax, mode: "tel", autocomplete: "tel-national", oninput: onNational, onblur: leave } satisfies PhoneInput;

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

{#snippet defaultCaption(text: string, target: string)}<label class="field-label" for={target}>{text}</label>{/snippet}
{#snippet defaultMessage(text: string)}<p class="field-error">{text}</p>{/snippet}

<div bind:this={root} class={ify("field phone-field", className)} style={zLayer(zIndex)}>
  {#if !field}{@render (caption ?? defaultCaption)(label, id)}{/if}
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
          <svg viewBox="0 0 20 14" class="phone-flag" aria-hidden="true">{@html FLAGS[choice.value] ?? ""}</svg>
        {/if}
        {choice.label}
      {/snippet}
    </Select>
    <div class={ify("phone-number", numberClass)}>
      {#if field}
        {@render field(input)}
      {:else}
        <input
          {id}
          type="tel"
          inputmode="tel"
          autocomplete="tel-national"
          class={ify("field-box", error && "field-invalid", inputClass)}
          maxlength={nationalMax}
          value={national}
          oninput={onNational}
          onblur={leave}
        />
      {/if}
    </div>
  </div>
  {#if error && !field}{@render (message ?? defaultMessage)(error)}{/if}
</div>
