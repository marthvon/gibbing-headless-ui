<script lang="ts">
  import type { Snippet } from "svelte";
  import type { DayCtx, HeadingCtx, WeekdayCtx } from "./_internal/date_picker";
  import DatePicker from "./DatePicker.svelte";
  import Dropdown from "./Dropdown.svelte";
  import TextboxA from "./TextboxA.svelte";
  import { DropdownPreset, Interact } from "./presets.client";
  import { ify } from "./utils";

  export let value: string | undefined = undefined;
  export let formId: string | undefined = undefined;
  export let label: string | undefined = undefined;
  export let locale: string | undefined = undefined;
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
  export let trigger: Snippet | undefined = undefined;
  export let ref: HTMLInputElement | undefined = undefined;

  let wrapEl: HTMLDivElement | undefined;
  let textboxEl: HTMLInputElement | HTMLTextAreaElement;
  let selected = value ?? "";

  $: if (value !== undefined) selected = value;
  $: if (textboxEl) textboxEl.value = selected;

  function openMenu(event: Event) {
    if (!textboxEl || event.target !== textboxEl) return;
    const box = wrapEl?.querySelector<HTMLInputElement>("input.ghost-node");
    if (box) box.checked = true;
  }

  function closeMenu() {
    const box = wrapEl?.querySelector<HTMLInputElement>("input.ghost-node");
    if (box) box.checked = false;
  }

  function commit(iso: string) {
    selected = iso;
    oninput?.(iso);
    onchange?.(iso);
    closeMenu();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div bind:this={wrapEl} onfocusin={openMenu} onclick={openMenu}>
  <Dropdown {preset} {interact} {clickOut} {label} {className} {modalClass} {innerModalClass}>
    {#if trigger}
      {@render trigger()}
    {:else}
      <TextboxA bind:ref={textboxEl} {label} maxLength={10} value={selected} guard={/^\d{0,4}(-(\d{0,2}(-(\d{0,2})?)?)?)?$/}
        on:blur={() => {
          const typed = textboxEl?.value ?? "";
          if (typed === "") commit("");
          else {
            const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typed);
            const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined;
            if (date && date.getFullYear() === Number(m![1]) && date.getMonth() === Number(m![2]) - 1 && date.getDate() === Number(m![3])) commit(typed);
            else if (textboxEl) textboxEl.value = selected;
          }
        }} />
    {/if}
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
