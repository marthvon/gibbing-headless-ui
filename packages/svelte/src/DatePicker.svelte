<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import type { DayCtx, HeadingCtx, WeekdayCtx } from "../types/DatePicker";
  import { ify, twId } from "./utils";

  function toIso(date: Date): string {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  function parseIso(iso: string): Date | undefined {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (m == null) return undefined;
    else {
      const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      if (date.getFullYear() !== Number(m[1]) || date.getMonth() !== Number(m[2]) - 1 || date.getDate() !== Number(m[3])) return undefined;
      else return date;
    }
  }

  function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function firstWeekDay(locale?: string): number {
    try {
      const weekInfo = (new Intl.Locale(locale ?? "en-US") as Intl.Locale & { weekInfo?: { firstDay: number } }).weekInfo;
      if (weekInfo == null) return 0;
      else if (weekInfo.firstDay === 7) return 0;
      else return weekInfo.firstDay;
    } catch {
      return 0;
    }
  }

  function monthCells(view: Date, weekStart: number): Date[] {
    const first = startOfMonth(view);
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - ((first.getDay() - weekStart + 7) % 7));
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }

  let {
    value, formId, label, locale, className, headingClass, gridClass, cellClass, weekdayClass,
    oninput, onchange, prev, next, heading, weekday, day, dayMini, children,
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
    oninput?: (iso: string) => void;
    onchange?: (iso: string) => void;
    prev?: Snippet;
    next?: Snippet;
    heading?: Snippet<[HeadingCtx]>;
    weekday?: Snippet<[WeekdayCtx]>;
    day?: Snippet<[DayCtx]>;
    dayMini?: Snippet<[DayCtx]>;
    children?: Snippet;
    ref?: HTMLInputElement;
  } = $props();

  const id = untrack(() => twId("datepicker", label, formId));
  const todayIso = toIso(new Date());
  let internalSelected = $state("");
  let view = $state(untrack(() => startOfMonth(parseIso(value ?? "") ?? new Date())));
  const selected = $derived(value !== undefined ? value : internalSelected);
  const weekStart = $derived(firstWeekDay(locale));
  const cells = $derived(monthCells(view, weekStart));
  const headingLabel = $derived(new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(view));
  const weekdays = $derived(Array.from({ length: 7 }, (_, i) => {
    const dow = (weekStart + i) % 7;
    return { dow, label: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, 7 + dow)) };
  }));

  $effect(() => {
    if (value === undefined) return;
    const date = parseIso(value);
    if (date != null) view = startOfMonth(date);
  });

  function setView(date: Date) {
    view = startOfMonth(date);
  }

  function select(iso: string) {
    const date = parseIso(iso);
    if (date != null) view = startOfMonth(date);
    if (value === undefined) internalSelected = iso;
    oninput?.(iso);
    onchange?.(iso);
  }
</script>

{#snippet defaultDay(ctx: DayCtx)}{ctx.date.getDate()}{/snippet}

<div class={ify("datepicker", className)}>
  <input {id} type="hidden" bind:this={ref} value={selected} />
  <div class={ify("datepicker-heading", headingClass)}>
    <button type="button" aria-label="Previous month" onclick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}>
      {#if prev}{@render prev()}{:else}‹{/if}
    </button>
    <div class="flex box">
      {#if heading}{@render heading({ view, label: headingLabel, setView })}{:else}{headingLabel}{/if}
    </div>
    <button type="button" aria-label="Next month" onclick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}>
      {#if next}{@render next()}{:else}›{/if}
    </button>
  </div>
  <div class={ify("datepicker-weekdays", weekdayClass)}>
    {#each weekdays as dayOfWeek (dayOfWeek.dow)}
      <div class="datepicker-weekday">
        {#if weekday}{@render weekday(dayOfWeek)}{:else}{dayOfWeek.label}{/if}
      </div>
    {/each}
  </div>
  <div class={ify("datepicker-grid", gridClass)} role="grid">
    {#each cells as date (toIso(date))}
      {@const iso = toIso(date)}
      {@const ctx: DayCtx = {
        date, iso,
        inMonth: date.getMonth() === view.getMonth() && date.getFullYear() === view.getFullYear(),
        selected: iso === selected,
        today: iso === todayIso
      }}
      <button type="button" role="gridcell" class={ify("datepicker-cell", cellClass, !ctx.inMonth && "datepicker-cell-outside", ctx.selected && "datepicker-cell-selected", ctx.today && "datepicker-cell-today")}
        aria-selected={ctx.selected} aria-current={ctx.today ? "date" : undefined} onclick={() => select(iso)}>
        {#if day && dayMini}
          <div class="datepicker-day-mini">{@render dayMini(ctx)}</div>
          <div class="datepicker-day-full">{@render day(ctx)}</div>
        {:else if day}
          {@render day(ctx)}
        {:else if dayMini}
          {@render dayMini(ctx)}
        {:else}
          {@render defaultDay(ctx)}
        {/if}
      </button>
    {/each}
  </div>
  {#if children}
    <div class="datepicker-footer">{@render children()}</div>
  {/if}
</div>
