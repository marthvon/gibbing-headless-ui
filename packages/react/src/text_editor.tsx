"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import type { Extension } from "@codemirror/state";
import {
  TOOL_GROUPS, ariaShortcut, editorStatus, formatEdit, insertEdit, isMac, shortcutAction, shortcutLabel,
  type FormatAction, type TextSnippet, type Tool
} from "./_internal/text_format";
import type { VariableClass } from "./_internal/text_highlight";
import { LiveEditor } from "./_internal/text_view";
import { ify } from "./utils";

export type { FormatAction, TextSnippet, Tool } from "./_internal/text_format";
export type { VariableClass } from "./_internal/text_highlight";
export { TOOL_GROUPS } from "./_internal/text_format";

export type TextEditorProps = {
  label: string;
  value?: string;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  readOnly?: boolean;
  labelled?: boolean;
  error?: string | null;
  tools?: ReadonlyArray<readonly Tool[]>;
  snippets?: readonly TextSnippet[];
  insertLabel?: string;
  toolbarLabel?: string;
  variableClass?: VariableClass;
  extensions?: Extension[];
  status?: (text: string, maxLength: number | undefined) => string;
  formId?: string;
  className?: string;
  labelClass?: string;
  boxClass?: string;
  toolbarClass?: string;
  toolClass?: string;
  dividerClass?: string;
  insertClass?: string;
  menuClass?: string;
  itemClass?: string;
  sourceClass?: string;
  errorClass?: string;
  statusClass?: string;
  glyph?: (action: FormatAction) => ReactNode;
  item?: (snippet: TextSnippet) => ReactNode;
  onChange?: (value: string) => void;
  onBlur?: () => void;
};

function keep(event: MouseEvent) {
  event.preventDefault();
}

function Glyph({ action }: { action: FormatAction }) {
  switch (action) {
    case "bold":
      return <span className="text-editor-bold">B</span>;
    case "italic":
      return <span className="text-editor-italic">I</span>;
    case "underline":
      return <span className="text-editor-underline">U</span>;
    case "heading1":
      return <span className="text-editor-heading">H1</span>;
    case "heading2":
      return <span className="text-editor-heading">H2</span>;
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {action === "bullet" ? (
        <>
          <path d="M9 6h11M9 12h11M9 18h11" />
          <path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" strokeWidth="3" />
        </>
      ) : action === "numbered" ? (
        <>
          <path d="M10 6h10M10 12h10M10 18h10" />
          <path d="M4 4.5 5 4v4M3.5 14.5c.5-1 2.5-1 2.5.5 0 1-2.5 2-2.5 3H6" strokeWidth="1.5" />
        </>
      ) : action === "quote" ? (
        <path d="M5 5v14M10 8h9M10 12h9M10 16h6" />
      ) : action === "code" ? (
        <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
      ) : (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m10 10-2 2 2 2M14 10l2 2-2 2" />
        </>
      )}
    </svg>
  );
}

