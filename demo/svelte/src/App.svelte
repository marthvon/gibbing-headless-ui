<script lang="ts">
  import Breadcrumbs from "@marthvon/gibbing-headless-ui-svelte/Breadcrumbs";
  import CardA from "@marthvon/gibbing-headless-ui-svelte/CardA";
  import CardB from "@marthvon/gibbing-headless-ui-svelte/CardB";
  import DatePicker from "@marthvon/gibbing-headless-ui-svelte/DatePicker";
  import DatePickerInput from "@marthvon/gibbing-headless-ui-svelte/DatePickerInput";
  import Digitbox from "@marthvon/gibbing-headless-ui-svelte/Digitbox";
  import Dropdown from "@marthvon/gibbing-headless-ui-svelte/Dropdown";
  import DualSlider from "@marthvon/gibbing-headless-ui-svelte/DualSlider";
  import FieldGuide from "@marthvon/gibbing-headless-ui-svelte/FieldGuide";
  import FileViewer from "@marthvon/gibbing-headless-ui-svelte/FileViewer";
  import FilterRow from "@marthvon/gibbing-headless-ui-svelte/FilterRow";
  import GridView from "@marthvon/gibbing-headless-ui-svelte/GridView";
  import ImageCarousel from "@marthvon/gibbing-headless-ui-svelte/ImageCarousel";
  import Panel from "@marthvon/gibbing-headless-ui-svelte/Panel";
  import PasswordField from "@marthvon/gibbing-headless-ui-svelte/PasswordField";
  import PhoneField from "@marthvon/gibbing-headless-ui-svelte/PhoneField";
  import QrCode from "@marthvon/gibbing-headless-ui-svelte/QrCode";
  import ResourceTable from "@marthvon/gibbing-headless-ui-svelte/ResourceTable";
  import Select from "@marthvon/gibbing-headless-ui-svelte/Select";
  import Slider from "@marthvon/gibbing-headless-ui-svelte/Slider";
  import SmartGridView from "@marthvon/gibbing-headless-ui-svelte/SmartGridView";
  import SortHeading from "@marthvon/gibbing-headless-ui-svelte/SortHeading";
  import TextEditor from "@marthvon/gibbing-headless-ui-svelte/TextEditor";
  import TextboxA from "@marthvon/gibbing-headless-ui-svelte/TextboxA";
  import TextboxB from "@marthvon/gibbing-headless-ui-svelte/TextboxB";
  import TextboxC from "@marthvon/gibbing-headless-ui-svelte/TextboxC";
  import Toggle from "@marthvon/gibbing-headless-ui-svelte/Toggle";
  import Tooltip from "@marthvon/gibbing-headless-ui-svelte/Tooltip";
  import { Z } from "@marthvon/gibbing-headless-ui-svelte/utils";
  import UploadPanel, { type Upload } from "@marthvon/gibbing-headless-ui-svelte/UploadPanel";
  import { CardPreset, DropdownPreset, Interact, LoaderPreset, PanelPreset, TooltipPreset } from "@marthvon/gibbing-headless-ui-svelte/presets.client";
  import { FILTER_SIZE, WIDE_SIZE } from "@marthvon/gibbing-headless-ui-svelte/filters";
  import { headerSort, type Sort, type SortDirection } from "@marthvon/gibbing-headless-ui-svelte/sorts";

  type Person = { id: string; name: string; role: string; joined: string; active: boolean };

  const PEOPLE: Person[] = [
    { id: "1", name: "Ada Lovelace", role: "Engineer", joined: "2024-02-11", active: true },
    { id: "2", name: "Alan Turing", role: "Researcher", joined: "2023-07-30", active: true },
    { id: "3", name: "Grace Hopper", role: "Admiral", joined: "2022-12-09", active: false },
    { id: "4", name: "Katherine Johnson", role: "Mathematician", joined: "2024-05-21", active: true },
    { id: "5", name: "Edsger Dijkstra", role: "Professor", joined: "2021-03-14", active: false },
    { id: "6", name: "Barbara Liskov", role: "Professor", joined: "2023-01-02", active: true },
    { id: "7", name: "Donald Knuth", role: "Author", joined: "2020-10-10", active: true }
  ];
  const COLUMNS = [{ key: "name", label: "Name" }, { key: "role", label: "Role" }, { key: "joined", label: "Joined", date: true }];
  const SORTABLE = new Set(["name", "role", "joined"]);
  const FRUITS = [{ value: "apple", label: "Apple" }, { value: "banana", label: "Banana" }, { value: "cherry", label: "Cherry" }];
  const ROLES = [...new Set(PEOPLE.map((person) => person.role))].map((role) => ({ value: role, label: role }));
  const STANDINGS = [{ value: "active", label: "Active" }, { value: "away", label: "Away" }];
  const YEARS = [...new Set(PEOPLE.map((person) => person.joined.slice(0, 4)))].sort().map((year) => ({ value: year, label: year }));
  const FOLDERS = [{ value: "invoices", label: "Invoices" }, { value: "contracts", label: "Contracts" }, { value: "photos", label: "Photos" }];
  const LONG_GUIDE = "We send a confirmation link to this address, and it expires after 24 hours. If it doesn't arrive, check your spam folder or ask for a new one from the sign-in page.\n\nPersonal addresses work too, but a work address lets your team find and invite you. You can change it later in your account settings, and we will confirm the new address the same way.";
  const COMPONENTS = [
    "Breadcrumbs", "CardA", "CardB", "DatePicker", "DatePickerInput", "Digitbox", "DualSlider", "FieldGuide",
    "FileViewer", "FilterRow", "GridView", "ImageCarousel", "Panel", "PasswordField", "PhoneField", "QrCode", "ResourceTable",
    "Select & Dropdown", "Slider", "SmartGridView", "SortHeading", "TextEditor", "TextboxA", "TextboxB", "TextboxC", "Toggle", "Tooltip", "UploadPanel"
  ];
  const status = (person: Person) => (person.active ? { label: "Active", tone: "bg-emerald-100 text-emerald-800" } : { label: "Away", tone: "bg-zinc-100 text-zinc-600" });

  let query = "";
  let role = "";
  let standing = "";
  let joinedIn = "";
  let sorts: Sort[] = [];
  let page = 0;
  let pageSize = 5;
  let selected: ReadonlySet<string> = new Set();
  let fruit = "apple";
  let fruits: string[] = ["banana"];
  let clearableFruit = "";
  let date = "";
  let folder = "invoices";
  let lastAction = "";
  const folders = new WeakMap<File, string>();

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  function compare(a: Person, b: Person, order: readonly Sort[]) {
    for (const sort of order) {
      const key = sort.key as keyof Person;
      const result = String(a[key]).localeCompare(String(b[key]));
      if (result) return sort.direction === "asc" ? result : -result;
    }
    return 0;
  }

  $: sorted = PEOPLE
    .filter((person) => person.name.toLowerCase().includes(query.toLowerCase()) && (!role || person.role === role) && (!standing || (standing === "active") === person.active) && (!joinedIn || person.joined.startsWith(joinedIn)))
    .sort((a, b) => compare(a, b, sorts));
  $: pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  $: shownPage = Math.min(page, pages - 1);
  $: from = shownPage * pageSize;
  $: rows = sorted.slice(from, from + pageSize);

  function sortBy(key: string, direction: SortDirection) {
    sorts = headerSort(sorts, key, direction);
  }

  function toggleRow(id: string) {
    const next = new Set(selected);
    if (!next.delete(id)) next.add(id);
    selected = next;
  }

  function toggleFruit(value: string) {
    fruits = fruits.includes(value) ? fruits.filter((item) => item !== value) : [...fruits, value];
  }

  async function upload(_file: File, progress: (sent: number, total: number) => void) {
    for (let step = 1; step <= 5; step++) {
      await wait(250);
      progress(step, 5);
    }
  }

  async function uploadToFolder(file: File, progress: (sent: number, total: number) => void) {
    folders.set(file, folder);
    await upload(file, progress);
  }

  function failingUpload(): Promise<void> {
    return wait(600).then(() => Promise.reject(new Error("The server refused this file")));
  }
