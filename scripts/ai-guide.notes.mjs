export const INTRO = {
  react: `Headless React components (React 18+, Tailwind CSS 4+). The markup ships here and the styles ship in \`@marthvon/frontail\`. The Svelte twin, \`@marthvon/gibbing-headless-ui-svelte\`, has the same components with the same props.

Read **Conventions** and **Choosing a component** before you write code. Each component section then lists every prop with its type and default; these tables are generated from the source, so trust them over memory.`,
  svelte: `Headless Svelte 5 components (Tailwind CSS 4+). The markup ships here and the styles ship in \`@marthvon/frontail\`. The React twin, \`@marthvon/gibbing-headless-ui\`, has the same components with the same props.

Read **Conventions** and **Choosing a component** before you write code. Each component section then lists every prop with its type and default; these tables are generated from the source, so trust them over memory.`
};

export const CONVENTIONS = {
  all: [
    "**Styles come from frontail.** Import `@marthvon/frontail/components/index.css` once, or import only the stylesheets each component lists under **Stylesheet**, including the ones it depends on. Without them the components render unstyled.",
    "**Import frontail's utilities too.** Many components rely on its utility stylesheets (`utilities/layouts.css`, `modal.css`, `3d.css`, `animate.css`, `layers.css`, plus `theme/keyframes.css`). Import them all once next to the component stylesheets.",
    "**Class props are for containers only.** `className` styles the root and `xxxClass` props style named inner boxes. Text pieces are never styled by a class prop; replace them with a render prop / snippet instead.",
    "**`Content` props take a string or a render function.** Props typed `Content` (or `Content<[args]>`) accept a plain string, which keeps the default element and only changes its text, or a function / snippet, which replaces the element entirely and receives the listed arguments.",
    "**State is controlled by you.** Components report changes through callbacks and render what you pass back. Select, FilterRow, SortHeading and ResourceTable keep no copy of `value`, `values`, `query`, `sorts`, `page` or `selected`; update your state in the callback or nothing changes.",
    "**Ids.** `formId` prefixes generated ids so labels and error messages stay linked; every instance still gets a unique id, so repeating the same `label` is safe.",
    "**Presets are const enums.** `DropdownPreset`, `TooltipPreset`, `LoaderPreset`, `PanelPreset`, `CardPreset` and `Interact` come from the `presets.client` module. Each preset is a set of class names, so pass the enum member, never a string you typed yourself or built by joining pieces: Tailwind only keeps classes it finds written out in full.",
    "**Layering.** Popovers use `--z-popover` (50), their click-out backdrops `--z-backdrop` (40) and sticky headers `--z-sticky` (2). The `Z` export from `utils` holds the same scale.",
    "**`zIndex` for layers opened from other layers.** Dropdown, Select, DatePickerInput, PhoneField, Tooltip, ResourceTable and TextEditor take `zIndex`, which sets the popups and backdrop of that component (and of everything rendered inside it) to that value. When a component opens from inside a dialog or another popup, pass the opener's z-index plus one, e.g. `zIndex={Z.modal + 1}` inside a dialog at `Z.modal`, and keep counting up for each deeper level, so the newest layer is always on top. Never put a dropdown inside a parent with `transform`, `filter`, `opacity` below 1 or its own `z-index`, because that parent traps the popover underneath later content.",
    "**Optional peers.** TextEditor needs `@codemirror/commands`, `@codemirror/state`, `@codemirror/view` and `markdown-it`; QrCode needs `qrcode-generator`. Install them only if you use those components.",
  ],
  react: [
    "Callbacks are camelCase (`onChange`, `onToggle`, `onSelect`). Render props are functions returning `ReactNode`, for example `option={(option) => <b>{option.label}</b>}`.",
    "Where the Svelte package uses a named slot, React takes a prop of the same name: CardA and CardB `image`, Panel `modal`.",
    "Components are client components (`\"use client\"`). In server-rendered or static pages import presets from `presets.server`; on client-only pages `presets.client` lets the compiler inline the class names.",
    "Components that list **Ref** forward a ref to that element, so `ref` works like it does on the native element.",
  ],
  svelte: [
    "Components use Svelte 5 in legacy mode (`export let`), so they work in both runes and legacy apps.",
    "Callbacks are lowercase props (`onchange`, `ontoggle`, `onselect`). A few older components dispatch component events instead; those are listed under **Events** and are used as `on:change` and so on.",
    "Render props are snippets. Declare `{#snippet option(choice)}…{/snippet}` inside the component tag to pass it as the prop of the same name, or pass a snippet defined elsewhere as `option={mySnippet}`.",
    "Components with **Slots** take legacy slots: the default slot is the tag's children, and a named slot is filled with `<svelte:fragment slot=\"image\">…</svelte:fragment>`.",
    "Props listed under **Bindable**, plus `value` on TextboxB and TextboxC, work with `bind:`. Everything else is one-way; use the callbacks.",
  ]
};

