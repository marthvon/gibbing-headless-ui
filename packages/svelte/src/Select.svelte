<script lang="ts" module>
  export type SelectOption = { value: string; label: string };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import Dropdown from "./Dropdown.svelte";
  import { DropdownPreset, Interact } from "./presets.client";
  import { ify, zLayer, type Content } from "./utils";

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
  export let style: string | undefined = undefined;
  export let zIndex: number | undefined = undefined;
  export let className: string | undefined = undefined;
  export let dropdownClass: string | undefined = undefined;
  export let triggerClass: string | undefined = undefined;
  export let wrapperClass: string | undefined = undefined;
  export let modalClass: string | undefined = undefined;
  export let menuClass: string | undefined = undefined;
  export let optionClass: string | undefined = undefined;
  export let caption: Snippet<[string]> | undefined = undefined;
  export let trigger: Snippet<[SelectOption | undefined, string]> | undefined = undefined;
  export let option: Snippet<[SelectOption]> | undefined = undefined;
  export let tick: Content<[boolean]> | undefined = undefined;
  export let chevron: Content | undefined = undefined;
  export let message: Snippet<[string]> | undefined = undefined;
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

{#snippet defaultCaption(text: string)}<span class="field-label">{text}</span>{/snippet}
{#snippet defaultTrigger(choice: SelectOption | undefined, text: string)}
  {#if option && choice}{@render option(choice)}{:else}<span class="select-value" title={text}>{text}</span>{/if}
{/snippet}
{#snippet defaultTick(on: boolean, mark: string)}<span class="select-tick">{on ? mark : ""}</span>{/snippet}
{#snippet defaultChevron(text: string | undefined)}<span class="select-chevron" aria-hidden="true">{#if text}{text}{:else}<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="m5 8 5 5 5-5" /></svg>{/if}</span>{/snippet}
{#snippet defaultMessage(text: string)}<span class="field-error">{text}</span>{/snippet}

<div class={ify("field", className)} style={zLayer(zIndex, style)}>
  {#if labelled}{@render (caption ?? defaultCaption)(label)}{/if}
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
      {@render (trigger ?? defaultTrigger)(selected, shown)}
      {#if typeof chevron === "function"}{@render chevron()}{:else}{@render defaultChevron(chevron)}{/if}
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
          {#if multiple}{#if typeof tick === "function"}{@render tick(values.includes(choice.value))}{:else}{@render defaultTick(values.includes(choice.value), tick ?? "✓")}{/if}{/if}
          {#if option}{@render option(choice)}{:else}{choice.label}{/if}
        </button>
      {/each}
    {/snippet}
  </Dropdown>
  {#if labelled && error}{@render (message ?? defaultMessage)(error)}{/if}
</div>
