export type Range = { start: number; end: number };
export type Edit = { from: number; to: number; insert: string; select: Range };

export type InlineStyle = "bold" | "italic" | "underline" | "code";
export type LineStyle = "heading1" | "heading2" | "bullet" | "numbered" | "quote";
export type FormatAction = InlineStyle | LineStyle | "codeblock";

export type Shortcut = { key: string; code?: string; shift?: boolean; alt?: boolean };
export type Tool = { action: FormatAction; label: string; shortcut?: Shortcut };
export type TextSnippet = { label: string; text: string; pick?: readonly [number, number] };

export const TOOL_GROUPS: ReadonlyArray<readonly Tool[]> = [
  [
    { action: "bold", label: "Bold", shortcut: { key: "B" } },
    { action: "italic", label: "Italic", shortcut: { key: "I" } },
    { action: "underline", label: "Underline", shortcut: { key: "U" } },
  ],
  [
    { action: "heading1", label: "Heading 1", shortcut: { key: "1", code: "Digit1", alt: true } },
    { action: "heading2", label: "Heading 2", shortcut: { key: "2", code: "Digit2", alt: true } },
  ],
  [
    { action: "bullet", label: "Bulleted list", shortcut: { key: "8", code: "Digit8", shift: true } },
    { action: "numbered", label: "Numbered list", shortcut: { key: "7", code: "Digit7", shift: true } },
    { action: "quote", label: "Quote", shortcut: { key: ".", code: "Period", shift: true } },
  ],
  [
    { action: "code", label: "Inline code", shortcut: { key: "E" } },
    { action: "codeblock", label: "Code block" },
  ],
];

export const TOOLS: readonly Tool[] = TOOL_GROUPS.flat();

export type KeyPress = {
  key: string;
  code: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  getModifierState?: (key: string) => boolean;
};

export function isMac(platform: string): boolean {
  return /Mac|iPhone|iPad|iPod/.test(platform);
}

function matches(press: KeyPress, shortcut: Shortcut, mac: boolean): boolean {
  const mod = mac ? press.metaKey && !press.ctrlKey : press.ctrlKey && !press.metaKey;
  if (!mod || press.getModifierState?.("AltGraph")) return false;
  else if (press.shiftKey !== Boolean(shortcut.shift) || press.altKey !== Boolean(shortcut.alt)) return false;
  else return shortcut.code ? press.code === shortcut.code : press.key.toUpperCase() === shortcut.key;
}

export function shortcutAction(press: KeyPress, mac: boolean, tools: readonly Tool[] = TOOLS): FormatAction | null {
  return tools.find((tool) => tool.shortcut && matches(press, tool.shortcut, mac))?.action ?? null;
}

export function shortcutLabel(shortcut: Shortcut, mac: boolean): string {
  if (mac) return `${shortcut.alt ? "⌥" : ""}${shortcut.shift ? "⇧" : ""}⌘${shortcut.key}`;
  else return ["Ctrl", shortcut.alt ? "Alt" : "", shortcut.shift ? "Shift" : "", shortcut.key].filter(Boolean).join("+");
}

export function ariaShortcut(shortcut: Shortcut, mac: boolean): string {
  return [mac ? "Meta" : "Control", shortcut.alt ? "Alt" : "", shortcut.shift ? "Shift" : "", shortcut.key]
    .filter(Boolean)
    .join("+");
}

export function editorStatus(text: string, maxLength: number | undefined): string {
  const used = text.length.toLocaleString();
  const characters = maxLength === undefined ? `${used} characters` : `${used} / ${maxLength.toLocaleString()} characters`;
  const lines = text === "" ? 0 : text.split("\n").length;
  return `${lines} ${lines === 1 ? "line" : "lines"} · ${characters}`;
}

const MARKERS: Readonly<Record<InlineStyle, readonly string[]>> = {
  bold: ["**", "__"],
  italic: ["_", "*"],
  underline: ["++"],
  code: ["`"],
};

