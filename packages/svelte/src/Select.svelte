<script lang="ts" module>
  export type SelectOption = { value: string; label: string };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import Dropdown from "./Dropdown.svelte";
  import { DropdownPreset, Interact } from "./presets.client";
  import { ify } from "./utils";

  export let label: string;
  export let options: readonly SelectOption[];
  export let value: string = "";
  export let values: readonly string[] = [];
  export let multiple: boolean = false;
  export let summary: string = "";
  export let placeholder: string = "—";
  export let clearable: boolean = false;
  export let labelled: boolean = true;
  export let error: string | null | undefined = undefined;
  export let formId: string | undefined = undefined;
  export let preset: DropdownPreset = DropdownPreset.BOTTOM;
  export let interact: Interact = Interact.CLICK;
  export let tickMark: string = "✓";
  export let style: string | undefined = undefined;
  export let className: string | undefined = undefined;
  export let labelClass: string | undefined = undefined;
  export let dropdownClass: string | undefined = undefined;
  export let triggerClass: string | undefined = undefined;
  export let valueClass: string | undefined = undefined;
  export let wrapperClass: string | undefined = undefined;
  export let modalClass: string | undefined = undefined;
  export let menuClass: string | undefined = undefined;
  export let optionClass: string | undefined = undefined;
  export let tickClass: string | undefined = undefined;
  export let errorClass: string | undefined = undefined;
  export let trigger: Snippet<[SelectOption | undefined, string]> | undefined = undefined;
  export let option: Snippet<[SelectOption]> | undefined = undefined;
  export let onchange: ((value: string) => void) | undefined = undefined;
  export let ontoggle: ((value: string) => void) | undefined = undefined;

  $: selected = multiple ? undefined : options.find((choice) => choice.value === value);
  $: shown = multiple ? summary : (selected?.label ?? placeholder);

  function pick(next: string, event: MouseEvent) {
    if (multiple) {
      ontoggle?.(next);
      return;
    }
    value = next;
    onchange?.(next);
    const box = (event.currentTarget as HTMLElement).closest(".select-dropdown")?.querySelector(":scope > input.ghost-node");
    if (box instanceof HTMLInputElement) box.checked = false;
  }
</script>

<div class={ify("field", className)} {style}>
  {#if labelled}<span class={ify("field-label", labelClass)}>{label}</span>{/if}
  <Dropdown
    {preset}
    {interact}
    clickOut
    {label}
    {formId}
    className={ify("select-dropdown", wrapperClass && "select-anchored", dropdownClass)}
    {wrapperClass}
    modalClass={ify("select-outer", modalClass)}
    innerModalClass={ify("select-menu", menuClass)}
  >
    <span class={ify("field-box select-trigger", error && "field-invalid", triggerClass)}>
      {#if trigger}
        {@render trigger(selected, shown)}
      {:else if option && selected}
        {@render option(selected)}
      {:else}
        <span class={ify("select-value", valueClass)} title={shown}>{shown}</span>
      {/if}
    </span>
    {#snippet menu()}
      {#if clearable && !multiple}
        <button type="button" class={ify("select-option", optionClass)} onclick={(event) => pick("", event)}>{placeholder}</button>
      {/if}
      {#each options as choice (choice.value)}
        <button
          type="button"
          class={ify("select-option", optionClass)}
          aria-pressed={multiple ? values.includes(choice.value) : undefined}
          onclick={(event) => pick(choice.value, event)}
        >
          {#if multiple}<span class={ify("select-tick", tickClass)}>{values.includes(choice.value) ? tickMark : ""}</span>{/if}
          {#if option}{@render option(choice)}{:else}{choice.label}{/if}
        </button>
      {/each}
    {/snippet}
  </Dropdown>
  {#if labelled && error}<span class={ify("field-error", errorClass)}>{error}</span>{/if}
</div>