export const CHOOSING = [
  ["A text field", "TextboxB (outlined, label floats onto the border) for most forms; TextboxC (outlined, label always on the border, allows a placeholder); TextboxA (filled, label below the box). All three become a textarea when `height` is above 3.25 (rem). TextboxB and C reserve a line for the error so the form never jumps."],
  ["A password, phone number or code", "PasswordField (`variant` a/b/c picks the textbox; or set `secret` on any Textbox), PhoneField (country dial code + number, stores digits only; pass a Textbox as `field` to match your form), Digitbox (one box per character, for OTP codes)."],
  ["Long formatted text", "TextEditor: a markdown editor with a toolbar and insertable `{{variables}}`."],
  ["Pick from a list", "Select for a form value (single or `multiple`). Dropdown only for a free-form menu of your own markup (actions, account menu); it has no value."],
  ["A date", "DatePickerInput for a form field that opens a calendar; DatePicker for an always-visible calendar."],
  ["A number in a range", "Slider for one value, DualSlider for a min/max pair. Both snap to `step` and keep their labels a fixed width."],
  ["An on/off switch", "Toggle."],
  ["Help text under a field", "FieldGuide: clips long text to `limit` and shows See more / See less only when it overflows."],
  ["A list of records", "ResourceTable (sorting, paging, selection, row actions, stacks into cards on narrow screens). Put a FilterRow above it for search and filters, and render SortHeading in its `sortHeading` slot."],
  ["Uploading files", "UploadPanel: drop zone, queue with progress, retry. You supply the actual `upload(file, progress)` function."],
  ["Previewing a file", "FileViewer: images, video, PDF, HTML, plain text, or a fallback card."],
  ["Images and media", "ImageCarousel (3D carousel with autoplay), GridView (masonry of your own tiles), SmartGridView (masonry that places tiles by aspect ratio and supports infinite scroll)."],
  ["Interactive cards", "CardA flips to its back on hover/click; CardB slides a gradient panel over an image."],
  ["A resizable drawer", "Panel: a side or bottom sheet the user drags to resize, optionally snapping to set sizes."],
  ["A hint on hover or focus", "Tooltip: wraps a trigger and shows `content` (a string or snippet) beside it on hover and keyboard focus. Use Dropdown instead when the popup must open on click."],
  ["Navigation and misc", "Breadcrumbs for a page trail; QrCode to render a scannable code as SVG."],
];

export const RECIPES = {
  react: [
    ["Searchable, sortable, paged table", `const [query, setQuery] = useState("");
const [sorts, setSorts] = useState<Sort[]>([]);
const [page, setPage] = useState(0);
const rows = filterSortAndSlice(people, query, sorts, page, 10);

<FilterRow id="people-search" query={query} onInput={setQuery} clearable={!!query} onClear={() => setQuery("")} placeholder="Search people" />
<ResourceTable
  columns={[{ key: "name", label: "Name" }, { key: "joined", label: "Joined", date: true }]}
  rows={rows}
  sorts={sorts}
  sortable={new Set(["name", "joined"])}
  sortHeading={(key, label) => <SortHeading sortKey={key} label={label} sorts={sorts} onSort={(k, d) => setSorts((s) => headerSort(s, k, d))} />}
  page={page} pages={pageCount} from={page * 10} to={page * 10 + rows.length} total={total} onPage={setPage}
/>`],
    ["A filter control inside FilterRow", `<FilterRow id="people" query={query} onInput={setQuery} sizes={[FILTER_SIZE]} applied={!!role}
  controls={(slot) => <Select label="Role" className="filter-slot" style={slot(0)} options={roles} value={role} clearable onChange={setRole} />} />`],
  ],
  svelte: [
    ["Searchable, sortable, paged table", `<FilterRow id="people-search" {query} oninput={(text) => (query = text)} clearable={!!query} onclear={() => (query = "")} placeholder="Search people" />
<ResourceTable
  columns={[{ key: "name", label: "Name" }, { key: "joined", label: "Joined", date: true }]}
  {rows}
  {sorts}
  sortable={new Set(["name", "joined"])}
  page={page} pages={pageCount} from={page * 10} to={page * 10 + rows.length} total={total} onpage={(next) => (page = next)}
>
  {#snippet sortHeading(key, label)}<SortHeading {key} {label} {sorts} onsort={(k, d) => (sorts = headerSort(sorts, k, d))} />{/snippet}
</ResourceTable>`],
    ["A filter control inside FilterRow", `<FilterRow id="people" {query} oninput={(text) => (query = text)} sizes={[FILTER_SIZE]} applied={!!role}>
  {#snippet controls(slot)}
    <Select label="Role" className="filter-slot" style={slot(0)} options={roles} value={role} clearable onchange={(value) => (role = value)} />
  {/snippet}
</FilterRow>`],
  ]
};

export const HELPERS = {
  react: [
    { path: "presets.client", summary: "`DropdownPreset` (TOP, BOTTOM, LEFT, RIGHT), `DropdownAnchor`, `PanelPreset` (TOP, BOTTOM, LEFT, RIGHT), `CardPreset` and `Interact` (HOVER, CLICK, HOVER_N_CLICK). Use on client-rendered pages." },
    { path: "presets.server", summary: "The same presets for server-rendered or statically generated pages." },
    { path: "sorts", summary: "`Sort`, `SortDirection` and `headerSort(sorts, key, direction, mode?)`, which returns the next sort list when a SortHeading arrow is clicked (clicking the active direction removes that sort)." },
    { path: "filters", summary: "`FilterSize` and the presets `SEARCH_SIZE`, `FILTER_SIZE`, `WIDE_SIZE`, `CLEAR_SIZE` for FilterRow's `sizes`." },
    { path: "phone", summary: "`DIAL_COUNTRIES`, `DialCountry`, `joinPhone`, `splitPhone`, `digitsOnly` and `phoneIssue(stored)` (returns an error message or null) for PhoneField values." },
    { path: "utils", summary: "`ify(...classes)` joins truthy class names; `Content` is the string-or-render-function prop type." },
  ],
  svelte: [
    { path: "presets.client", summary: "`DropdownPreset` (TOP, BOTTOM, LEFT, RIGHT), `DropdownAnchor`, `PanelPreset` (TOP, BOTTOM, LEFT, RIGHT), `CardPreset` and `Interact` (HOVER, CLICK, HOVER_N_CLICK)." },
    { path: "sorts", summary: "`Sort`, `SortDirection` and `headerSort(sorts, key, direction, mode?)`, which returns the next sort list when a SortHeading arrow is clicked (clicking the active direction removes that sort)." },
    { path: "filters", summary: "`FilterSize` and the presets `SEARCH_SIZE`, `FILTER_SIZE`, `WIDE_SIZE`, `CLEAR_SIZE` for FilterRow's `sizes`." },
    { path: "phone", summary: "`DIAL_COUNTRIES`, `DialCountry`, `joinPhone`, `splitPhone`, `digitsOnly` and `phoneIssue(stored)` (returns an error message or null) for PhoneField values." },
    { path: "types/DatePicker", summary: "`DayCtx`, `WeekdayCtx` and `HeadingCtx`, the arguments of DatePicker's `day`, `weekday` and `heading` snippets." },
    { path: "utils", summary: "`ify(...classes)` joins truthy class names; `Content` is the string-or-snippet prop type." },
  ]
};