const LINE_PREFIX = /^[ \t]*(?:>[ \t]?)*[ \t]*(?:(?:[-*+]|\d{1,9}[.)])[ \t]+)?(?:#{1,6}[ \t]+)?/;
const BULLET = /^([ \t]*)[-*+][ \t]+/;
const NUMBER = /^([ \t]*)\d{1,9}[.)][ \t]+/;
const LIST = /^([ \t]*)(?:[-*+]|\d{1,9}[.)])[ \t]+/;
const QUOTE = /^ {0,3}>[ \t]?/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+|$)/;
const FENCE = /^[ \t]*(?:`{3,}|~{3,})/;

function startOfLine(text: string, at: number): number {
  return at === 0 ? 0 : text.lastIndexOf("\n", at - 1) + 1;
}

function endOfLine(text: string, at: number): number {
  const end = text.indexOf("\n", at);
  return end === -1 ? text.length : end;
}

function trimmed(text: string, start: number, end: number): Range {
  let from = start;
  let to = end;
  while (from < to && /\s/.test(text[from])) from++;
  while (to > from && /\s/.test(text[to - 1])) to--;
  return { start: from, end: to };
}

function wrappedInside(text: string, start: number, end: number, marker: string): boolean {
  const size = marker.length;
  if (end - start <= size * 2 || !text.startsWith(marker, start) || !text.startsWith(marker, end - size)) return false;
  else return size > 1 || (text[start + 1] !== marker && text[end - 2] !== marker);
}

function wrappedOutside(text: string, start: number, end: number, marker: string): boolean {
  const size = marker.length;
  if (start < size || !text.startsWith(marker, start - size) || !text.startsWith(marker, end)) return false;
  else return size > 1 || (text[start - 2] !== marker && text[end + 1] !== marker);
}

function inlineLines(text: string, { start, end }: Range, markers: readonly string[]): Edit {
  const pieces: Range[] = [];
  for (let line = startOfLine(text, start); line <= end; ) {
    const lineEnd = endOfLine(text, line);
    const prefix = LINE_PREFIX.exec(text.slice(line, lineEnd))?.[0].length ?? 0;
    const piece = trimmed(text, Math.max(start, line + prefix), Math.min(end, lineEnd));
    if (piece.start < piece.end) pieces.push(piece);
    if (lineEnd >= end) break;
    line = lineEnd + 1;
  }
  const wrapper = (piece: Range) => markers.find((marker) => wrappedInside(text, piece.start, piece.end, marker));
  const unwrap = pieces.length > 0 && pieces.every((piece) => wrapper(piece) !== undefined);
  let insert = "";
  let cursor = start;
  for (const piece of pieces) {
    const body = text.slice(piece.start, piece.end);
    const marker = wrapper(piece);
    insert += text.slice(cursor, piece.start);
    if (unwrap && marker) insert += body.slice(marker.length, -marker.length);
    else insert += marker ? body : markers[0] + body + markers[0];
    cursor = piece.end;
  }
  insert += text.slice(cursor, end);
  return { from: start, to: end, insert, select: { start, end: start + insert.length } };
}

function inlineEdit(text: string, selection: Range, markers: readonly string[]): Edit {
  const { start, end } = selection;
  const [marker] = markers;
  if (start === end) {
    const pair = markers.find((candidate) => wrappedOutside(text, start, end, candidate));
    if (pair) {
      const at = start - pair.length;
      return { from: at, to: end + pair.length, insert: "", select: { start: at, end: at } };
    }
    const at = start + marker.length;
    return { from: start, to: end, insert: marker + marker, select: { start: at, end: at } };
  }
  if (text.slice(start, end).includes("\n")) return inlineLines(text, selection, markers);
  const inside = markers.find((candidate) => wrappedInside(text, start, end, candidate));
  if (inside) {
    const inner = text.slice(start + inside.length, end - inside.length);
    return { from: start, to: end, insert: inner, select: { start, end: start + inner.length } };
  }
  const outside = markers.find((candidate) => wrappedOutside(text, start, end, candidate));
  if (outside) {
    const size = outside.length;
    return { from: start - size, to: end + size, insert: text.slice(start, end), select: { start: start - size, end: end - size } };
  }
  const core = trimmed(text, start, end);
  if (core.start === core.end) {
    const at = end + marker.length;
    return { from: end, to: end, insert: marker + marker, select: { start: at, end: at } };
  }
  const body = text.slice(core.start, core.end);
  return {
    from: core.start,
    to: core.end,
    insert: marker + body + marker,
    select: { start: core.start + marker.length, end: core.end + marker.length },
  };
}

function lineRange(text: string, { start, end }: Range): { from: number; to: number } {
  const last = end > start && text[end - 1] === "\n" ? end - 1 : end;
  return { from: startOfLine(text, start), to: endOfLine(text, last) };
}

type LineChange = { drop: number; add: string };

function listChange(line: string, marker: string): LineChange {
  const list = LIST.exec(line);
  if (list) return { drop: list[0].length, add: list[1] + marker };
  const indent = /^[ \t]*/.exec(line)?.[0] ?? "";
  return { drop: indent.length, add: indent + marker };
}

function lineChanges(lines: string[], style: LineStyle): LineChange[] {
  const filled = lines.map((line) => line.trim() !== "");
  const targets = filled.some(Boolean) ? filled : lines.map(() => true);
  const keep: LineChange = { drop: 0, add: "" };
  const all = (test: (line: string) => boolean) => lines.every((line, index) => !targets[index] || test(line));
  switch (style) {
    case "bullet": {
      if (all((line) => BULLET.test(line))) {
        return lines.map((line, index) => {
          const found = targets[index] ? BULLET.exec(line) : null;
          return found ? { drop: found[0].length, add: found[1] } : keep;
        });
      }
      return lines.map((line, index) => (targets[index] ? listChange(line, "- ") : keep));
    }
    case "numbered": {
      if (all((line) => NUMBER.test(line))) {
        return lines.map((line, index) => {
          const found = targets[index] ? NUMBER.exec(line) : null;
          return found ? { drop: found[0].length, add: found[1] } : keep;
        });
      }
      let count = 0;
      return lines.map((line, index) => (targets[index] ? listChange(line, `${++count}. `) : keep));
    }
    case "quote": {
      if (all((line) => QUOTE.test(line))) {
        return lines.map((line) => {
          const found = QUOTE.exec(line);
          return found ? { drop: found[0].length, add: "" } : keep;
        });
      }
      return lines.map((_, index) => ({ drop: 0, add: targets[index] ? "> " : ">" }));
    }
    case "heading1":
    case "heading2": {
      const level = style === "heading1" ? 1 : 2;
      if (all((line) => HEADING.exec(line)?.[1].length === level)) {
        return lines.map((line, index) => {
          const found = targets[index] ? HEADING.exec(line) : null;
          return found ? { drop: found[0].length, add: "" } : keep;
        });
      }
      return lines.map((line, index) => {
        if (!targets[index]) return keep;
        return { drop: HEADING.exec(line)?.[0].length ?? 0, add: `${"#".repeat(level)} ` };
      });
    }
  }
}

function lineEdit(text: string, selection: Range, style: LineStyle): Edit {
  const { from, to } = lineRange(text, selection);
  const lines = text.slice(from, to).split("\n");
  const changes = lineChanges(lines, style);
  const rebuilt = lines.map((line, index) => changes[index].add + line.slice(changes[index].drop));
  const move = (at: number): number => {
    let oldStart = from;
    let newStart = from;
    for (let index = 0; index < lines.length; index++) {
      const oldEnd = oldStart + lines[index].length;
      if (at <= oldEnd || index === lines.length - 1) {
        const { drop, add } = changes[index];
        const column = at - oldStart;
        return newStart + (column >= drop ? column - drop + add.length : add.length);
      }
      oldStart = oldEnd + 1;
      newStart += rebuilt[index].length + 1;
    }
    return at;
  };
  return { from, to, insert: rebuilt.join("\n"), select: { start: move(selection.start), end: move(selection.end) } };
}

function blockEdit(text: string, selection: Range): Edit {
  const { from, to } = lineRange(text, selection);
  if (from > 0 && to < text.length) {
    const above = startOfLine(text, from - 1);
    const below = endOfLine(text, to + 1);
    if (FENCE.test(text.slice(above, from - 1)) && FENCE.test(text.slice(to + 1, below))) {
      const shift = from - above;
      return {
        from: above,
        to: below,
        insert: text.slice(from, to),
        select: { start: selection.start - shift, end: selection.end - shift },
      };
    }
  }
  const lines = text.slice(from, to).split("\n");
  if (lines.length >= 2 && FENCE.test(lines[0]) && FENCE.test(lines[lines.length - 1])) {
    const inner = lines.slice(1, -1).join("\n");
    return { from, to, insert: inner, select: { start: from, end: from + inner.length } };
  }
  const open = "```\n";
  return {
    from,
    to,
    insert: `${open}${text.slice(from, to)}\n\`\`\``,
    select: { start: selection.start + open.length, end: selection.end + open.length },
  };
}

export function formatEdit(action: FormatAction, text: string, selection: Range): Edit {
  switch (action) {
    case "bold":
    case "italic":
    case "underline":
      return inlineEdit(text, selection, MARKERS[action]);
    case "code":
      if (text.slice(selection.start, selection.end).includes("\n")) return blockEdit(text, selection);
      else return inlineEdit(text, selection, MARKERS.code);
    case "codeblock":
      return blockEdit(text, selection);
    default:
      return lineEdit(text, selection, action);
  }
}

export function insertEdit({ start, end }: Range, snippet: string, pick?: readonly [number, number]): Edit {
  const select = pick
    ? { start: start + pick[0], end: start + pick[1] }
    : { start: start + snippet.length, end: start + snippet.length };
  return { from: start, to: end, insert: snippet, select };
}
