<script lang="ts" module>
  export type DateInput = {
    formId: string | undefined;
    label: string | undefined;
    value: string;
    maxLength: number;
    guard: RegExp;
    oninput: (event: Event & { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => void;
    onblur: (event: FocusEvent) => void;
  };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { DayCtx, HeadingCtx, WeekdayCtx } from "./_internal/date_picker";
  import DatePicker from "./DatePicker.svelte";
  import Dropdown from "./Dropdown.svelte";
  import TextboxA from "./TextboxA.svelte";
  import { DropdownPreset, Interact } from "./presets.client";
  import { ify, zLayer } from "./utils";

  export let value: string | undefined = undefined;
  export let formId: string | undefined = undefined;
  export let label: string | undefined = undefined;
  export let locale: string | undefined = undefined;
  export let zIndex: number | undefined = undefined;
  export let className: string | undefined = undefined;
  export let headingClass: string | undefined = undefined;
  export let gridClass: string | undefined = undefined;
  export let cellClass: string | undefined = undefined;
  export let weekdayClass: string | undefined = undefined;
  export let pickerClass: string | undefined = undefined;
  export let modalClass: string | undefined = undefined;
  export let innerModalClass: string | undefined = undefined;
  export let preset: DropdownPreset = DropdownPreset.BOTTOM;
  export let interact: Interact = Interact.CLICK;
  export let clickOut: boolean = true;
  export let oninput: ((iso: string) => void) | undefined = undefined;
  export let onchange: ((iso: string) => void) | undefined = undefined;
  export let prev: Snippet | undefined = undefined;
  export let next: Snippet | undefined = undefined;
  export let heading: Snippet<[HeadingCtx]> | undefined = undefined;
  export let weekday: Snippet<[WeekdayCtx]> | undefined = undefined;
  export let day: Snippet<[DayCtx]> | undefined = undefined;
  export let dayMini: Snippet<[DayCtx]> | undefined = undefined;
  export let children: Snippet | undefined = undefined;
  export let field: Snippet<[DateInput]> | undefined = undefined;
  export let ref: HTMLInputElement | undefined = undefined;

  const ISO_TYPING = /^\d{0,4}(-(\d{0,2}(-(\d{0,2})?)?)?)?$/;

  let wrapEl: HTMLDivElement | undefined;
  let selected = value ?? "";
  let text = selected;

  $: if (value !== undefined) selected = value;
  $: text = selected;

  function openMenu(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (target.classList.contains("ghost-node") || target.closest(".dropdown-wrapper")) return;
    const box = wrapEl?.querySelector<HTMLInputElement>("input.ghost-node");
    if (box) box.checked = true;
  }

  function closeMenu() {
    const box = wrapEl?.querySelector<HTMLInputElement>("input.ghost-node");
    if (box) box.checked = false;
  }

  function commit(iso: string) {
    selected = iso;
    text = iso;
    oninput?.(iso);
    onchange?.(iso);
    closeMenu();
  }

  function leave() {
    if (text === "") return commit("");
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined;
    if (m && date && date.getFullYear() === Number(m[1]) && date.getMonth() === Number(m[2]) - 1 && date.getDate() === Number(m[3])) commit(text);
    else text = selected;
  }

  $: input = {
    formId,
    label,
    value: text,
    maxLength: 10,
    guard: ISO_TYPING,
    oninput: (event) => (text = event.currentTarget.value),
    onblur: leave
  } satisfies DateInput;
</script>

{#snippet defaultField(props: DateInput)}<TextboxA {...props} />{/snippet}

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div bind:this={wrapEl} style={zLayer(zIndex)} onfocusin={openMenu} onclick={openMenu}>
  <Dropdown {preset} {interact} {clickOut} {label} {className} {modalClass} {innerModalClass}>
    {@render (field ?? defaultField)(input)}
    {#snippet menu()}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div onmousedown={(e) => e.preventDefault()}>
        <DatePicker bind:ref value={selected} {formId} {label} {locale} className={ify("datepicker-popup", pickerClass)} {headingClass} {gridClass} {cellClass} {weekdayClass}
          {prev} {next} {heading} {weekday} {day} {dayMini} {children}
          oninput={(iso) => { selected = iso; oninput?.(iso); }}
          onchange={(iso) => { selected = iso; onchange?.(iso); closeMenu(); }} />
      </div>
    {/snippet}
  </Dropdown>
</div>
