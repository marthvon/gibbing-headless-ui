import MarkdownIt from "markdown-it";
import type { Token } from "markdown-it";

export type Mark =
  | "marker"
  | "heading-marker"
  | "quote-marker"
  | "list-marker"
  | "block-marker"
  | "heading"
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "codeblock"
  | "link"
  | "variable";

export type Segment = { text: string; marks: readonly Mark[] };
export type Span = { from: number; to: number };
export type StyledSpan = Span & { className: string };
export type LivePlan = {
  marks: StyledSpan[];
  hidden: Span[];
  bullets: Span[];
  lines: Array<{ line: number; className: string }>;
};
export type VariableClass = (name: string) => string | undefined;

type LineKind = "fence" | "fence-marker" | "indented" | "rule" | "atx" | "setext";
type LineInfo = { quote: number; item: boolean; kind?: LineKind };

const md = new MarkdownIt({ html: false, linkify: false, breaks: true, typographer: false });

const QUOTE = /^ {0,3}> ?/;
const ITEM = /^[ \t]*(?:[-*+]|\d{1,9}[.)])(?=[ \t]|$)[ \t]*/;
const ATX = /^ {0,3}#{1,6}(?=[ \t]|$)[ \t]*/;
const ATX_CLOSE = /[ \t]+#+[ \t]*$/;
const ESCAPABLE = /[!-/:-@[-`{-~]/;
const SPACE = /\s/;
const WORD = /[\p{L}\p{N}]/u;
const LINK = /^!?\[([^[\]\n]*)\]\(([^()\s]*)(?:[ \t]+"[^"\n]*")?\)/;
const AUTOLINK = /^<(?:[a-zA-Z][a-zA-Z0-9+.-]{1,31}:[^<>\s]*|[^<>\s@]+@[^<>\s@]+)>/;
const LONG_LINE = 2000;

const DELIMITERS: ReadonlyArray<{ marker: string; mark: Mark }> = [
  { marker: "**", mark: "bold" },
  { marker: "__", mark: "bold" },
  { marker: "++", mark: "underline" },
  { marker: "~~", mark: "strike" },
  { marker: "*", mark: "italic" },
  { marker: "_", mark: "italic" },
];

const STYLES: Partial<Record<Mark, string>> = {
  heading: "cm-md-heading",
  bold: "cm-md-bold",
  italic: "cm-md-italic",
  underline: "cm-md-underline",
  strike: "cm-md-strike",
  code: "cm-md-code",
  link: "cm-md-link",
  variable: "cm-md-var",
};

const HIDDEN_WHEN_IDLE: ReadonlySet<Mark> = new Set(["marker", "heading-marker", "quote-marker"]);
const MARKER = "cm-md-marker";

function add(out: Segment[], text: string, marks: readonly Mark[]): void {
  if (text === "") return;
  const last = out.at(-1);
  if (last && last.marks.join() === marks.join() && !marks.includes("variable"))
    out[out.length - 1] = { text: last.text + text, marks: last.marks };
  else out.push({ text, marks });
}

function closesFence(line: string, markup: string): boolean {
  const bare = line.replace(/^(?: {0,3}> ?)*/, "").trim();
  return bare.length >= markup.length && [...bare].every((char) => char === markup[0]);
}

function lineInfo(lines: string[], tokens: Token[]): LineInfo[] {
  const info: LineInfo[] = lines.map(() => ({ quote: 0, item: false }));
  const span = (from: number, to: number, apply: (entry: LineInfo, line: number) => void) => {
    for (let line = from; line < Math.min(to, lines.length); line++) apply(info[line], line);
  };
  for (const token of tokens) {
    const map = token.map;
    if (!map || map[0] >= lines.length) continue;
    const [start, end] = map;
    switch (token.type) {
      case "blockquote_open":
        span(start, end, (entry) => entry.quote++);
        break;
      case "list_item_open":
        info[start].item = true;
        break;
      case "fence":
        span(start, end, (entry, line) => {
          const closing = line === end - 1 && line > start && closesFence(lines[line], token.markup);
          entry.kind = line === start || closing ? "fence-marker" : "fence";
        });
        break;
      case "code_block":
        span(start, end, (entry) => (entry.kind = "indented"));
        break;
      case "hr":
        info[start].kind = "rule";
        break;
      case "heading_open":
        if (token.markup.startsWith("#")) info[start].kind = "atx";
        else {
          span(start, end - 1, (entry) => (entry.kind = "setext"));
          if (end - 1 < lines.length) info[end - 1].kind = "rule";
        }
        break;
      case "table_open":
        if (start + 1 < lines.length) info[start + 1].kind = "rule";
        break;
    }
  }
  return info;
}

function backtickRun(text: string, at: number): number {
  let end = at;
  while (text[end] === "`") end++;
  return end - at;
}

function closingRun(text: string, from: number, size: number): number {
  for (let at = text.indexOf("`", from); at !== -1; at = text.indexOf("`", at)) {
    const run = backtickRun(text, at);
    if (run === size) return at;
    at += run;
  }
  return -1;
}

function closer(text: string, from: number, marker: string): number {
  for (let at = text.indexOf(marker, from); at !== -1; at = text.indexOf(marker, at + 1)) {
    if (SPACE.test(text[at - 1])) continue;
    if (marker.length === 1 && (text[at - 1] === marker || text[at + 1] === marker)) continue;
    if ((marker === "_" || marker === "__") && WORD.test(text[at + marker.length] ?? "")) continue;
    return at;
  }
  return -1;
}

function emphasis(text: string, at: number): { marker: string; mark: Mark; close: number } | null {
  for (const { marker, mark } of DELIMITERS) {
    if (!text.startsWith(marker, at)) continue;
    const next = text[at + marker.length];
    if (next === undefined || SPACE.test(next)) continue;
    if (marker.length === 1 && next === marker) continue;
    if ((marker === "_" || marker === "__") && WORD.test(text[at - 1] ?? "")) continue;
    const close = closer(text, at + marker.length + 1, marker);
    if (close !== -1) return { marker, mark, close };
  }
  return null;
}

function variablesOnly(text: string, marks: readonly Mark[], out: Segment[]): void {
  let plain = 0;
  for (let start = text.indexOf("{{"); start !== -1; start = text.indexOf("{{", plain)) {
    const close = text.indexOf("}}", start + 2);
    if (close === -1) break;
    add(out, text.slice(plain, start), marks);
    add(out, text.slice(start, close + 2), [...marks, "variable"]);
    plain = close + 2;
  }
  add(out, text.slice(plain), marks);
}

function inline(text: string, marks: readonly Mark[], out: Segment[]): void {
  if (text.length > LONG_LINE) {
    variablesOnly(text, marks, out);
    return;
  }
  let plain = 0;
  let at = 0;
  const take = (to: number, pieces: Array<[string, readonly Mark[]]>) => {
    add(out, text.slice(plain, at), marks);
    for (const [piece, extra] of pieces) add(out, piece, [...marks, ...extra]);
    at = to;
    plain = to;
  };
  while (at < text.length) {
    const char = text[at];
    if (char === "\\" && ESCAPABLE.test(text[at + 1] ?? "")) {
      take(at + 2, [["\\", ["marker"]], [text[at + 1], []]]);
      continue;
    }
    if (char === "{" && text[at + 1] === "{") {
      const close = text.indexOf("}}", at + 2);
      if (close !== -1) {
        take(close + 2, [[text.slice(at, close + 2), ["variable"]]]);
        continue;
      }
    }
    if (char === "`") {
      const size = backtickRun(text, at);
      const close = closingRun(text, at + size, size);
      if (close === -1) {
        at += size;
        continue;
      }
      take(close + size, [
        [text.slice(at, at + size), ["code", "marker"]],
        [text.slice(at + size, close), ["code"]],
        [text.slice(close, close + size), ["code", "marker"]],
      ]);
      continue;
    }
    if (char === "[" || (char === "!" && text[at + 1] === "[")) {
      const link = LINK.exec(text.slice(at));
      if (link) {
        const image = char === "!";
        if (image) take(at + link[0].length, [[link[0], ["marker"]]]);
        else {
          add(out, text.slice(plain, at), marks);
          add(out, "[", [...marks, "marker"]);
          inline(link[1], [...marks, "link"], out);
          add(out, link[0].slice(1 + link[1].length), [...marks, "marker"]);
          at += link[0].length;
          plain = at;
        }
        continue;
      }
    }
    if (char === "<") {
      const link = AUTOLINK.exec(text.slice(at));
      if (link) {
        take(at + link[0].length, [[link[0], ["link"]]]);
        continue;
      }
    }
    const pair = emphasis(text, at);
    if (pair) {
      const { marker, mark, close } = pair;
      add(out, text.slice(plain, at), marks);
      add(out, marker, [...marks, "marker"]);
      inline(text.slice(at + marker.length, close), [...marks, mark], out);
      add(out, marker, [...marks, "marker"]);
      at = close + marker.length;
      plain = at;
      continue;
    }
    at++;
  }
  add(out, text.slice(plain), marks);
}

function lineSegments(line: string, info: LineInfo): Segment[] {
  const out: Segment[] = [];
  let rest = line;
  for (let depth = 0; depth < info.quote; depth++) {
    const found = QUOTE.exec(rest);
    if (!found) break;
    add(out, found[0], ["quote-marker"]);
    rest = rest.slice(found[0].length);
  }
  switch (info.kind) {
    case "fence":
    case "indented":
      add(out, rest, ["codeblock"]);
      return out;
    case "fence-marker":
      add(out, rest, ["block-marker", "codeblock"]);
      return out;
    case "rule":
      add(out, rest, ["block-marker"]);
      return out;
  }
  if (info.item) {
    const found = ITEM.exec(rest);
    if (found) {
      add(out, found[0], ["list-marker"]);
      rest = rest.slice(found[0].length);
    }
  }
  if (info.kind === "atx") {
    const open = ATX.exec(rest);
    if (open) {
      add(out, open[0], ["heading-marker"]);
      rest = rest.slice(open[0].length);
    }
    const close = ATX_CLOSE.exec(rest);
    inline(close ? rest.slice(0, close.index) : rest, ["heading"], out);
    if (close) add(out, close[0], ["heading-marker"]);
    return out;
  }
  inline(rest, info.kind === "setext" ? ["heading"] : [], out);
  return out;
}

/** Decorations are offsets into the source, so the segments of each line must join back to exactly that line. */
export function highlightSource(source: string): Segment[][] {
  const lines = source.split("\n");
  const info = lineInfo(lines, md.parse(source, {}));
  return lines.map((line, index) => lineSegments(line, info[index]));
}

function headingLevel(lines: Segment[][], index: number): number {
  const opener = lines[index].find((segment) => segment.marks.includes("heading-marker"));
  if (opener) return Math.min(6, Math.max(1, opener.text.split("#").length - 1));
  for (let next = index + 1; next < lines.length; next++) {
    const underline = lines[next].find((segment) => segment.marks.includes("block-marker"))?.text.trim() ?? "";
    if (underline !== "") return underline.startsWith("=") ? 1 : 2;
  }
  return 2;
}

/** `active` holds the 0-based lines the cursor is on: their marks stay visible so they can be edited. */
export function livePlan(lines: Segment[][], active: ReadonlySet<number>, variableClass?: VariableClass): LivePlan {
  const plan: LivePlan = { marks: [], hidden: [], bullets: [], lines: [] };
  let offset = 0;
  lines.forEach((segments, line) => {
    const shown = active.has(line);
    const kinds = new Set(segments.flatMap((segment) => segment.marks));
    let at = offset;
    for (const { text, marks } of segments) {
      const span = { from: at, to: at + text.length };
      at = span.to;
      if (marks.some((mark) => HIDDEN_WHEN_IDLE.has(mark))) {
        if (shown) plan.marks.push({ ...span, className: MARKER });
        else plan.hidden.push(span);
      } else if (marks.includes("list-marker")) {
        const bullet = /[-*+]/.exec(text);
        if (bullet && !shown) plan.bullets.push({ from: span.from + bullet.index, to: span.from + bullet.index + 1 });
        else plan.marks.push({ ...span, className: MARKER });
      } else if (marks.includes("block-marker")) {
        plan.marks.push({ ...span, className: MARKER });
      } else {
        const extra = marks.includes("variable") ? variableClass?.(text.slice(2, -2).trim()) : undefined;
        const className = [...marks.flatMap((mark) => STYLES[mark] ?? []), extra ?? ""].filter(Boolean).join(" ");
        if (className) plan.marks.push({ ...span, className });
      }
    }
    const classes = [
      kinds.has("quote-marker") ? "cm-md-quote" : "",
      kinds.has("codeblock") ? "cm-md-codeblock" : "",
      kinds.has("heading") ? `cm-md-h${headingLevel(lines, line)}` : "",
    ].filter(Boolean);
    if (classes.length > 0) plan.lines.push({ line, className: classes.join(" ") });
    offset = at + 1;
  });
  return plan;
}
