
# Gibbing-HeadLess-UI Component Library

**Author:** marthvon \<mamertvonn@gmail.com>

*"Gib [meaning: fasten (parts) together with a gib] React Components together into your webapp. Giving you HeadLessUI that you need."*

Package of Frontend Components using React <u>></u> 18.

> Note: Only works for TailwindCss versions <u>></u> 4.0

# Installation Guide

``` bash
npm install tailwindcss postcss postcss-import autoprefixer @marthvon/frontail --save-dev
npm install @marthvon/gibbing-headless-ui
```

# Configuration Setup 

## Frontail Styling Library Setup guide

Follow setup guide within this link <a href="https://www.npmjs.com/package/@marthvon/frontail">https://www.npmjs.com/package/@marthvon/frontail</a>

## Setup Tailwind

> tailwind.config.js
``` javascript
const config = {
  content: [
    // ...
    "./node_modules/@marthvon/gibbing-headless-ui/dist/**/*.{js,ts,jsx,tsx,mdx,css}"
  ] // ...
```

> global.css
``` css
@import '../../node_modules/@marthvon/frontail/components/index.css';
```
Optionally, import only what you need from components
> global.css
``` css
/* for example */
@import '../../node_modules/@marthvon/frontail/components/image_carousel.css';
@import '../../node_modules/@marthvon/frontail/components/slider.css';
```
Some components share stylesheets, so import these alongside their own:
- `select.css` needs `field.css` and `dropdown.css`
- `filter_row.css` needs `field.css`, plus `select.css` for Selects placed in the row
- `phone_field.css` needs `field.css`, `select.css` and `dropdown.css`, plus the stylesheet of any Textbox you pass as its `field`
- Textboxes with `secret` (and PasswordField, which wraps them) need `textbox.reveal.css` next to the textbox's own stylesheet
- `resource_table.css` needs `sort_heading.css` if you render SortHeading in its `sortHeading` slot
- `text_editor.css` needs `field.css`
- `tooltip.css` needs `dropdown.css`, imported before it
- ImageCarousel's `loader` needs `linear_loader.css`
- Textbox B and Textbox C both use `textbox.b.css`
- Popovers, backdrops and sticky headers use frontail's z-index scale (`--z-popover`, `--z-backdrop`, `--z-sticky` and so on). Import `utilities/layers.css` to use the same `z-*` utilities in your app; see frontail's README for the rules
- Dropdown, Select, DatePickerInput, PhoneField, Tooltip, ResourceTable and TextEditor take a `zIndex` prop for their popups and backdrop. When one opens from inside a dialog or another popup, pass the opener's z-index plus one (`Z` from `utils` holds the default scale), so stacked layers always open in the right order

TextEditor is built on CodeMirror and markdown-it, and QrCode on qrcode-generator. They are optional peer dependencies, so install them only for the components you use:
``` bash
npm install @codemirror/commands @codemirror/state @codemirror/view markdown-it   # TextEditor
npm install qrcode-generator                                                    # QrCode
```

## Optimizations: Style Inlining and Purge Unused TailwindCss

> tsconfig.json
``` json
{
  "compilerOptions": {
    // ...
    "preserveConstEnums": false,
    "isolatedModules": false,
    // ...
```

Alternatively, adhere to installation guide to setup the following
``` bash
npm install @fullhumam/postcss-purgecss --save-dev
```

### Presets Utilization for Customization

In use cases of Server-Side Rendering or Static Site Generation
``` typescript
import { /*...*/ } from "@marthvon/gibbing-headless-ui/presets.server";
```

When component is expected to be Client Side Rendered, instead use:
``` typescript
import { /*...*/ } from "@marthvon/gibbing-headless-ui/presets.client";
```
The above focuses on inlining the class name styles and avoids talwind compilation of unused component styles. In summary, **Avoids false positives when tailwind scans for css styles to compile (ideally, *experimental*)**.

# Components

- ImageCarousel
- GridView
- SmartGridView
- Card Modals
- Panels
- Textbox (A, B with a floating outlined label, C with a static outlined label)
- Slider
- DualSlider
- Digitbox
- Toggle
- Dropdown
- Select
- FilterRow
- SortHeading
- ResourceTable
- PasswordField
- PhoneField
- TextEditor
- Breadcrumbs
- FieldGuide
- FileViewer
- QrCode
- UploadPanel
- Searchbox *(later)*
- DatePicker
- DatePickerInput

# For AI assistants

Each package ships a generated guide for AI coding assistants:

- `node_modules/@marthvon/gibbing-headless-ui/AI_GUIDE.md` (React) and `node_modules/@marthvon/gibbing-headless-ui-svelte/AI_GUIDE.md` (Svelte): conventions, which component to choose, recipes, and every component's import path, stylesheets, props with types and defaults, notes and an example.
- `components.json` next to it holds the same data for tools. It is also exported, so `import guide from "@marthvon/gibbing-headless-ui/components.json"` works.

Point your assistant at the guide, for example with a line in your project's `AGENTS.md` or `CLAUDE.md`: *"Before using @marthvon/gibbing-headless-ui, read node_modules/@marthvon/gibbing-headless-ui/AI_GUIDE.md."*

The prop tables are generated from the component sources by `npm run ai-guide`; descriptions, notes and examples live in `scripts/ai-guide.notes.mjs`. `npm run ai-guide:check` fails when the guides are out of date, and publishing either package runs it.

# Demo

`demo/` holds a React app and a Svelte app that render every component at least once. Run them from the repository root:
``` bash
npm install --legacy-peer-deps
npm run demo:react    # http://localhost:5180
npm run demo:svelte   # http://localhost:5181
```
Both apps import the library from source, so edits to `packages/*/src` show up without a build. When the frontail repository is checked out next to this one (`../frontail`), the demos use it instead of the published package, so unreleased stylesheet changes are picked up too. `npm run check -w gibbing-demo-react` and `npm run check -w gibbing-demo-svelte` type-check the demo pages.