export default function TextEditor({
  label, value, rows = 12, maxLength, placeholder, readOnly = false, labelled = true, error, tools = TOOL_GROUPS,
  snippets = [], insertLabel = "Insert", toolbarLabel = "Formatting", variableClass, extensions = [], status = editorStatus,
  formId, className, labelClass, boxClass, toolbarClass, toolClass, dividerClass, insertClass, menuClass, itemClass,
  sourceClass, errorClass, statusClass, glyph, item, onChange, onBlur
}: TextEditorProps) {
  const id = (formId ? `${formId}-` : "--tw-text-editor-") + useId();
  const menuId = `${id}-snippets`;
  const host = useRef<HTMLDivElement>(null);
  const live = useRef<LiveEditor | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const focusFirst = useRef(false);
  const [mac, setMac] = useState(false);
  const [typed, setTyped] = useState(value ?? "");
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const flat = tools.flat();
  const latest = useRef({ onChange, onBlur, mac, flat });
  latest.current = { onChange, onBlur, mac, flat };

  const describedBy = [error ? `${id}-error` : "", `${id}-status`].filter(Boolean).join(" ");
  const attributes: Record<string, string> = {
    id,
    "aria-labelledby": `${id}-label`,
    "aria-describedby": describedBy,
    ...(error ? { "aria-invalid": "true" } : {}),
  };

  function format(action: FormatAction) {
    const editor = live.current;
    if (editor) editor.apply(formatEdit(action, editor.text(), editor.selection()));
  }

  function insert(snippet: TextSnippet) {
    setOpen(false);
    const editor = live.current;
    if (editor) editor.apply(insertEdit(editor.selection(), snippet.text, snippet.pick));
  }

  function title(entry: Tool): string {
    return entry.shortcut ? `${entry.label} (${shortcutLabel(entry.shortcut, mac)})` : entry.label;
  }

  function items(): HTMLElement[] {
    return menu.current ? Array.from(menu.current.querySelectorAll<HTMLElement>("[role=menuitem]")) : [];
  }

  function rove(event: KeyboardEvent<HTMLDivElement>) {
    if (menu.current?.contains(event.target as Node)) return;
    const all = bar.current ? Array.from(bar.current.querySelectorAll<HTMLElement>("[data-tool]")) : [];
    const index = all.indexOf(event.target as HTMLElement);
    if (index === -1) return;
    const next = ({ ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: all.length - 1 } as Record<string, number>)[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = (next + all.length) % all.length;
    setCurrent(target);
    all[target].focus();
  }

  function show(first: boolean) {
    focusFirst.current = first;
    setOpen(true);
  }

  function hide(refocus: boolean) {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  }

  function menuKey(event: KeyboardEvent<HTMLDivElement>) {
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

  useEffect(() => {
    setMac(isMac(navigator.platform || navigator.userAgent));
    if (!host.current) return;
    const editor = new LiveEditor(host.current, {
      doc: value ?? "",
      attributes,
      rows,
      maxLength,
      readOnly,
      placeholder,
      variableClass,
      extensions,
      onchange: (text) => {
        setTyped(text);
        latest.current.onChange?.(text);
      },
      onblur: () => latest.current.onBlur?.(),
      onkey: (event) => {
        if (event.isComposing) return false;
        const action = shortcutAction(event, latest.current.mac, latest.current.flat);
        if (!action) return false;
        event.preventDefault();
        format(action);
        return true;
      },
    });
    live.current = editor;
    return () => {
      editor.destroy();
      live.current = null;
    };
  }, []);

  useEffect(() => {
    if (value !== undefined) live.current?.setText(value);
  }, [value]);

  useEffect(() => {
    live.current?.setAttributes(attributes);
  }, [id, describedBy, error]);

  useEffect(() => {
    live.current?.setEditable(!readOnly);
  }, [readOnly]);

  useEffect(() => {
    if (!open) return;
    if (focusFirst.current) {
      focusFirst.current = false;
      items()[0]?.focus();
    }
    const away = (event: PointerEvent) => {
      if (!trigger.current?.parentElement?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div className={ify("field text-editor-field", className)}>
      <label id={`${id}-label`} htmlFor={id} className={ify(labelled ? "field-label" : "field-label-hidden", labelClass)}>{label}</label>
      <div className={ify("text-editor", error && "field-invalid", readOnly && "text-editor-readonly", boxClass)}>
        {readOnly ? null : (
          <div ref={bar} role="toolbar" aria-label={toolbarLabel} aria-controls={id} tabIndex={-1} onKeyDown={rove} className={ify("text-editor-toolbar", toolbarClass)}>
            {tools.map((group, groupIndex) => [
              groupIndex > 0 ? <span key={`divider-${groupIndex}`} aria-hidden="true" className={ify("text-editor-divider", dividerClass)}></span> : null,
              ...group.map((entry) => {
                const index = flat.indexOf(entry);
                return (
                  <button
                    key={entry.action}
                    type="button"
                    data-tool
                    tabIndex={index === current ? 0 : -1}
                    aria-label={entry.label}
                    aria-keyshortcuts={entry.shortcut ? ariaShortcut(entry.shortcut, mac) : undefined}
                    title={title(entry)}
                    className={ify("text-editor-tool", toolClass)}
                    onMouseDown={keep}
                    onClick={() => format(entry.action)}
                    onFocus={() => setCurrent(index)}
                  >
                    {glyph ? glyph(entry.action) : <Glyph action={entry.action} />}
                  </button>
                );
              }),
            ])}
            {snippets.length > 0 ? (
              <div className="text-editor-insert">
                <button
                  ref={trigger}
                  type="button"
                  data-tool
                  tabIndex={current === flat.length ? 0 : -1}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  aria-controls={menuId}
                  className={ify("text-editor-tool text-editor-insert-trigger", insertClass)}
                  onMouseDown={keep}
                  onClick={(event) => (open ? hide(false) : show(event.detail === 0))}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowDown") return;
                    event.preventDefault();
                    show(true);
                  }}
                  onFocus={() => setCurrent(flat.length)}
                >
                  <span className="text-editor-insert-label">{insertLabel}</span>
                  <svg viewBox="0 0 24 24" className="text-editor-chevron" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div ref={menu} id={menuId} role="menu" aria-label={insertLabel} tabIndex={-1} hidden={!open} onKeyDown={menuKey} className={ify("text-editor-menu", menuClass)}>
                  {snippets.map((snippet) => (
                    <button
                      key={snippet.text}
                      type="button"
                      role="menuitem"
                      tabIndex={-1}
                      className={ify("text-editor-menu-item", itemClass)}
                      onMouseDown={keep}
                      onClick={() => insert(snippet)}
                    >
                      {item ? item(snippet) : (
                        <>
                          <span className="text-editor-menu-label">{snippet.label}</span>
                          <span className="text-editor-menu-code">{snippet.text}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
        <div ref={host} className={ify("text-editor-source", sourceClass)}></div>
      </div>
      {error ? <p id={`${id}-error`} className={ify("field-error", errorClass)}>{error}</p> : null}
      <p id={`${id}-status`} className={ify("text-editor-status", statusClass)}>{status(value ?? typed, maxLength)}</p>
    </div>
  );
}