</script>

{#snippet tileShort()}<div class="h-16 rounded-lg bg-indigo-200"></div>{/snippet}
{#snippet tileMedium()}<div class="h-24 rounded-lg bg-rose-200"></div>{/snippet}
{#snippet tileTall()}<div class="h-32 rounded-lg bg-amber-200"></div>{/snippet}
{#snippet tileSky()}<div class="h-24 rounded-lg bg-sky-200"></div>{/snippet}
{#snippet slideIndigo()}<div class="h-full w-96 max-w-full rounded-xl bg-indigo-200"></div>{/snippet}
{#snippet slideRose()}<div class="h-full w-96 max-w-full rounded-xl bg-rose-200"></div>{/snippet}
{#snippet slideAmber()}<div class="h-full w-96 max-w-full rounded-xl bg-amber-200"></div>{/snippet}
{#snippet slideEmerald()}<div class="h-full w-96 max-w-full rounded-xl bg-emerald-200"></div>{/snippet}
{#snippet chevron()}<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-zinc-500"><path d="m5 8 5 5 5-5" /></svg>{/snippet}
{#snippet menuItems()}
  {#each ["Profile", "Settings", "Sign out"] as item (item)}
    <span class="block rounded-md px-3 py-1.5 whitespace-nowrap hover:bg-zinc-100">{item}</span>
  {/each}
{/snippet}
{#snippet fruitOption(option: { value: string; label: string })}
  <span class="flex items-center gap-2"><span class="size-2.5 rounded-full {option.value === 'apple' ? 'bg-red-500' : option.value === 'banana' ? 'bg-yellow-400' : 'bg-rose-700'}"></span>{option.label}</span>
{/snippet}
{#snippet folderTag(item: Upload)}
  <span class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">{FOLDERS.find((entry) => entry.value === folders.get(item.file))?.label ?? "—"}</span>
{/snippet}

<div class="mx-auto flex max-w-5xl flex-col gap-6 p-6">
  <header class="flex flex-col gap-3">
    <h1 class="text-2xl font-bold">gibbing-headless-ui · Svelte</h1>
    <nav class="flex flex-wrap gap-2 text-sm">
      {#each COMPONENTS as name (name)}
        <a href="#{name.split(" ")[0]}" class="rounded-full border border-zinc-200 bg-white px-3 py-1 hover:bg-zinc-100">{name}</a>
      {/each}
    </nav>
  </header>

  <section id="Breadcrumbs" data-component="Breadcrumbs" class="demo">
    <h2 class="demo-title">Breadcrumbs</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Default</figcaption>
        <Breadcrumbs crumbs={[{ label: "Home", href: "#", home: true }, { label: "Clients", href: "#" }, { label: "Ada Lovelace" }]} />
      </figure>
      <figure class="variant"><figcaption>Text separator and home icon</figcaption>
        <Breadcrumbs separator="/" homeIcon="⌂" crumbs={[{ label: "Home", href: "#", home: true }, { label: "Settings", href: "#" }, { label: "Billing", href: "#" }, { label: "Invoices" }]} />
      </figure>
    </div>
  </section>

  <section id="CardA" data-component="CardA" class="demo">
    <h2 class="demo-title">CardA</h2>
    <div class="variants">
      {#each [[Interact.HOVER, "Flips on hover"], [Interact.CLICK, "Flips on click"], [Interact.HOVER_N_CLICK, "Hover or click"]] as [interact, caption] (caption)}
        <figure class="variant"><figcaption>{caption}</figcaption>
          <div class="h-40">
            <CardA interact={Number(interact)} className="h-full" cardClass="rounded-xl">
              <svelte:fragment slot="image"><div class="h-full w-full rounded-xl bg-indigo-300"></div></svelte:fragment>
              <div class="flex h-full items-center justify-center rounded-xl bg-indigo-900 p-4 text-white">Back of the card</div>
            </CardA>
          </div>
        </figure>
      {/each}
    </div>
  </section>

  <section id="CardB" data-component="CardB" class="demo">
    <h2 class="demo-title">CardB</h2>
    <div class="variants">
      {#each [[CardPreset.TO_RIGHT, "TO_RIGHT", "from-indigo-900"], [CardPreset.TO_TOP, "TO_TOP", "from-rose-900"], [CardPreset.TO_LEFT_AT_HALF, "TO_LEFT_AT_HALF", "from-amber-900"], [CardPreset.TO_BOTTOM_AT_HALF, "TO_BOTTOM_AT_HALF", "from-emerald-900"]] as [preset, caption, color] (caption)}
        <figure class="variant"><figcaption>{caption}</figcaption>
          <div class="h-40">
            <CardB from_color={color} preset={preset as CardPreset} className="h-full rounded-xl">
              <svelte:fragment slot="image"><div class="h-full w-full bg-zinc-300"></div></svelte:fragment>
              <p class="p-4 text-white">Revealed on hover</p>
            </CardB>
          </div>
        </figure>
      {/each}
    </div>
  </section>

  <section id="DatePicker" data-component="DatePicker" class="demo">
    <h2 class="demo-title">DatePicker</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Default</figcaption>
        <DatePicker label="Due date" formId="demo-picker" value={date} onchange={(iso) => (date = iso)} />
      </figure>
      <figure class="variant"><figcaption>French locale</figcaption>
        <DatePicker label="Échéance" formId="demo-picker-fr" locale="fr-FR" value={date} onchange={(iso) => (date = iso)} />
      </figure>
      <figure class="variant"><figcaption>Narrow: compact day labels</figcaption>
        <DatePicker label="Narrow" formId="demo-picker-mini" value={date} onchange={(iso) => (date = iso)} className="max-w-52" />
      </figure>
    </div>
  </section>

  <section id="DatePickerInput" data-component="DatePickerInput" class="demo">
    <h2 class="demo-title">DatePickerInput</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Default (TextboxA), opens below</figcaption>
        <DatePickerInput label="Start date" formId="demo-picker-input" value={date} onchange={(iso) => (date = iso)} />
      </figure>
      <figure class="variant"><figcaption>field = TextboxB</figcaption>
        <DatePickerInput label="Due date" formId="demo-picker-input-b" value={date} onchange={(iso) => (date = iso)}>
          {#snippet field(input)}<TextboxB {...input} />{/snippet}
        </DatePickerInput>
      </figure>
      <figure class="variant"><figcaption>field = TextboxC, opens above</figcaption>
        <DatePickerInput label="End date" formId="demo-picker-input-c" preset={DropdownPreset.TOP} value={date} onchange={(iso) => (date = iso)}>
          {#snippet field(input)}<TextboxC {...input} placeholder="YYYY-MM-DD" />{/snippet}
        </DatePickerInput>
      </figure>
    </div>
  </section>

  <section id="Digitbox" data-component="Digitbox" class="demo">
    <h2 class="demo-title">Digitbox</h2>
    <div class="variants">
      <figure class="variant"><figcaption>6 digits, numbers only</figcaption>
        <Digitbox label="Code" formId="demo-digits" digits={6} />
      </figure>
      <figure class="variant"><figcaption>4 characters in a form</figcaption>
        <form><Digitbox label="Invite" formId="demo-digits-text" name="code" digits={4} isNumeric={false} /></form>
      </figure>
      <figure class="variant"><figcaption>Disabled</figcaption>
        <Digitbox label="Locked" formId="demo-digits-off" digits={4} disabled />
      </figure>
    </div>
  </section>

  <section id="DualSlider" data-component="DualSlider" class="demo">
    <h2 class="demo-title">DualSlider</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Labels outside</figcaption>
        <DualSlider label="Price" formId="demo-dual" max={100} labelPos="o" />
      </figure>
      <figure class="variant"><figcaption>Step 0.5 with a formatter</figcaption>
        <DualSlider label="Rating" formId="demo-dual-step" min={0} max={10} step={0.5} labelPos="o" labelParse={(n) => `${n.toFixed(1)}★`} />
      </figure>
      <figure class="variant"><figcaption>Labels inside the thumbs</figcaption>
        <DualSlider label="Age" formId="demo-dual-in" min={18} max={99} labelPos="i" thumbClass="w-8" />
      </figure>
      <figure class="variant"><figcaption>No labels, custom colours</figcaption>
        <DualSlider label="Range" formId="demo-dual-bare" max={1000} step={50} trackClass="bg-indigo-600" thumbClass="bg-indigo-600" />
      </figure>
    </div>
  </section>

  <section id="FieldGuide" data-component="FieldGuide" class="demo">
    <h2 class="demo-title">FieldGuide</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Short: no toggle</figcaption>
        <FieldGuide text="Use a work email you can reach." />
      </figure>
      <figure class="variant"><figcaption>Long: default 3rem limit</figcaption>
        <FieldGuide text={LONG_GUIDE} />
      </figure>
      <figure class="variant"><figcaption>{"limit={1.5} with custom toggles"}</figcaption>
        <FieldGuide text={LONG_GUIDE} limit={1.5} expand="Read more ↓" collapse="Show less ↑" />
      </figure>
    </div>
  </section>

  <section id="FileViewer" data-component="FileViewer" class="demo">
    <h2 class="demo-title">FileViewer</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Image</figcaption>
        <div class="h-56"><FileViewer src="/sample.svg" name="sample.svg" /></div>
      </figure>
      <figure class="variant"><figcaption>Text from content</figcaption>
        <div class="h-56"><FileViewer src="" name="notes.txt" content={"Meeting notes\n\n- Ship the demo\n- Review the z-index scale\n- Publish 1.2.0"} /></div>
      </figure>
      <figure class="variant"><figcaption>Unsupported type: fallback</figcaption>
        <div class="h-56"><FileViewer src="/sample.svg" name="archive.zip" kind="other" fallback="No preview for this file type." /></div>
      </figure>
    </div>
  </section>

  <section id="FilterRow" data-component="FilterRow" class="demo">
    <h2 class="demo-title">FilterRow</h2>
    <div class="flex flex-col gap-6">
      <figure class="variant"><figcaption>Search only</figcaption>
        <FilterRow id="demo-filter" {query} oninput={(text) => (query = text)} clearable={!!query} onclear={() => (query = "")} placeholder="Filter people" />
      </figure>
      <figure class="variant"><figcaption>With a filter control and refresh (filters the table below)</figcaption>
        <FilterRow id="demo-filter-role" {query} oninput={(text) => (query = text)} sizes={[FILTER_SIZE]} applied={!!role} clearable={!!query || !!role}
          onclear={() => { query = ""; role = ""; }} onrefresh={() => {}} placeholder="Filter people">
          {#snippet controls(slot)}
            <Select label="Role" className="filter-slot" style={slot(0)} options={ROLES} value={role} placeholder="Any role" clearable onchange={(value) => (role = value)} />
          {/snippet}
        </FilterRow>
      </figure>
      <figure class="variant"><figcaption>Three filters: the More filters toggle appears only when they wrap</figcaption>
        <FilterRow id="demo-filter-many" {query} oninput={(text) => (query = text)} sizes={[FILTER_SIZE, FILTER_SIZE, WIDE_SIZE]} applied={!!role || !!standing || !!joinedIn}
          clearable={!!query || !!role || !!standing || !!joinedIn} onclear={() => { query = ""; role = ""; standing = ""; joinedIn = ""; }} placeholder="Filter people">
          {#snippet controls(slot)}
            <Select label="Role" className="filter-slot" style={slot(0)} options={ROLES} value={role} placeholder="Any role" clearable onchange={(value) => (role = value)} />
            <Select label="Status" className="filter-slot" style={slot(1)} options={STANDINGS} value={standing} placeholder="Any status" clearable onchange={(value) => (standing = value)} />
            <Select label="Joined in" className="filter-slot" style={slot(2)} options={YEARS} value={joinedIn} placeholder="Any year" clearable onchange={(value) => (joinedIn = value)} />
          {/snippet}
        </FilterRow>
      </figure>
    </div>
  </section>

  <section id="GridView" data-component="GridView" class="demo">
    <h2 class="demo-title">GridView</h2>
    <div class="flex flex-col gap-6">
      <figure class="variant"><figcaption>Columns follow the container width</figcaption>
        <GridView className="h-56" cardClass="rounded-lg" childrens={[["a", tileShort], ["b", tileMedium], ["c", tileTall], ["d", tileSky], ["e", tileShort], ["f", tileTall], ["g", tileMedium], ["h", tileSky]]} />
      </figure>
      <figure class="variant"><figcaption>{"columns={2}"}</figcaption>
        <GridView className="h-56" columns={2} cardClass="rounded-lg" childrens={[["a", tileTall], ["b", tileSky], ["c", tileMedium], ["d", tileShort]]} />
      </figure>
    </div>
  </section>

  <section id="ImageCarousel" data-component="ImageCarousel" class="demo">
    <h2 class="demo-title">ImageCarousel</h2>
    <div class="flex flex-col gap-8">
      <figure class="variant"><figcaption>Autoplay with indicators</figcaption>
        <div class="h-56">
          <ImageCarousel timeout={4} className="h-full" cursor_color="text-zinc-700"
            indicators={{ indicated_color: "bg-indigo-600", dormant_color: "bg-zinc-300" }}
            images={[["indigo", slideIndigo], ["rose", slideRose], ["amber", slideAmber], ["emerald", slideEmerald]]} />
        </div>
      </figure>
      <figure class="variant"><figcaption>Autoplay with a progress loader</figcaption>
        <div class="h-56">
          <ImageCarousel timeout={5} className="h-full" cursor_color="text-zinc-700"
            loader={{ preset: LoaderPreset.LINEAR, fill_color: "bg-indigo-600", empty_color: "bg-zinc-200", onBottom: true }}
            images={[["amber", slideAmber], ["emerald", slideEmerald], ["indigo", slideIndigo]]} />
        </div>
      </figure>
      <figure class="variant"><figcaption>Manual only</figcaption>
        <div class="h-56">
          <ImageCarousel className="h-full" cursor_color="text-zinc-700" images={[["rose", slideRose], ["indigo", slideIndigo]]} />
        </div>
      </figure>
    </div>
  </section>

  <section id="Panel" data-component="Panel" class="demo">
    <h2 class="demo-title">Panel</h2>
    <div class="variants">
      {#each [[PanelPreset.BOTTOM, "BOTTOM"], [PanelPreset.TOP, "TOP"], [PanelPreset.LEFT, "LEFT"], [PanelPreset.RIGHT, "RIGHT"]] as [preset, caption] (caption)}
        <figure class="variant"><figcaption>{caption}</figcaption>
          <div class="relative h-56 overflow-hidden rounded-xl border border-zinc-200">
            <Panel preset={preset as PanelPreset} default_ratio="40%" modalClass="bg-white">
              <div class="h-full w-full bg-zinc-100 p-4">Main content</div>
              <svelte:fragment slot="modal"><p class="p-4">Drag the handle.</p></svelte:fragment>
            </Panel>
          </div>
        </figure>
      {/each}
      <figure class="variant"><figcaption>Snaps to 25% or 75%</figcaption>
        <div class="relative h-56 overflow-hidden rounded-xl border border-zinc-200">
          <Panel preset={PanelPreset.BOTTOM} ratio={[0, "<=", 0.25, "<", 0.5, "<=", 0.75, "<=", 1]} default_ratio={0} modalClass="bg-white">
            <div class="h-full w-full bg-zinc-100 p-4">Main content</div>
            <svelte:fragment slot="modal"><p class="p-4">Let go and it snaps.</p></svelte:fragment>
          </Panel>
        </div>
      </figure>
    </div>
  </section>

  <section id="PasswordField" data-component="PasswordField" class="demo">
    <h2 class="demo-title">PasswordField</h2>
    <div class="variants">
      <figure class="variant"><figcaption>variant="a" (default)</figcaption>
        <PasswordField label="Password" formId="demo-password" />
      </figure>
      <figure class="variant"><figcaption>variant="b", new password with an error</figcaption>
        <PasswordField variant="b" label="New password" formId="demo-password-new" autocomplete="new-password" value="abc" error="Use at least 12 characters" />
      </figure>
      <figure class="variant"><figcaption>variant="c", text toggle</figcaption>
        <PasswordField variant="c" label="PIN" formId="demo-password-text" maxLength={8} showIcon="Show" hideIcon="Hide" placeholder="8 characters" />
      </figure>
    </div>
  </section>

  <section id="PhoneField" data-component="PhoneField" class="demo">
    <h2 class="demo-title">PhoneField</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Default input (menu opens above)</figcaption>
        <PhoneField label="Phone" formId="demo-phone" />
      </figure>
      <figure class="variant"><figcaption>field = TextboxB, menu below</figcaption>
        <PhoneField label="Mobile" formId="demo-phone-b" preset={DropdownPreset.BOTTOM}>
          {#snippet field(input)}<TextboxB {...input} />{/snippet}
        </PhoneField>
      </figure>
      <figure class="variant"><figcaption>field = TextboxC, with an error</figcaption>
        <PhoneField label="Phone" formId="demo-phone-c" value="12" error="That number is too short" preset={DropdownPreset.BOTTOM}>
          {#snippet field(input)}<TextboxC {...input} placeholder="412 345 678" />{/snippet}
        </PhoneField>
      </figure>
      <figure class="variant"><figcaption>field = TextboxA</figcaption>
        <PhoneField label="Work phone" formId="demo-phone-a" preset={DropdownPreset.BOTTOM}>
          {#snippet field(input)}<TextboxA {...input} />{/snippet}
        </PhoneField>
      </figure>
    </div>
  </section>

  <section id="QrCode" data-component="QrCode" class="demo">
    <h2 class="demo-title">QrCode</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Level M (default)</figcaption>
        <QrCode value="https://github.com/marthvon/gibbing-headless-ui" label="Repository link" className="w-40" />
      </figure>
      <figure class="variant"><figcaption>Level H, no quiet zone</figcaption>
        <QrCode value="https://github.com/marthvon/gibbing-headless-ui" label="Repository link" level="H" quiet={0} className="w-40" />
      </figure>
      <figure class="variant"><figcaption>Level L, small</figcaption>
        <QrCode value="gibbing" label="Short text" level="L" className="w-24" />
      </figure>
    </div>
  </section>

  <section id="ResourceTable" data-component="ResourceTable" class="demo">
    <h2 class="demo-title">ResourceTable</h2>
    <div class="flex flex-col gap-6">
      <figure class="variant"><figcaption>Table: sorting, selection, paging, row actions{lastAction ? ` · last action: ${lastAction}` : ""}</figcaption>
        <ResourceTable
          stackAt={40}
          columns={COLUMNS}
          {rows}
          {status}
          actions={(person) => [
            { id: "edit", label: "Edit", run: () => (lastAction = `Edit ${person.name}`) },
            { id: "archive", label: "Archive", tone: "caution", run: () => (lastAction = `Archive ${person.name}`) },
            { id: "delete", label: "Delete", tone: "danger", run: () => (lastAction = `Delete ${person.name}`) }
          ]}
          menu
          {sorts}
          sortable={SORTABLE}
          selectable
          {selected}
          onselect={toggleRow}
          onselectpage={(on) => (selected = on ? new Set(rows.map((row) => row.id)) : new Set())}
          page={shownPage}
          {pages}
          {from}
          to={from + rows.length}
          total={sorted.length}
          {pageSize}
          pageSizes={[5, 10, 20]}
          onpage={(next) => (page = next)}
          onpagesize={(size) => {
            pageSize = size;
            page = 0;
          }}
        >
          {#snippet sortHeading(key, label)}<SortHeading {key} {label} {sorts} onsort={sortBy} />{/snippet}
        </ResourceTable>
      </figure>
      <figure class="variant"><figcaption>Stacked cards (default stackAt) with an inline action</figcaption>
        <ResourceTable columns={COLUMNS} rows={PEOPLE.slice(0, 3)} {status} actions={(person) => [{ id: "open", label: "Open", run: () => (lastAction = `Open ${person.name}`) }]} />
      </figure>
      <div class="variants">
        <figure class="variant"><figcaption>Loading</figcaption>
          <ResourceTable stackAt={24} columns={COLUMNS} rows={[]} busy />
        </figure>
        <figure class="variant"><figcaption>Empty, custom message</figcaption>
          <ResourceTable stackAt={24} columns={COLUMNS} rows={[]} empty="No people match these filters." />
        </figure>
      </div>
    </div>
  </section>

  <section id="Select" data-component="Select" class="demo">
    <h2 class="demo-title">Select &amp; Dropdown</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Single</figcaption>
        <Select label="Fruit" options={FRUITS} value={fruit} onchange={(value) => (fruit = value)} />
      </figure>
      <figure class="variant"><figcaption>Multiple</figcaption>
        <Select label="Fruits" options={FRUITS} multiple values={fruits} summary={fruits.length ? `${fruits.length} selected` : ""} ontoggle={toggleFruit} />
      </figure>
      <figure class="variant"><figcaption>Clearable with a placeholder</figcaption>
        <Select label="Fruit" options={FRUITS} value={clearableFruit} placeholder="Pick one" clearable onchange={(value) => (clearableFruit = value)} />
      </figure>
      <figure class="variant"><figcaption>Custom option and error</figcaption>
        <Select label="Fruit" options={FRUITS} value={fruit} option={fruitOption} error="Apples are out of season" onchange={(value) => (fruit = value)} />
      </figure>
      <figure class="variant"><figcaption>Opens above</figcaption>
        <Select label="Fruit" options={FRUITS} value={fruit} preset={DropdownPreset.TOP} onchange={(value) => (fruit = value)} />
      </figure>
    </div>
    <div id="Dropdown" data-component="Dropdown" class="mt-6">
      <h3 class="demo-subtitle">Dropdown</h3>
      <div class="variants">
        <figure class="variant"><figcaption>Click, below</figcaption>
          <Dropdown preset={DropdownPreset.BOTTOM} interact={Interact.CLICK} clickOut className="w-full" innerModalClass="border border-zinc-200 p-1">
            {#snippet menu()}{@render menuItems()}{/snippet}
            <span class="field-box flex items-center justify-between">Open menu {@render chevron()}</span>
          </Dropdown>
        </figure>
        <figure class="variant"><figcaption>Hover, below</figcaption>
          <Dropdown preset={DropdownPreset.BOTTOM} interact={Interact.HOVER} className="w-full" innerModalClass="border border-zinc-200 p-1">
            {#snippet menu()}{@render menuItems()}{/snippet}
            <span class="field-box flex items-center justify-between">Hover me {@render chevron()}</span>
          </Dropdown>
        </figure>
        <figure class="variant"><figcaption>Click, opens to the right</figcaption>
          <Dropdown preset={DropdownPreset.RIGHT} interact={Interact.CLICK} clickOut innerModalClass="border border-zinc-200 p-1">
            {#snippet menu()}{@render menuItems()}{/snippet}
            <span class="field-box flex items-center gap-2">Open →</span>
          </Dropdown>
        </figure>
        <figure class="variant"><figcaption>{"Select inside a dropdown, zIndex={Z.popover + 1}"}</figcaption>
          <Dropdown preset={DropdownPreset.BOTTOM} interact={Interact.CLICK} clickOut zIndex={Z.popover} innerModalClass="w-64 border border-zinc-200 p-3">
            {#snippet menu()}<Select label="Fruit" zIndex={Z.popover + 1} options={FRUITS} value={fruit} onchange={(value) => (fruit = value)} />{/snippet}
            <span class="field-box flex items-center justify-between">Open settings {@render chevron()}</span>
          </Dropdown>
        </figure>
      </div>
    </div>
  </section>

  <section id="Slider" data-component="Slider" class="demo">
    <h2 class="demo-title">Slider</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Label on the right</figcaption>
        <Slider label="Volume" formId="demo-slider" max={100} defaultValue={40} labelPos="r" />
      </figure>
      <figure class="variant"><figcaption>Label on the left, step 0.25</figcaption>
        <Slider label="Zoom" formId="demo-slider-left" min={0.5} max={3} step={0.25} defaultValue={1} labelPos="l" labelParse={(n) => `${n.toFixed(2)}×`} />
      </figure>
      <figure class="variant"><figcaption>Label inside the thumb</figcaption>
        <Slider label="Level" formId="demo-slider-in" max={10} defaultValue={3} labelPos="i" thumbClass="w-8" />
      </figure>
      <figure class="variant"><figcaption>No label, custom colours</figcaption>
        <Slider label="Bare" formId="demo-slider-bare" max={100} defaultValue={70} trackClass="bg-emerald-600" thumbClass="bg-emerald-600" />
      </figure>
    </div>
  </section>

  <section id="SmartGridView" data-component="SmartGridView" class="demo">
    <h2 class="demo-title">SmartGridView</h2>
    <div class="variants">
      <figure class="variant"><figcaption>3 columns</figcaption>
        <SmartGridView className="h-56" columns={3} images={[["a", 1, tileShort], ["b", 1.5, tileMedium], ["c", 2, tileTall], ["d", 1.5, tileSky], ["e", 1, tileShort], ["f", 2, tileTall]]} />
      </figure>
      <figure class="variant"><figcaption>2 columns</figcaption>
        <SmartGridView className="h-56" columns={2} images={[["a", 2, tileTall], ["b", 1, tileShort], ["c", 1.5, tileSky], ["d", 1, tileMedium]]} />
      </figure>
    </div>
  </section>

  <section id="SortHeading" data-component="SortHeading" class="demo">
    <h2 class="demo-title">SortHeading</h2>
    <p class="mb-3 text-sm text-zinc-500">Shares its sort state with the table above: {sorts.length ? sorts.map((sort) => `${sort.key} ${sort.direction}`).join(", ") : "unsorted"}</p>
    <table><thead><tr>
      <th class="pr-8"><SortHeading key="name" label="Name" {sorts} onsort={sortBy} /></th>
      <th class="pr-8"><SortHeading key="role" label="Role" {sorts} onsort={sortBy} /></th>
      <th><SortHeading key="joined" label="Joined" {sorts} onsort={sortBy} ascLabel="Oldest" descLabel="Newest" /></th>
    </tr></thead></table>
  </section>

  <section id="TextEditor" data-component="TextEditor" class="demo">
    <h2 class="demo-title">TextEditor</h2>
    <div class="flex flex-col gap-6">
      <figure class="variant"><figcaption>Full toolbar with insertable snippets</figcaption>
        <TextEditor label="Message" formId="demo-editor" maxLength={500} snippets={[{ label: "First name", text: "{{first_name}}" }, { label: "Company", text: "{{company}}" }]} />
      </figure>
      <div class="variants">
        <figure class="variant"><figcaption>Short, with an error</figcaption>
          <TextEditor label="Bio" formId="demo-editor-error" rows={4} value="Hi" error="Write at least 20 characters" />
        </figure>
        <figure class="variant"><figcaption>Read-only</figcaption>
          <TextEditor label="Terms" formId="demo-editor-ro" rows={4} readonly value={"**These terms** are read-only.\n\n- You can select text\n- You cannot edit it"} />
        </figure>
      </div>
    </div>
  </section>

  <section id="TextboxA" data-component="TextboxA" class="demo">
    <h2 class="demo-title">TextboxA</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Default</figcaption>
        <TextboxA label="Full name" formId="demo-a" />
      </figure>
      <figure class="variant"><figcaption>With an error</figcaption>
        <TextboxA label="Username" formId="demo-a-error" error="That name is taken" />
      </figure>
      <figure class="variant"><figcaption>Digits only (guard)</figcaption>
        <TextboxA label="Postcode" formId="demo-a-guard" mode="numeric" guard={/^\d{0,5}$/} maxLength={5} />
      </figure>
      <figure class="variant"><figcaption>Textarea (height 6)</figcaption>
        <TextboxA label="Notes" formId="demo-a-area" height={6} wrap />
      </figure>
    </div>
  </section>

  <section id="TextboxB" data-component="TextboxB" class="demo">
    <h2 class="demo-title">TextboxB</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Default</figcaption>
        <TextboxB label="Email" formId="demo-b" mode="email" />
      </figure>
      <figure class="variant"><figcaption>With an error</figcaption>
        <TextboxB label="Email" formId="demo-b-error" value="ada@" error="Enter a valid email" />
      </figure>
      <figure class="variant"><figcaption>Textarea (height 6)</figcaption>
        <TextboxB label="Message" formId="demo-b-area" height={6} wrap />
      </figure>
      <figure class="variant"><figcaption>On a tinted background</figcaption>
        <TextboxB label="Search" formId="demo-b-tint" mode="search" className="rounded-xl bg-indigo-50 px-3" />
      </figure>
    </div>
  </section>

  <section id="TextboxC" data-component="TextboxC" class="demo">
    <h2 class="demo-title">TextboxC</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Default with a placeholder</figcaption>
        <TextboxC label="Label" formId="demo-c" placeholder="Input text" />
      </figure>
      <figure class="variant"><figcaption>With an error</figcaption>
        <TextboxC label="Amount" formId="demo-c-error" mode="decimal" value="-5" error="Must be positive" />
      </figure>
      <figure class="variant"><figcaption>Textarea (height 6)</figcaption>
        <TextboxC label="Address" formId="demo-c-area" height={6} wrap placeholder="Street, city, postcode" />
      </figure>
    </div>
  </section>

  <section id="Toggle" data-component="Toggle" class="demo">
    <h2 class="demo-title">Toggle</h2>
    <div class="variants">
      <figure class="variant"><figcaption>Default</figcaption>
        <Toggle label="Notifications" formId="demo-toggle" />
      </figure>
      <figure class="variant"><figcaption>Custom colours</figcaption>
        <Toggle label="Dark mode" formId="demo-toggle-color" trackClass="peer-checked:bg-indigo-600" />
      </figure>
    </div>
  </section>

  <section id="Tooltip" data-component="Tooltip" class="demo">
    <h2 class="demo-title">Tooltip</h2>
    <div class="variants">
      <figure class="variant"><figcaption>String content, above (default)</figcaption>
        <Tooltip content="Saves a draft without publishing"><button class="field-box">Save draft</button></Tooltip>
      </figure>
      <figure class="variant"><figcaption>Snippet content, below</figcaption>
        <Tooltip preset={TooltipPreset.BOTTOM}>
          {#snippet content()}<span class="flex flex-col"><b>Ctrl + K</b><span>Opens the command menu</span></span>{/snippet}
          <button class="field-box">Shortcuts</button>
        </Tooltip>
      </figure>
      <figure class="variant"><figcaption>Left and right</figcaption>
        <span class="flex gap-16 px-12">
          <Tooltip preset={TooltipPreset.LEFT} content="Previous"><button class="field-box" aria-label="Previous">←</button></Tooltip>
          <Tooltip preset={TooltipPreset.RIGHT} content="Next"><button class="field-box" aria-label="Next">→</button></Tooltip>
        </span>
      </figure>
      <figure class="variant"><figcaption>Inline, trigger gets aria-describedby</figcaption>
        <p class="text-sm text-zinc-600">Billed as
          <Tooltip content="Annual percentage rate">
            {#snippet children(trigger)}<button type="button" {...trigger} class="cursor-help underline decoration-dotted">APR</button>{/snippet}
          </Tooltip>
          each month.</p>
      </figure>
      <figure class="variant"><figcaption>Interactive, light theme</figcaption>
        <Tooltip interactive innerModalClass="bg-white text-zinc-700 border border-zinc-200">
          {#snippet content()}<span>Read the <a class="text-indigo-600 underline" href="#Tooltip">docs</a></span>{/snippet}
          <button class="field-box">Hover, then click the link</button>
        </Tooltip>
      </figure>
      <figure class="variant"><figcaption>Always open</figcaption>
        <span class="pt-10"><Tooltip open content="Pinned with open"><span class="field-box">Anchor</span></Tooltip></span>
      </figure>
    </div>
  </section>

  <section id="UploadPanel" data-component="UploadPanel" class="demo">
    <h2 class="demo-title">UploadPanel</h2>
    <div class="flex flex-col gap-6">
      <figure class="variant"><figcaption>Default</figcaption>
        <UploadPanel {upload} />
      </figure>
      <figure class="variant"><figcaption>Extra content and a per-file tag (folder chosen before upload)</figcaption>
        <UploadPanel upload={uploadToFolder} tag={folderTag}>
          <Select label="Upload into" options={FOLDERS} value={folder} onchange={(value) => (folder = value)} className="max-w-xs" />
        </UploadPanel>
      </figure>
      <figure class="variant"><figcaption>Images only, one at a time, always fails</figcaption>
        <UploadPanel upload={failingUpload} accept="image/*" multiple={false} />
      </figure>
    </div>
  </section>
</div>

<style>
  .demo {
    scroll-margin-top: 1rem;
    border-radius: 1rem;
    border: 1px solid var(--color-zinc-200);
    background: white;
    padding: 1.25rem;
  }
  .demo-title {
    margin-bottom: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: var(--color-zinc-500);
  }
  .demo-subtitle {
    margin-bottom: 0.75rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-zinc-700);
  }
  .variants {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
    gap: 1.5rem;
  }
  .variant {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.5rem;
  }
  .variant > figcaption {
    font-size: 0.75rem;
    color: var(--color-zinc-500);
  }
</style>
