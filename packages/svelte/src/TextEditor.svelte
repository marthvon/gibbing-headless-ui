<script lang="ts" module>
  export type { FormatAction, TextSnippet, Tool } from "./_internal/text_format";
  export type { VariableClass } from "./_internal/text_highlight";
  export { TOOL_GROUPS } from "./_internal/text_format";
</script>

<script lang="ts">
  import { onDestroy, onMount, tick, type Snippet } from "svelte";
  import type { Extension } from "@codemirror/state";
  import {
    TOOL_GROUPS, ariaShortcut, editorStatus, formatEdit, insertEdit, isMac, shortcutAction, shortcutLabel,
    type FormatAction, type TextSnippet, type Tool
  } from "./_internal/text_format";
  import type { VariableClass } from "./_internal/text_highlight";
  import { LiveEditor } from "./_internal/text_view";
  import { ify, twId } from "./utils";

  export let label: string;
  export let value: string = "";
  export let rows: number = 12;
  export let maxLength: number | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let readonly: boolean = false;
  export let labelled: boolean = true;
  export let error: string | null | undefined = undefined;
  export let tools: ReadonlyArray<readonly Tool[]> = TOOL_GROUPS;
  export let snippets: readonly TextSnippet[] = [];
  export let insertLabel: string = "Insert";
  export let toolbarLabel: string = "Formatting";
  export let variableClass: VariableClass | undefined = undefined;
  export let extensions: Extension[] = [];
  export let status: (text: string, maxLength: number | undefined) => string = editorStatus;
  export let formId: string | undefined = undefined;
  export let className: string | undefined = undefined;
  export let labelClass: string | undefined = undefined;
  export let boxClass: string | undefined = undefined;
  export let toolbarClass: string | undefined = undefined;
  export let toolClass: string | undefined = undefined;
  export let dividerClass: string | undefined = undefined;
  export let insertClass: string | undefined = undefined;
  export let menuClass: string | undefined = undefined;
  export let itemClass: string | undefined = undefined;
  export let sourceClass: string | undefined = undefined;
  export let errorClass: string | undefined = undefined;
  export let statusClass: string | undefined = undefined;
  export let glyph: Snippet<[FormatAction]> | undefined = undefined;
  export let item: Snippet<[TextSnippet]> | undefined = undefined;
  export let onchange: ((value: string) => void) | undefined = undefined;
  export let onblur: (() => void) | undefined = undefined;

  const id = twId("text-editor", label, formId);
  const menuId = `${id}-snippets`;
  let mac = false;
  let host: HTMLDivElement;
  let live: LiveEditor | undefined;
  let bar: HTMLDivElement | undefined;
  let menu: HTMLDivElement | undefined;
  let trigger: HTMLButtonElement | undefined;
  let current = 0;
  let open = false;
  let detach: (() => void) | undefined;

  $: flat = tools.flat();
  $: attributes = {
    id,
    "aria-labelledby": `${id}-label`,
    "aria-describedby": [error ? `${id}-error` : "", `${id}-status`].filter(Boolean).join(" "),
    ...(error ? { "aria-invalid": "true" } : {}),
  } as Record<string, string>;
  $: live?.setText(value);
  $: live?.setAttributes(attributes);
  $: live?.setEditable(!readonly);
  $: listen(open);

  onMount(() => {
    mac = isMac(navigator.platform || navigator.userAgent);
    const editor = new LiveEditor(host, {
      doc: value,
      attributes,
      rows,
      maxLength,
      readOnly: readonly,
      placeholder,
      variableClass,
      extensions,
      onchange: (text) => {
        value = text;
        onchange?.(text);
      },
      onblur: () => onblur?.(),
      onkey: shortcut,
    });
    live = editor;
    return () => {
      editor.destroy();
      live = undefined;
    };
  });

  onDestroy(() => detach?.());

  function format(action: FormatAction) {
    if (live) live.apply(formatEdit(action, live.text(), live.selection()));
  }

  function insert(snippet: TextSnippet) {
    open = false;
    if (live) live.apply(insertEdit(live.selection(), snippet.text, snippet.pick));
  }

  function shortcut(event: KeyboardEvent): boolean {
    if (event.isComposing) return false;
    const action = shortcutAction(event, mac, flat);
    if (!action) return false;
    event.preventDefault();
    format(action);
    return true;
  }

  $: title = (entry: Tool): string => (entry.shortcut ? `${entry.label} (${shortcutLabel(entry.shortcut, mac)})` : entry.label);

  function keep(event: MouseEvent) {
    event.preventDefault();
  }

  function items(): HTMLElement[] {
    return menu ? Array.from(menu.querySelectorAll<HTMLElement>("[role=menuitem]")) : [];
  }

  function rove(event: KeyboardEvent) {
    if (menu?.contains(event.target as Node)) return;
    const all = bar ? Array.from(bar.querySelectorAll<HTMLElement>("[data-tool]")) : [];
    const index = all.indexOf(event.target as HTMLElement);
    if (index === -1) return;
    const next = ({ ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: all.length - 1 } as Record<string, number>)[event.key];
    if (next === undefined) return;
    event.preventDefault();
    current = (next + all.length) % all.length;
    all[current].focus();
  }

  async function show(focusFirst: boolean) {
    open = true;
    if (!focusFirst) return;
    await tick();
    items()[0]?.focus();
  }

  function hide(refocus: boolean) {
    open = false;
    if (refocus) trigger?.focus();
  }

  function menuKey(event: KeyboardEvent) {
    const all = items();
    const index = all.indexOf(event.target as HTMLElement);
    const focus = (next: number) => {
      event.preventDefault();
      all[(next + all.length) % all.length]?.focus();
    };
    switch (event.key) {
      case "ArrowDown":
        focus(index + 1);
        break;
      case "ArrowUp":
        focus(index - 1);
        break;
      case "Home":
        focus(0);
        break;
      case "End":
        focus(all.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        hide(true);
        break;
      case "Tab":
        hide(false);
        break;
    }
  }

  function listen(on: boolean) {
    detach?.();
    detach = undefined;
    if (!on) return;
    const away = (event: PointerEvent) => {
      if (!trigger?.parentElement?.contains(event.target as Node)) open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") open = false;
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", escape);
    detach = () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", escape);
    };
  }
</script>

{#snippet defaultGlyph(action: FormatAction)}
  {#if action === "bold"}
    <span class="text-editor-bold">B</span>
  {:else if action === "italic"}
    <span class="text-editor-italic">I</span>
  {:else if action === "underline"}
    <span class="text-editor-underline">U</span>
  {:else if action === "heading1"}
    <span class="text-editor-heading">H1</span>
  {:else if action === "heading2"}
    <span class="text-editor-heading">H2</span>
  {:else}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      {#if action === "bullet"}
        <path d="M9 6h11M9 12h11M9 18h11" />
        <path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" stroke-width="3" />
      {:else if action === "numbered"}
        <path d="M10 6h10M10 12h10M10 18h10" />
        <path d="M4 4.5 5 4v4M3.5 14.5c.5-1 2.5-1 2.5.5 0 1-2.5 2-2.5 3H6" stroke-width="1.5" />
      {:else if action === "quote"}
        <path d="M5 5v14M10 8h9M10 12h9M10 16h6" />
      {:else if action === "code"}
        <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
      {:else}
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="m10 10-2 2 2 2M14 10l2 2-2 2" />
      {/if}
    </svg>
  {/if}
{/snippet}

<div class={ify("field text-editor-field", className)}>
  <label id="{id}-label" for={id} class={ify(labelled ? "field-label" : "field-label-hidden", labelClass)}>{label}</label>
  <div class={ify("text-editor", error && "field-invalid", readonly && "text-editor-readonly", boxClass)}>
    {#if !readonly}
      <div
        bind:this={bar}
        role="toolbar"
        aria-label={toolbarLabel}
        aria-controls={id}
        tabindex="-1"
        onkeydown={rove}
        class={ify("text-editor-toolbar", toolbarClass)}
      >
        {#each tools as group, groupIndex (groupIndex)}
          {#if groupIndex > 0}<span aria-hidden="true" class={ify("text-editor-divider", dividerClass)}></span>{/if}
          {#each group as entry (entry.action)}
            {@const index = flat.indexOf(entry)}
            <button
              type="button"
              data-tool
              tabindex={index === current ? 0 : -1}
              aria-label={entry.label}
              aria-keyshortcuts={entry.shortcut ? ariaShortcut(entry.shortcut, mac) : undefined}
              title={title(entry)}
              class={ify("text-editor-tool", toolClass)}
              onmousedown={keep}
              onclick={() => format(entry.action)}
              onfocus={() => (current = index)}
            >
              {@render (glyph ?? defaultGlyph)(entry.action)}
            </button>
          {/each}
        {/each}
        {#if snippets.length > 0}
          <div class="text-editor-insert">
            <button
              bind:this={trigger}
              type="button"
              data-tool
              tabindex={current === flat.length ? 0 : -1}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={menuId}
              class={ify("text-editor-tool text-editor-insert-trigger", insertClass)}
              onmousedown={keep}
              onclick={(event) => (open ? hide(false) : void show(event.detail === 0))}
              onkeydown={(event) => {
                if (event.key !== "ArrowDown") return;
                event.preventDefault();
                void show(true);
              }}
              onfocus={() => (current = flat.length)}
            >
              <span class="text-editor-insert-label">{insertLabel}</span>
              <svg viewBox="0 0 24 24" class="text-editor-chevron" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div
              bind:this={menu}
              id={menuId}
              role="menu"
              aria-label={insertLabel}
              tabindex="-1"
              hidden={!open}
              onkeydown={menuKey}
              class={ify("text-editor-menu", menuClass)}
            >
              {#each snippets as snippet (snippet.text)}
                <button
                  type="button"
                  role="menuitem"
                  tabindex="-1"
                  class={ify("text-editor-menu-item", itemClass)}
                  onmousedown={keep}
                  onclick={() => insert(snippet)}
                >
                  {#if item}
                    {@render item(snippet)}
                  {:else}
                    <span class="text-editor-menu-label">{snippet.label}</span>
                    <span class="text-editor-menu-code">{snippet.text}</span>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
    <div bind:this={host} class={ify("text-editor-source", sourceClass)}></div>
  </div>
  {#if error}<p id="{id}-error" class={ify("field-error", errorClass)}>{error}</p>{/if}
  <p id="{id}-status" class={ify("text-editor-status", statusClass)}>{status(value, maxLength)}</p>
</div>
