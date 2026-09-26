<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import type { DayCtx, HeadingCtx, WeekdayCtx } from "../types/DatePicker";
  import DatePicker from "./DatePicker.svelte";
  import Dropdown from "./Dropdown.svelte";
  import TextboxA from "./TextboxA.svelte";
  import { DropdownPreset, Interact } from "./presets.client";

  let {
    value, formId, label, locale, className, headingClass, gridClass, cellClass, weekdayClass,
    pickerClass, modalClass, innerModalClass, preset = DropdownPreset.BOTTOM, interact = Interact.CLICK, clickOut = true,
    oninput, onchange, prev, next, heading, weekday, day, dayMini, children, trigger,
    ref = $bindable()
  }: {
    value?: string;
    formId?: string;
    label?: string;
    locale?: string;
    className?: string;
    headingClass?: string;
    gridClass?: string;
    cellClass?: string;
    weekdayClass?: string;
    pickerClass?: string;
    modalClass?: string;
    innerModalClass?: string;
    preset?: DropdownPreset;
    interact?: Interact;
    clickOut?: boolean;
    oninput?: (iso: string) => void;
    onchange?: (iso: string) => void;
    prev?: Snippet;
    next?: Snippet;
    heading?: Snippet<[HeadingCtx]>;
    weekday?: Snippet<[WeekdayCtx]>;
    day?: Snippet<[DayCtx]>;
    dayMini?: Snippet<[DayCtx]>;
    children?: Snippet;
    trigger?: Snippet;
    ref?: HTMLInputElement;
  } = $props();

  let wrapEl: HTMLDivElement | undefined;
  let textboxEl = $state() as HTMLInputElement | HTMLTextAreaElement;
  let selected = $state(untrack(() => value ?? ""));

  $effect(() => {
    if (value !== undefined) selected = value;
  });

  $effect(() => {
    if (textboxEl) textboxEl.value = selected;
  });

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

<div bind:this={wrapEl}>
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
        <DatePicker bind:ref value={selected} {formId} {label} {locale} className={pickerClass} {headingClass} {gridClass} {cellClass} {weekdayClass}
          {prev} {next} {heading} {weekday} {day} {dayMini} {children}
          oninput={(iso) => { selected = iso; oninput?.(iso); }}
          onchange={(iso) => { selected = iso; onchange?.(iso); closeMenu(); }} />
      </div>
    {/snippet}
  </Dropdown>
</div>