const css = (...files) => files.map((file) => `\`${file}\``).join(", ");

export const COMPONENTS = [
  {
    name: "Breadcrumbs", react: "breadcrumbs", svelte: "Breadcrumbs",
    summary: "A trail of links to the current page. The last crumb is the current page and is not a link.",
    css: css("breadcrumbs.css"),
    notes: { all: ["`crumbs` is `{ label, href?, home? }[]`; `home: true` shows `homeIcon` before that crumb.", "`separator` and `homeIcon` accept text (\"/\", \"⌂\") or your own element."] },
    example: {
      react: `<Breadcrumbs separator="/" crumbs={[{ label: "Home", href: "/", home: true }, { label: "Clients", href: "/clients" }, { label: "Ada Lovelace" }]} />`,
      svelte: `<Breadcrumbs separator="/" crumbs={[{ label: "Home", href: "/", home: true }, { label: "Clients", href: "/clients" }, { label: "Ada Lovelace" }]} />`
    }
  },
  {
    name: "CardA", react: "card.a", svelte: "CardA",
    summary: "A card that flips from an image to a back face on hover, click, or both.",
    css: "frontail utilities `3d.css`, `layouts.css` and `modal.css`",
    notes: { all: ["Give the parent a fixed height; the card fills it.", "`interact` takes `Interact.HOVER`, `Interact.CLICK` or `Interact.HOVER_N_CLICK`."], svelte: ["The front goes in the `image` slot and the back in the default slot."] },
    example: {
      react: `<div className="h-40">
  <CardA interact={Interact.CLICK} className="h-full" cardClass="rounded-xl" image={<img src="/cover.jpg" alt="" className="h-full w-full rounded-xl object-cover" />}>
    <div className="flex h-full items-center justify-center rounded-xl bg-indigo-900 p-4 text-white">Back of the card</div>
  </CardA>
</div>`,
      svelte: `<div class="h-40">
  <CardA interact={Interact.CLICK} className="h-full" cardClass="rounded-xl">
    <svelte:fragment slot="image"><img src="/cover.jpg" alt="" class="h-full w-full rounded-xl object-cover" /></svelte:fragment>
    <div class="flex h-full items-center justify-center rounded-xl bg-indigo-900 p-4 text-white">Back of the card</div>
  </CardA>
</div>`
    }
  },
  {
    name: "CardB", react: "card.b", svelte: "CardB",
    summary: "An image card that slides a gradient panel with your content over it on hover.",
    css: "frontail utilities `modal.css` and `layouts.css`",
    notes: { all: ["`from_color` is the Tailwind gradient start, e.g. `from-indigo-900`.", "`preset` is a `CardPreset` member: TO_RIGHT, TO_LEFT, TO_TOP, TO_BOTTOM, or the `_AT_HALF` versions that stop half way."], svelte: ["The image goes in the `image` slot and the overlay content in the default slot."] },
    example: {
      react: `<CardB from_color="from-indigo-900" preset={CardPreset.TO_RIGHT} className="h-40 rounded-xl" image={<img src="/cover.jpg" alt="" className="h-full w-full object-cover" />}>
  <p className="p-4 text-white">Revealed on hover</p>
</CardB>`,
      svelte: `<CardB from_color="from-indigo-900" preset={CardPreset.TO_RIGHT} className="h-40 rounded-xl">
  <svelte:fragment slot="image"><img src="/cover.jpg" alt="" class="h-full w-full object-cover" /></svelte:fragment>
  <p class="p-4 text-white">Revealed on hover</p>
</CardB>`
    }
  },
  {
    name: "DatePicker", react: "date_picker", svelte: "DatePicker",
    summary: "An always-visible month calendar. Values are ISO dates (`YYYY-MM-DD`).",
    css: css("datepicker.css"),
    notes: { all: ["`locale` sets month and weekday names, e.g. `fr-FR`.", "Below 240px wide it switches to compact day labels; `dayMini` customises those.", "`day`, `weekday` and `heading` receive `DayCtx`, `WeekdayCtx` and `HeadingCtx` and replace those cells.", "`onChange` fires when a day is picked."] },
    example: {
      react: `<DatePicker label="Due date" formId="task" value={due} onChange={setDue} />`,
      svelte: `<DatePicker label="Due date" formId="task" value={due} onchange={(iso) => (due = iso)} />`
    }
  },
  {
    name: "DatePickerInput", react: "date_picker_input", svelte: "DatePickerInput",
    summary: "A text box that opens a DatePicker in a dropdown. Typing a valid `YYYY-MM-DD` also works; an impossible date reverts on blur.",
    css: css("datepicker.css", "dropdown.css") + ", the stylesheet of the text box (`textbox.a.css` by default) and frontail utilities `modal.css` and `layouts.css`",
    notes: { all: [
      "The text box is TextboxA by default. Pass `field` to use any Textbox instead: spread the props it receives (`formId`, `label`, `value`, `maxLength`, `guard` and the input/blur handlers) onto it, exactly like PhoneField's `field`.",
      "`preset={DropdownPreset.TOP}` opens the calendar above the box.",
      "Values are ISO dates; `onChange` fires when a day is picked or a valid date is typed.",
    ] },
    example: {
      react: `<DatePickerInput label="Start date" formId="booking" value={start} onChange={setStart} />
<DatePickerInput label="Due date" formId="task" value={due} onChange={setDue} field={(input) => <TextboxB {...input} />} />`,
      svelte: `<DatePickerInput label="Start date" formId="booking" value={start} onchange={(iso) => (start = iso)} />
<DatePickerInput label="Due date" formId="task" value={due} onchange={(iso) => (due = iso)}>
  {#snippet field(input)}<TextboxB {...input} />{/snippet}
</DatePickerInput>`
    }
  },
  {
    name: "Digitbox", react: "digitbox", svelte: "Digitbox",
    summary: "One box per character for verification codes. Focus moves to the next box as the user types.",
    css: css("digitbox.css"),
    notes: { all: ["With `name`, the combined value is submitted once under that name through a hidden input.", "`isNumeric={false}` allows letters.", "Boxes shrink to fit a narrow container."] },
    example: {
      react: `<form><Digitbox label="Code" formId="verify" name="code" digits={6} onChange={() => submit()} /></form>`,
      svelte: `<form><Digitbox label="Code" formId="verify" name="code" digits={6} on:change={() => submit()} /></form>`
    }
  },
  {
    name: "Dropdown", react: "dropdown", svelte: "Dropdown",
    summary: "A trigger that opens your own menu markup. It holds no value; use Select for form values.",
    css: css("dropdown.css") + " and frontail utilities `modal.css` and `layouts.css`",
    notes: { all: ["`preset` picks the direction (DropdownPreset.BOTTOM, TOP, LEFT, RIGHT); `interact` picks hover, click or both.", "`clickOut` adds a backdrop that closes the menu on an outside click (click mode only).", "Style the menu box with `innerModalClass`."], react: ["`menu` is an array of nodes; `children` is the trigger."], svelte: ["Pass the menu as a `menu` snippet; the tag's children are the trigger."] },
    example: {
      react: `<Dropdown preset={DropdownPreset.BOTTOM} interact={Interact.CLICK} clickOut innerModalClass="border border-zinc-200 p-1"
  menu={["Profile", "Sign out"].map((item) => <button key={item} className="block w-full px-3 py-1.5 text-left hover:bg-zinc-100">{item}</button>)}>
  <span className="field-box">Account</span>
</Dropdown>`,
      svelte: `<Dropdown preset={DropdownPreset.BOTTOM} interact={Interact.CLICK} clickOut innerModalClass="border border-zinc-200 p-1">
  {#snippet menu()}
    {#each ["Profile", "Sign out"] as item (item)}<button class="block w-full px-3 py-1.5 text-left hover:bg-zinc-100">{item}</button>{/each}
  {/snippet}
  <span class="field-box">Account</span>
</Dropdown>`
    }
  },
  {
    name: "DualSlider", react: "dual_slider", svelte: "DualSlider",
    summary: "A range slider with a minimum and a maximum thumb.",
    css: css("slider.css"),
    notes: { all: ["Values snap to `min + n × step` (default step 1) and are rounded to the step's decimals.", "`labelPos=\"o\"` shows the values outside the bar in fixed-width labels; `\"i\"` shows them inside the thumbs.", "`labelParse` formats the shown value, e.g. `(n) => `$${n}``.", "The current value is `\"min,max\"` on the hidden input (the ref)."], react: ["`onChange` receives that string when a drag ends."], svelte: ["`on:change` receives that string when a drag ends."] },
    example: {
      react: `<DualSlider label="Price" formId="filters" min={0} max={500} step={10} labelPos="o" labelParse={(n) => \`$\${n}\`} />`,
      svelte: `<DualSlider label="Price" formId="filters" min={0} max={500} step={10} labelPos="o" labelParse={(n) => \`$\${n}\`} />`
    }
  },
  {
    name: "FieldGuide", react: "field_guide", svelte: "FieldGuide",
    summary: "Help text for a field. Text taller than `limit` is clipped with a fade and an animated See more / See less toggle; shorter text shows in full with no toggle.",
    css: css("field_guide.css"),
    notes: { all: ["`limit` is in rem (default 3, about three lines).", "Overflow is measured by one shared ResizeObserver, so it is cheap to use many."] },
    example: {
      react: `<FieldGuide text="We send a confirmation link to this address. It expires after 24 hours." limit={2} expand="Read more" />`,
      svelte: `<FieldGuide text="We send a confirmation link to this address. It expires after 24 hours." limit={2} expand="Read more" />`
    }
  },
  {
    name: "FileViewer", react: "file_viewer", svelte: "FileViewer",
    summary: "Previews a file by type: image, video, PDF, HTML, text, or a fallback card for anything else.",
    css: css("file_viewer.css"),
    notes: { all: ["The kind is inferred from `type` (MIME) and `name`; pass `kind` to force it.", "Pass `content` to show text you already have without fetching `src`.", "`prev`/`next` with `onPrev`/`onNext` add arrows for browsing a list.", "Give it a sized parent; it fills it."] },
    example: {
      react: `<div className="h-80"><FileViewer src={file.url} name={file.name} type={file.mime} fallback="No preview for this file type." /></div>`,
      svelte: `<div class="h-80"><FileViewer src={file.url} name={file.name} type={file.mime} fallback="No preview for this file type." /></div>`
    }
  },
  {
    name: "FilterRow", react: "filter_row", svelte: "FilterRow",
    summary: "A search box plus filter controls that share one row and wrap behind a \"More filters\" toggle when space runs out.",
    css: css("filter_row.css", "field.css") + ", plus `select.css` for Selects in the row",
    notes: { all: ["`sizes` describes each control in `controls` (use the presets in the `filters` module); `controls(slot)` must give control `i` the class `filter-slot` and the style `slot(i)`. Without both the controls overlap the toggles.", "The More filters toggle only appears when the controls wrap past one line; FilterRow knows the width at which that happens from `sizes`, so it costs no layout measurement. A custom `toggle` should keep the `filter-toggle` class to get this.", "`applied` highlights the toggle; `clearable` + `onClear` shows a Clear button; `onRefresh` adds a refresh button and `refreshing` spins it.", "`id` must be unique on the page."] },
    example: {
      react: `<FilterRow id="people" query={query} onInput={setQuery} sizes={[FILTER_SIZE]} applied={!!role} clearable={!!query || !!role}
  onClear={() => { setQuery(""); setRole(""); }}
  controls={(slot) => <Select label="Role" className="filter-slot" style={slot(0)} options={roles} value={role} clearable onChange={setRole} />} />`,
      svelte: `<FilterRow id="people" {query} oninput={(text) => (query = text)} sizes={[FILTER_SIZE]} applied={!!role} clearable={!!query || !!role}
  onclear={() => { query = ""; role = ""; }}>
  {#snippet controls(slot)}
    <Select label="Role" className="filter-slot" style={slot(0)} options={roles} value={role} clearable onchange={(value) => (role = value)} />
  {/snippet}
</FilterRow>`
    }
  },
  {
    name: "GridView", react: "grid_view", svelte: "GridView",
    summary: "A masonry grid of your own tiles, kept in order across columns.",
    css: css("grid_view.css"),
    notes: { all: ["Columns follow the container width (1 below 28rem, up to 7 when very wide); `columns` forces a count."], react: ["`childrens` is a record of key → node.", "`onScrollEnd` fires when the user scrolls to the bottom, for infinite loading."], svelte: ["`childrens` is an array of `[key, snippet]`."] },
    example: {
      react: `<GridView className="h-96" cardClass="rounded-lg" childrens={Object.fromEntries(photos.map((photo) => [photo.id, <img src={photo.url} alt="" className="rounded-lg" />]))} />`,
      svelte: `{#snippet tile()}<div class="h-24 rounded-lg bg-indigo-200"></div>{/snippet}
<GridView className="h-96" cardClass="rounded-lg" childrens={[["a", tile], ["b", tile]]} />`
    }
  },
  {
    name: "ImageCarousel", react: "image_carousel", svelte: "ImageCarousel",
    summary: "A 3D carousel with arrows, optional autoplay, dot indicators and a progress loader.",
    css: css("image_carousel.css") + ", plus `linear_loader.css` for `loader`, and frontail utilities `3d.css`, `layouts.css` and `modal.css`",
    notes: { all: ["Slides need an intrinsic width (an image, or a box like `w-96 max-w-full`); `w-full` slides collapse.", "Side slides are pushed about 250px outward, so give it a full-width row, not a narrow column.", "`timeout` (seconds) enables autoplay; `cursor_color` enables the arrows and colours them.", "`loader` paints a bar that fills over `timeout` seconds and restarts on every slide change; `fill_color` colours the bar and `empty_color` the track; `preset` (LoaderPreset, LINEAR by default) picks the loader style. Clicking it pauses or resumes autoplay."] },
    example: {
      react: `<div className="h-56"><ImageCarousel timeout={4} className="h-full" cursor_color="text-zinc-700" indicators={{ indicated_color: "bg-indigo-600", dormant_color: "bg-zinc-300" }}
  images={photos.map((photo) => [photo.id, <img src={photo.url} alt="" className="h-full rounded-xl" />])} /></div>`,
      svelte: `{#snippet first()}<img src="/a.jpg" alt="" class="h-full rounded-xl" />{/snippet}
{#snippet second()}<img src="/b.jpg" alt="" class="h-full rounded-xl" />{/snippet}
<div class="h-56"><ImageCarousel timeout={4} className="h-full" cursor_color="text-zinc-700" indicators={{ indicated_color: "bg-indigo-600", dormant_color: "bg-zinc-300" }} images={[["a", first], ["b", second]]} /></div>`
    }
  },
  {
    name: "Panel", react: "panel", svelte: "Panel",
    summary: "A drawer over your content that the user drags to resize, from the top, bottom, left or right.",
    css: css("panel.css") + " and frontail utilities `layouts.css`",
    notes: { all: ["Put it in a positioned parent with a fixed height; it fills it.", "`default_ratio` is a CSS size (`\"40%\"`) or the index of a lock point in `ratio`.", "`ratio` alternates bounds, comparators and lock points: `[0, \"<=\", 0.25, \"<\", 0.5, \"<=\", 0.75, \"<=\", 1]` snaps to 25% below half and 75% above it; `\"x\"` as a lock point means stay where dropped."], svelte: ["Main content is the default slot; the drawer content is the `modal` slot."] },
    example: {
      react: `<div className="relative h-96">
  <Panel preset={PanelPreset.BOTTOM} default_ratio="40%" modalClass="bg-white" modal={<p className="p-4">Details</p>}>
    <main className="h-full p-4">Main content</main>
  </Panel>
</div>`,
      svelte: `<div class="relative h-96">
  <Panel preset={PanelPreset.BOTTOM} default_ratio="40%" modalClass="bg-white">
    <main class="h-full p-4">Main content</main>
    <svelte:fragment slot="modal"><p class="p-4">Details</p></svelte:fragment>
  </Panel>
</div>`
    }
  },
  {
    name: "PasswordField", react: "password_field", svelte: "PasswordField",
    summary: "A password field: a thin wrapper that renders TextboxA, B or C (`variant`) with `secret` on, password autocomplete and a 64-character limit.",
    css: "the chosen textbox's stylesheet (`textbox.a.css` or `textbox.b.css`) plus `textbox.reveal.css`",
    notes: { all: [
      "Everything else is passed to the textbox, so its props (`error`, `formId`, `showIcon`, `hideIcon`, `revealed`, `boxClass`, …) work here too.",
      "Use `autoComplete=\"new-password\"` (Svelte: `autocomplete`) on sign-up and change-password forms.",
      "For a show/hide toggle on any other field, set `secret` on the textbox directly.",
    ], svelte: ["`onchange` receives the new value; `bind:revealed` tracks whether it is shown."], react: ["`onChange` receives the new value as a string."] },
    example: {
      react: `<PasswordField variant="b" label="Password" formId="signup" autoComplete="new-password" value={password} error={issue} onChange={setPassword} />`,
      svelte: `<PasswordField variant="b" label="Password" formId="signup" autocomplete="new-password" value={password} error={issue} onchange={(value) => (password = value)} />`
    }
  },
  {
    name: "PhoneField", react: "phone_field", svelte: "PhoneField",
    summary: "A country dial-code picker with flags plus a number box. The value is digits only, dial code first (`61412345678`).",
    css: css("phone_field.css", "field.css", "select.css", "dropdown.css") + ", plus the stylesheet of any Textbox passed as `field`",
    notes: { all: [
      "By default the number box is a plain rounded input with the label above and the error below.",
      "Pass `field` to render the number box with any Textbox instead: spread the props it receives (`label`, `value`, `error`, `maxLength`, `mode`, autocomplete and the input/blur handlers) onto the textbox. The textbox then shows the label and error, and the country picker restyles itself to match TextboxA, B or C.",
      "The country menu opens above by default; pass `preset={DropdownPreset.BOTTOM}` near the top of a page.",
      "Validate with `phoneIssue(value)` from the `phone` module; `countries` limits or reorders the list.",
    ] },
    example: {
      react: `<PhoneField label="Phone" formId="contact" value={phone} error={phoneIssue(phone)} onChange={setPhone} />
<PhoneField label="Mobile" formId="contact" value={mobile} onChange={setMobile} field={(input) => <TextboxB {...input} />} />`,
      svelte: `<PhoneField label="Phone" formId="contact" value={phone} error={phoneIssue(phone)} onchange={(value) => (phone = value)} />
<PhoneField label="Mobile" formId="contact" value={mobile} onchange={(value) => (mobile = value)}>
  {#snippet field(input)}<TextboxB {...input} />{/snippet}
</PhoneField>`
    }
  },
  {
    name: "QrCode", react: "qr_code", svelte: "QrCode",
    summary: "Renders text or a URL as a scalable QR code SVG.",
    css: css("qr_code.css"),
    notes: { all: ["Needs the `qrcode-generator` peer dependency.", "Size it with `className` (e.g. `w-40`).", "`level` is error correction (L, M, Q, H); `quiet` is the margin in modules."] },
    example: {
      react: `<QrCode value="https://example.com/invite/42" label="Invite link" className="w-40" />`,
      svelte: `<QrCode value="https://example.com/invite/42" label="Invite link" className="w-40" />`
    }
  },
  {
    name: "ResourceTable", react: "resource_table", svelte: "ResourceTable",
    summary: "A data table with sorting, paging, selection, status pills and row actions. Below a container width it turns each row into a card.",
    css: css("resource_table.css") + ", plus `sort_heading.css` when you render SortHeading",
    notes: { all: [
      "Rows need an `id` string. `columns` is `{ key, label, date? }[]`; cells show `row[key]` unless `cell` returns other text.",
      "Fully controlled: pass `sorts`, `page`, `pages`, `from`, `to`, `total`, `pageSize` and `selected`, and update them in the callbacks. Do the sorting, filtering and slicing yourself.",
      "`stackAt` is the container width in rem below which rows become cards (24 to 112 in steps of 8). The default is at least 80, so tables in narrow layouts stack; lower it to keep a table.",
      "`actions(row)` returns `{ id, label, tone?, run }[]`. Add `menu` to show them behind a ⋯ button; without it they render as inline links, which suits one or two actions.",
      "`status(row)` adds a pill column; `busy` shows `loading`; no rows shows `empty`.",
      "`fill` makes the table fill a fixed-height parent with a sticky header.",
    ] },
    example: {
      react: `<ResourceTable
  stackAt={40}
  columns={[{ key: "name", label: "Name" }, { key: "joined", label: "Joined", date: true }]}
  rows={rows}
  status={(row) => ({ label: row.active ? "Active" : "Away", tone: row.active ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600" })}
  menu
  actions={(row) => [{ id: "edit", label: "Edit", run: () => edit(row) }, { id: "delete", label: "Delete", tone: "danger", run: () => remove(row) }]}
  sorts={sorts} sortable={new Set(["name", "joined"])}
  sortHeading={(key, label) => <SortHeading sortKey={key} label={label} sorts={sorts} onSort={(k, d) => setSorts((s) => headerSort(s, k, d))} />}
  selectable selected={selected} onSelect={toggleRow} onSelectPage={(on) => setSelected(on ? new Set(rows.map((r) => r.id)) : new Set())}
  page={page} pages={pages} from={from} to={from + rows.length} total={total} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize}
/>`,
      svelte: `<ResourceTable
  stackAt={40}
  columns={[{ key: "name", label: "Name" }, { key: "joined", label: "Joined", date: true }]}
  {rows}
  status={(row) => ({ label: row.active ? "Active" : "Away", tone: row.active ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600" })}
  menu
  actions={(row) => [{ id: "edit", label: "Edit", run: () => edit(row) }, { id: "delete", label: "Delete", tone: "danger", run: () => remove(row) }]}
  {sorts} sortable={new Set(["name", "joined"])}
  selectable {selected} onselect={toggleRow}
  {page} {pages} {from} to={from + rows.length} {total} {pageSize} onpage={(next) => (page = next)} onpagesize={(size) => (pageSize = size)}
>
  {#snippet sortHeading(key, label)}<SortHeading {key} {label} {sorts} onsort={(k, d) => (sorts = headerSort(sorts, k, d))} />{/snippet}
</ResourceTable>`
    }
  },
  {
    name: "Select", react: "select", svelte: "Select",
    summary: "A labelled select with a custom menu, single or multiple, with an optional clear option and error line.",
    css: css("select.css", "field.css", "dropdown.css") + " and frontail utilities `modal.css` and `layouts.css`",
    notes: { all: [
      "Single: `value` + `onChange`. Multiple: `multiple`, `values` + `onToggle(value)`, and `summary` for the closed text (e.g. \"2 selected\").",
      "`clearable` adds a first option that sets the value to \"\" and shows `placeholder`.",
      "`option` renders each option and the selected value; `chevron` replaces the arrow; `labelled={false}` hides the label and error.",
      "`preset={DropdownPreset.TOP}` opens the menu above.",
    ] },
    example: {
      react: `<Select label="Fruit" options={[{ value: "apple", label: "Apple" }, { value: "pear", label: "Pear" }]} value={fruit} placeholder="Pick one" clearable onChange={setFruit} />`,
      svelte: `<Select label="Fruit" options={[{ value: "apple", label: "Apple" }, { value: "pear", label: "Pear" }]} value={fruit} placeholder="Pick one" clearable onchange={(value) => (fruit = value)} />`
    }
  },
  {
    name: "Slider", react: "slider", svelte: "Slider",
    summary: "A single-value slider built on a native range input.",
    css: css("slider.css"),
    notes: { all: ["`labelPos` is `\"l\"`, `\"r\"` (fixed-width label beside the bar) or `\"i\"` (inside the thumb).", "`defaultValue` sets the start; it is uncontrolled after that, so read changes from the input/change events.", "`labelParse` formats the label."] },
    example: {
      react: `<Slider label="Volume" formId="audio" max={100} defaultValue={40} labelPos="r" onChange={(event) => setVolume(Number(event.currentTarget.value))} />`,
      svelte: `<Slider label="Volume" formId="audio" max={100} defaultValue={40} labelPos="r" on:change={(event) => (volume = Number(event.detail.currentTarget.value))} />`
    }
  },
  {
    name: "SmartGridView", react: "smart_grid_view", svelte: "SmartGridView",
    summary: "A masonry grid that places tiles by their aspect ratio to keep columns even, with infinite scroll.",
    css: css("smart_grid_view.css"),
    notes: { all: ["Each tile carries a height ratio (height ÷ width) used for placement.", "`columns` fixes the column count; otherwise it adapts to width.", "`onScrollEnd` fires within `threshold` px of the bottom; set `loading` while fetching to show `template` placeholders."], react: ["`images` is a record of key → `[ratio, node]`."], svelte: ["`images` is an array of `[key, ratio, snippet]`."] },
    example: {
      react: `<SmartGridView className="h-96" columns={3} images={Object.fromEntries(photos.map((photo) => [photo.id, [photo.height / photo.width, <img src={photo.url} alt="" />]]))} onScrollEnd={loadMore} />`,
      svelte: `{#snippet tile()}<div class="h-24 rounded-lg bg-sky-200"></div>{/snippet}
<SmartGridView className="h-96" columns={3} images={[["a", 1, tile], ["b", 1.5, tile]]} onScrollEnd={loadMore} />`
    }
  },
  {
    name: "SortHeading", react: "sort_heading", svelte: "SortHeading",
    summary: "A column heading with ascending and descending arrows that shows its rank in a multi-column sort.",
    css: css("sort_heading.css"),
    notes: { all: ["Pair it with `headerSort` from the `sorts` module to compute the next `sorts`.", "Usually rendered through ResourceTable's `sortHeading` slot; it also works in any `<th>`."], react: ["The column key prop is `sortKey` (React reserves `key`)."], svelte: ["The column key prop is `key`."] },
    example: {
      react: `<th><SortHeading sortKey="name" label="Name" sorts={sorts} onSort={(key, direction) => setSorts((s) => headerSort(s, key, direction))} /></th>`,
      svelte: `<th><SortHeading key="name" label="Name" {sorts} onsort={(key, direction) => (sorts = headerSort(sorts, key, direction))} /></th>`
    }
  },
  {
    name: "TextEditor", react: "text_editor", svelte: "TextEditor",
    summary: "A markdown editor (CodeMirror) with a formatting toolbar, live styling, a character counter and insertable snippets such as `{{first_name}}`.",
    css: css("text_editor.css", "field.css"),
    notes: { all: ["Needs the CodeMirror and markdown-it peer dependencies.", "The value is markdown text.", "`snippets` (`{ label, text }[]`) fills the Insert menu; `variableClass(name)` styles `{{name}}` tokens, e.g. to flag unknown variables.", "`tools` limits the toolbar groups; `rows` sets the height in lines."], react: ["Read-only is `readOnly`."], svelte: ["Read-only is `readonly`."] },
    example: {
      react: `<TextEditor label="Message" formId="email" value={body} onChange={setBody} maxLength={2000} snippets={[{ label: "First name", text: "{{first_name}}" }]} />`,
      svelte: `<TextEditor label="Message" formId="email" value={body} onchange={(value) => (body = value)} maxLength={2000} snippets={[{ label: "First name", text: "{{first_name}}" }]} />`
    }
  },
  {
    name: "TextboxA", react: "textbox.a", svelte: "TextboxA",
    summary: "A filled text field with the label below it; becomes a textarea when `height` is above 3.25.",
    css: css("textbox.a.css"),
    notes: { all: ["`guard` is a RegExp the whole value must match; keystrokes that break it are rejected (e.g. `/^\\d{0,5}$/`).", "`mode` sets the keyboard and input type (email, tel, numeric, decimal, …).", "`height` is in rem; `wrap` lets long lines wrap.", "`secret` makes it a password input with a show/hide button (needs `textbox.reveal.css`); `showIcon` / `hideIcon` take text or an icon, and `revealed` is the shown state (Svelte: `bind:revealed`; React: `revealed` + `onReveal`, or leave it uncontrolled)."], svelte: ["Supports `bind:value`."] },
    example: {
      react: `<TextboxA label="Postcode" formId="address" mode="numeric" guard={/^\\d{0,5}$/} maxLength={5} />`,
      svelte: `<TextboxA label="Postcode" formId="address" mode="numeric" guard={/^\\d{0,5}$/} maxLength={5} />`
    }
  },
  {
    name: "TextboxB", react: "textbox.b", svelte: "TextboxB",
    summary: "An outlined text field whose label sits inside until focus or input, then floats onto the top border. A line under it is always reserved for the error so the layout never jumps.",
    css: css("textbox.b.css"),
    notes: { all: ["The label and border-gap use the container background (`bg-inherit`); set `className` with a `bg-*` when the field sits on a coloured surface.", "No placeholder: the label plays that role. Use TextboxC if you need one.", "`caption` replaces the label and `message` the error line.", "`secret` adds a password show/hide button, exactly as on TextboxA."], svelte: ["Supports `bind:value`."] },
    example: {
      react: `<TextboxB label="Email" formId="signup" mode="email" value={email} error={emailError} onChange={(event) => setEmail(event.currentTarget.value)} />`,
      svelte: `<TextboxB label="Email" formId="signup" mode="email" bind:value={email} error={emailError} />`
    }
  },
  {
    name: "TextboxC", react: "textbox.c", svelte: "TextboxC",
    summary: "The same outlined field as TextboxB, but the label always sits on the border and a placeholder is allowed.",
    css: css("textbox.b.css"),
    notes: { all: ["Shares `textbox.b.css` with TextboxB.", "`secret` adds a password show/hide button, exactly as on TextboxA."], svelte: ["Supports `bind:value`."] },
    example: {
      react: `<TextboxC label="Address" formId="checkout" placeholder="Street, city, postcode" height={6} wrap />`,
      svelte: `<TextboxC label="Address" formId="checkout" placeholder="Street, city, postcode" height={6} wrap bind:value={address} />`
    }
  },
  {
    name: "Toggle", react: "toggle", svelte: "Toggle",
    summary: "An on/off switch backed by a checkbox.",
    css: css("toggle.css"),
    notes: { all: ["Colour the on state with `trackClass=\"peer-checked:bg-indigo-600\"`.", "The checkbox's `value` is \"true\" or \"false\" after a change."] },
    example: {
      react: `<Toggle label="Notifications" formId="settings" onChange={(event) => setOn(event.currentTarget.checked)} />`,
      svelte: `<Toggle label="Notifications" formId="settings" on:change={(event) => (on = event.detail.currentTarget.checked)} />`
    }
  },
  {
    name: "Tooltip", react: "tooltip", svelte: "Tooltip",
    summary: "Wraps a trigger and shows a small popup beside it on hover and keyboard focus.",
    css: css("tooltip.css") + ", which needs `dropdown.css` imported before it",
    notes: {
      all: [
        "`content` is a string or a snippet; it renders inside `role=\"tooltip\"`.",
        "`preset` takes a TooltipPreset for the side (TOP by default, BOTTOM, LEFT, RIGHT).",
        "It shows on hover (pointer devices only) and whenever focus is inside the trigger, so give non-focusable triggers `tabindex=\"0\"`.",
        "`interactive` keeps it open while the pointer is over it so links inside can be clicked; `open` pins it visible.",
        "The default bubble is dark; restyle it with `innerModalClass` (e.g. `bg-white text-zinc-700 border border-zinc-200`). `--tooltip-shift` sets the slide-in distance."
      ],
      react: ["`children` is the trigger. Pass a function `(trigger) => node` to receive `aria-describedby` and spread it on the trigger element."],
      svelte: ["The tag's children are the trigger. Use `{#snippet children(trigger)}` to receive `aria-describedby` and spread it on the trigger element."]
    },
    example: {
      react: `<Tooltip content="Saves a draft without publishing">
  {(trigger) => <button {...trigger} className="field-box">Save draft</button>}
</Tooltip>`,
      svelte: `<Tooltip content="Saves a draft without publishing">
  {#snippet children(trigger)}<button {...trigger} class="field-box">Save draft</button>{/snippet}
</Tooltip>`
    }
  },
  {
    name: "UploadPanel", react: "upload_panel", svelte: "UploadPanel",
    summary: "A drop zone / file picker with an upload queue, progress bars, retry, and a Clear finished button. You provide the transport.",
    css: css("upload_panel.css"),
    notes: { all: [
      "`upload(file, progress)` must return a promise; call `progress(sent, total)` as bytes go out and throw to mark a failure (the error message is shown with Retry).",
      "`isDuplicate(error)` turns a thrown error into a \"Duplicate\" note instead of a failure.",
      "Children render under the drop zone, e.g. a Select for the destination folder; `tag(upload)` renders next to each file in the queue.",
      "`concurrency` caps parallel uploads; `onSettled` fires when the queue empties.",
    ], react: ["A ref exposes `add(files)` to queue files from elsewhere (e.g. a paste handler)."], svelte: ["`bind:this` exposes `add(files)` to queue files from elsewhere."] },
    example: {
      react: `<UploadPanel upload={(file, progress) => api.upload(file, folder, progress)} tag={() => <span className="text-xs">{folder}</span>}>
  <Select label="Upload into" options={folders} value={folder} onChange={setFolder} />
</UploadPanel>`,
      svelte: `{#snippet folderTag()}<span class="text-xs">{folder}</span>{/snippet}
<UploadPanel upload={(file, progress) => api.upload(file, folder, progress)} tag={folderTag}>
  <Select label="Upload into" options={folders} value={folder} onchange={(value) => (folder = value)} />
</UploadPanel>`
    }
  },
];
