import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { CHOOSING, CONVENTIONS, COMPONENTS, HELPERS, INTRO, RECIPES } from "./ai-guide.notes.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");

function scanStatement(text, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth--;
    else if (c === ";" && depth === 0) return i;
  }
  return text.length;
}

function splitTopLevel(text, test) {
  let depth = 0;
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if ("([{<".includes(c)) depth++;
    else if (")]}".includes(c) || (c === ">" && text[i - 1] !== "=")) depth--;
    else if (depth === 0 && test(c, i)) return i;
  }
  return -1;
}

const clean = (text) => text.replace(/\s+/g, " ").trim();

function svelteProps(source) {
  const scripts = [...source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
  const script = scripts.find((match) => !/\bmodule\b/.test(match[1]))?.[2] ?? "";
  const props = [];
  const locals = new Map();
  for (const match of script.matchAll(/(?:^|\n)\s*let\s+([A-Za-z_$][\w$]*)\s*:/g)) {
    const end = scanStatement(script, match.index + match[0].length);
    locals.set(match[1], clean(script.slice(match.index + match[0].length, end)));
  }
  for (const match of script.matchAll(/export\s+let\s+/g)) {
    const start = match.index + match[0].length;
    const statement = script.slice(start, scanStatement(script, start));
    const colon = splitTopLevel(statement, (c) => c === ":");
    const equals = splitTopLevel(statement, (c, i) => c === "=" && statement[i + 1] !== ">" && !"=!<>".includes(statement[i - 1]));
    const name = clean(statement.slice(0, colon === -1 ? (equals === -1 ? statement.length : equals) : colon));
    const type = colon === -1 ? "" : clean(statement.slice(colon + 1, equals === -1 ? statement.length : equals));
    const fallback = equals === -1 ? undefined : clean(statement.slice(equals + 1));
    const required = fallback === undefined;
    props.push({ name, type, required, default: fallback === "undefined" ? undefined : fallback });
  }
  for (const match of script.matchAll(/export\s*\{\s*([\w$]+)\s+as\s+([\w$]+)\s*\}/g)) {
    const local = locals.get(match[1]) ?? "";
    const equals = splitTopLevel(local, (c, i) => c === "=" && local[i + 1] !== ">");
    props.push({ name: match[2], type: clean(equals === -1 ? local : local.slice(0, equals)), required: false, bindable: true });
  }
  const events = [];
  const dispatcher = /createEventDispatcher<\{([\s\S]*?)\}>\(\)/.exec(script);
  if (dispatcher) {
    let depth = 0;
    const body = dispatcher[1];
    for (let i = 0; i < body.length; i++) {
      if ("([{<".includes(body[i])) depth++;
      else if (")]}>".includes(body[i])) depth--;
      else if (depth === 0) {
        const key = /^[\s;]*([\w$]+)\s*:/.exec(body.slice(i));
        if (key && (i === 0 || /[;\s{]/.test(body[i - 1]))) {
          if (!events.includes(key[1])) events.push(key[1]);
          i += key[0].length - 1;
        }
      }
    }
  }
  const markup = source.replace(/<script[\s\S]*?<\/script>/g, "");
  const slots = [...markup.matchAll(/<slot(?:\s+name="([^"]+)")?[^>]*\/?>/g)].map((slot) => slot[1] ?? "default");
  return { props, events, slots: [...new Set(slots)] };
}

function reactProgram(files) {
  const config = ts.getParsedCommandLineOfConfigFile(join(root, "packages/react/tsconfig.json"), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
  return ts.createProgram(files, { ...config.options, noEmit: true });
}

function largestBinding(file) {
  let best;
  const visit = (node) => {
    if (ts.isFunctionLike(node) && node.parameters?.[0] && ts.isObjectBindingPattern(node.parameters[0].name)) {
      const pattern = node.parameters[0].name;
      if (!best || pattern.elements.length > best.elements.length) best = pattern;
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  const defaults = new Map();
  for (const element of best?.elements ?? []) if (element.initializer) defaults.set(element.name.getText(file), clean(element.initializer.getText(file)));
  return defaults;
}

function reactProps(program, file) {
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(file);
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  const exported = moduleSymbol && checker.getExportsOfModule(moduleSymbol).find((symbol) => symbol.escapedName === "default");
  if (!exported) return null;
  const type = checker.getTypeOfSymbolAtLocation(exported, sourceFile);
  const signature = type.getCallSignatures()[0];
  const param = signature?.getParameters()[0];
  if (!param) return { props: [], forwardsRef: undefined, native: false };
  const propsType = checker.getTypeOfSymbolAtLocation(param, sourceFile);
  const defaults = largestBinding(sourceFile);
  const ownDir = join(root, "packages/react/src");
  const props = [];
  let native = false;
  let forwardsRef;
  for (const prop of propsType.getProperties()) {
    const declaration = prop.declarations?.[0];
    const fromHere = declaration?.getSourceFile().fileName.startsWith(ownDir);
    const name = prop.getName();
    if (name === "key") continue;
    if (name === "ref") {
      const refType = checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, sourceFile));
      forwardsRef = /Ref<([^>]+)>/.exec(refType)?.[1];
      continue;
    }
    if (!fromHere) {
      native = true;
      continue;
    }
    const optional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
    const propType = checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, sourceFile), undefined, ts.TypeFormatFlags.NoTruncation);
    props.push({ name, type: optional ? propType.replace(/ \| undefined$/, "") : propType, required: !optional, default: defaults.get(name) });
  }
  return { props, forwardsRef, native };
}

function propTable(props) {
  if (props.length === 0) return "_No props._\n";
  const cell = (text) => (text ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  return [
    "| Prop | Type | Default |",
    "| --- | --- | --- |",
    ...props.map((prop) => `| \`${prop.name}\`${prop.required ? " **(required)**" : ""} | \`${cell(prop.type) || "—"}\` | ${prop.default === undefined ? "" : `\`${cell(prop.default)}\``} |`)
  ].join("\n") + "\n";
}

function build(framework) {
  const pkg = JSON.parse(readFileSync(join(root, `packages/${framework}/package.json`), "utf8"));
  const exportsMap = pkg.exports;
  const program = framework === "react"
    ? reactProgram(COMPONENTS.map((component) => join(root, "packages/react/src", `${component.react}.tsx`)))
    : null;
  const components = COMPONENTS.map((component) => {
    const path = framework === "react" ? component.react : component.svelte;
    if (!exportsMap[`./${path}`]) throw new Error(`${pkg.name} has no export ./${path}`);
    const importPath = `${pkg.name}/${path}`;
    const extracted = framework === "react"
      ? reactProps(program, join(root, "packages/react/src", `${path}.tsx`))
      : svelteProps(readFileSync(join(root, "packages/svelte/src", `${path}.svelte`), "utf8"));
    return {
      name: component.name,
      import: `import ${component.name} from "${importPath}";`,
      summary: component.summary,
      css: component.css,
      ...extracted,
      example: component.example[framework],
      notes: [...(component.notes?.all ?? []), ...(component.notes?.[framework] ?? [])]
    };
  });
  const known = new Set(COMPONENTS.map((component) => `./${framework === "react" ? component.react : component.svelte}`));
  const helpers = HELPERS[framework];
  const generated = new Set(["./components.json", "./AI_GUIDE.md"]);
  const missing = Object.keys(exportsMap).filter((key) => !known.has(key) && !generated.has(key) && !helpers.some((helper) => helper.path === key.slice(2)));
  if (missing.length) throw new Error(`${pkg.name} exports not described in ai-guide.notes.mjs: ${missing.join(", ")}`);

  const lines = [];
  lines.push(`# ${pkg.name} — guide for AI assistants`, "");
  lines.push(`> Generated by \`npm run ai-guide\` from the component sources and \`scripts/ai-guide.notes.mjs\`. Do not edit by hand.`, "");
  lines.push(INTRO[framework], "");
  lines.push("## Conventions", "", ...CONVENTIONS.all.map((line) => `- ${line}`), ...CONVENTIONS[framework].map((line) => `- ${line}`), "");
  lines.push("## Choosing a component", "", "| You need | Use |", "| --- | --- |", ...CHOOSING.map(([need, use]) => `| ${need} | ${use} |`), "");
  lines.push("## Recipes", "");
  for (const [title, code] of RECIPES[framework]) lines.push(`### ${title}`, "", `\`\`\`${framework === "react" ? "tsx" : "svelte"}`, code, "```", "");
  lines.push("## Components", "", "| Component | Import path | What it is |", "| --- | --- | --- |");
  for (const component of components) lines.push(`| [${component.name}](#${component.name.toLowerCase()}) | \`${importPathOf(component)}\` | ${component.summary} |`);
  lines.push("", "## Helper modules", "");
  for (const helper of helpers) lines.push(`- \`${pkg.name}/${helper.path}\`: ${helper.summary}`);
  lines.push("");
  for (const component of components) {
    lines.push(`## ${component.name}`, "", component.summary, "", "```ts", component.import, "```", "");
    lines.push(`**Stylesheet:** ${component.css}`, "");
    if (component.forwardsRef) lines.push(`**Ref:** forwards a ref to \`${component.forwardsRef}\`.`, "");
    if (component.native) lines.push("**Also accepts** the native attributes of the underlying element; they are spread onto it.", "");
    lines.push("### Props", "", propTable(component.props));
    if (component.events?.length) lines.push(`**Events:** ${component.events.map((event) => `\`on:${event}\``).join(", ")}`, "");
    if (component.slots?.length) lines.push(`**Slots:** ${component.slots.map((slot) => `\`${slot}\``).join(", ")}`, "");
    if (component.props.some((prop) => prop.bindable)) lines.push(`**Bindable:** ${component.props.filter((prop) => prop.bindable).map((prop) => `\`bind:${prop.name}\``).join(", ")}`, "");
    if (component.notes.length) lines.push("### Notes", "", ...component.notes.map((note) => `- ${note}`), "");
    lines.push("### Example", "", `\`\`\`${framework === "react" ? "tsx" : "svelte"}`, component.example.trim(), "```", "");
  }
  return {
    markdown: lines.join("\n").replace(/\n{3,}/g, "\n\n"),
    json: JSON.stringify({ package: pkg.name, framework, conventions: [...CONVENTIONS.all, ...CONVENTIONS[framework]], choosing: CHOOSING.map(([need, use]) => ({ need, use })), recipes: RECIPES[framework].map(([title, code]) => ({ title, code })), components: components.map(({ import: _import, ...rest }) => ({ ...rest, importPath: importPathOf({ import: _import }) })), helpers }, null, 2) + "\n"
  };
}

function importPathOf(component) {
  return /from "([^"]+)"/.exec(component.import)[1];
}

let stale = false;
for (const framework of ["react", "svelte"]) {
  const { markdown, json } = build(framework);
  for (const [file, content] of [[`packages/${framework}/AI_GUIDE.md`, markdown], [`packages/${framework}/components.json`, json]]) {
    const path = join(root, file);
    const current = existsSync(path) ? readFileSync(path, "utf8") : "";
    if (current === content) continue;
    if (check) {
      stale = true;
      console.error(`${file} is out of date. Run npm run ai-guide.`);
    } else {
      writeFileSync(path, content);
      console.log(`wrote ${file}`);
    }
  }
}
if (stale) process.exit(1);
