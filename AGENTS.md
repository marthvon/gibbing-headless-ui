# Working in this repository

This monorepo holds two packages kept in parity: `packages/react` (`@marthvon/gibbing-headless-ui`) and `packages/svelte` (`@marthvon/gibbing-headless-ui-svelte`). Their styles live in the sibling `@marthvon/frontail` repository, in `@layer components`.

## Using the components

Read `packages/react/AI_GUIDE.md` or `packages/svelte/AI_GUIDE.md` first. They list every component, its props with types and defaults, the stylesheets it needs, and working examples. `demo/` renders every component in both frameworks (`npm run demo:react`, `npm run demo:svelte`).

## Keeping the guides current

- After adding, removing or changing a prop, run `npm run ai-guide` and commit the regenerated `AI_GUIDE.md` and `components.json` in both packages.
- A new component or export needs an entry in `scripts/ai-guide.notes.mjs` (summary, stylesheets, notes, an example per framework). The generator refuses to run while any export is undescribed.
- `npm run ai-guide:check` fails when the generated files are stale; `prepublishOnly` runs it in both packages.

## Component conventions

- Make the same change in both packages.
- Text pieces are configurable through render props / snippets with a default, typed `Content` when a plain string should keep the default element. Class props are only for containers.
- Svelte components use `export let` (legacy mode), not runes.
- Shared helpers go in `src/_internal/`; no single-use wrapper components.
- z-index only through frontail's scale (`--z-raised`, `--z-sticky`, `--z-backdrop`, `--z-popover`, `--z-modal`, `--z-toast`), never raw numbers.
- Never build a class name from pieces (`"tooltip-" + side`, `` `${type}-base` ``). Tailwind and purgers only keep classes written out in full, so a joined name either goes missing or forces every variant to ship. Write each class in full in a const enum in `presets.client.ts` (and its `presets.server.ts` twin), giving new components their own preset rather than deriving from another component's.
- Every component that renders a popup, menu, backdrop or dialog takes a `zIndex?: number` prop applied with `zLayer(zIndex)` on its root, so callers can stack it above whatever opened it (opener's value plus one). New overlay components must do the same.
