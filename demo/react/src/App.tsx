import { useMemo, useRef, useState, type ReactNode } from "react";
import Breadcrumbs from "@marthvon/gibbing-headless-ui/breadcrumbs";
import CardA from "@marthvon/gibbing-headless-ui/card.a";
import CardB from "@marthvon/gibbing-headless-ui/card.b";
import DatePicker from "@marthvon/gibbing-headless-ui/date_picker";
import DatePickerInput from "@marthvon/gibbing-headless-ui/date_picker_input";
import Digitbox from "@marthvon/gibbing-headless-ui/digitbox";
import Dropdown from "@marthvon/gibbing-headless-ui/dropdown";
import DualSlider from "@marthvon/gibbing-headless-ui/dual_slider";
import FieldGuide from "@marthvon/gibbing-headless-ui/field_guide";
import FileViewer from "@marthvon/gibbing-headless-ui/file_viewer";
import FilterRow from "@marthvon/gibbing-headless-ui/filter_row";
import GridView from "@marthvon/gibbing-headless-ui/grid_view";
import ImageCarousel from "@marthvon/gibbing-headless-ui/image_carousel";
import Panel from "@marthvon/gibbing-headless-ui/panel";
import PasswordField from "@marthvon/gibbing-headless-ui/password_field";
import PhoneField from "@marthvon/gibbing-headless-ui/phone_field";
import QrCode from "@marthvon/gibbing-headless-ui/qr_code";
import ResourceTable from "@marthvon/gibbing-headless-ui/resource_table";
import Select from "@marthvon/gibbing-headless-ui/select";
import Slider from "@marthvon/gibbing-headless-ui/slider";
import SmartGridView from "@marthvon/gibbing-headless-ui/smart_grid_view";
import SortHeading from "@marthvon/gibbing-headless-ui/sort_heading";
import TextEditor from "@marthvon/gibbing-headless-ui/text_editor";
import TextboxA from "@marthvon/gibbing-headless-ui/textbox.a";
import TextboxB from "@marthvon/gibbing-headless-ui/textbox.b";
import TextboxC from "@marthvon/gibbing-headless-ui/textbox.c";
import Toggle from "@marthvon/gibbing-headless-ui/toggle";
import Tooltip from "@marthvon/gibbing-headless-ui/tooltip";
import { Z } from "@marthvon/gibbing-headless-ui/utils";
import UploadPanel from "@marthvon/gibbing-headless-ui/upload_panel";
import { CardPreset, DropdownPreset, Interact, PanelPreset } from "@marthvon/gibbing-headless-ui/presets.client";
import { FILTER_SIZE, WIDE_SIZE } from "@marthvon/gibbing-headless-ui/filters";
import { headerSort, type Sort } from "@marthvon/gibbing-headless-ui/sorts";

type Person = { id: string; name: string; role: string; joined: string; active: boolean };
type Option = { value: string; label: string };

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
const FRUITS: Option[] = [{ value: "apple", label: "Apple" }, { value: "banana", label: "Banana" }, { value: "cherry", label: "Cherry" }];
const ROLES: Option[] = [...new Set(PEOPLE.map((person) => person.role))].map((role) => ({ value: role, label: role }));
const STANDINGS: Option[] = [{ value: "active", label: "Active" }, { value: "away", label: "Away" }];
const YEARS: Option[] = [...new Set(PEOPLE.map((person) => person.joined.slice(0, 4)))].sort().map((year) => ({ value: year, label: year }));
const FOLDERS: Option[] = [{ value: "invoices", label: "Invoices" }, { value: "contracts", label: "Contracts" }, { value: "photos", label: "Photos" }];
const DOTS: Record<string, string> = { apple: "bg-red-500", banana: "bg-yellow-400", cherry: "bg-rose-700" };
const SWATCHES = ["bg-indigo-200", "bg-rose-200", "bg-amber-200", "bg-emerald-200", "bg-sky-200", "bg-fuchsia-200"];
const HEIGHTS = ["h-16", "h-24", "h-32"];
const LONG_GUIDE = "We send a confirmation link to this address, and it expires after 24 hours. If it doesn't arrive, check your spam folder or ask for a new one from the sign-in page.\n\nPersonal addresses work too, but a work address lets your team find and invite you. You can change it later in your account settings, and we will confirm the new address the same way.";
const REPO = "https://github.com/marthvon/gibbing-headless-ui";
const COMPONENTS = [
  "Breadcrumbs", "CardA", "CardB", "DatePicker", "DatePickerInput", "Digitbox", "DualSlider", "FieldGuide",
  "FileViewer", "FilterRow", "GridView", "ImageCarousel", "Panel", "PasswordField", "PhoneField", "QrCode", "ResourceTable",
  "Select & Dropdown", "Slider", "SmartGridView", "SortHeading", "TextEditor", "TextboxA", "TextboxB", "TextboxC", "Toggle", "Tooltip", "UploadPanel"
];
const CARD_A: [Interact, string][] = [[Interact.HOVER, "Flips on hover"], [Interact.CLICK, "Flips on click"], [Interact.HOVER_N_CLICK, "Hover or click"]];
const CARD_B: [CardPreset, string, string][] = [
  [CardPreset.TO_RIGHT, "TO_RIGHT", "from-indigo-900"], [CardPreset.TO_TOP, "TO_TOP", "from-rose-900"],
  [CardPreset.TO_LEFT_AT_HALF, "TO_LEFT_AT_HALF", "from-amber-900"], [CardPreset.TO_BOTTOM_AT_HALF, "TO_BOTTOM_AT_HALF", "from-emerald-900"]
];
const PANELS: [PanelPreset, string][] = [[PanelPreset.BOTTOM, "BOTTOM"], [PanelPreset.TOP, "TOP"], [PanelPreset.LEFT, "LEFT"], [PanelPreset.RIGHT, "RIGHT"]];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const status = (person: Person) => (person.active ? { label: "Active", tone: "bg-emerald-100 text-emerald-800" } : { label: "Away", tone: "bg-zinc-100 text-zinc-600" });
const tile = (index: number, swatch: string) => <div className={`${HEIGHTS[index % 3]} rounded-lg ${swatch}`}></div>;
const slide = (swatch: string) => <div className={`h-full w-96 max-w-full rounded-xl ${swatch}`}></div>;
const chevron = <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-zinc-500"><path d="m5 8 5 5 5-5" /></svg>;
const menuItems = ["Profile", "Settings", "Sign out"].map((item) => <span key={item} className="block rounded-md px-3 py-1.5 whitespace-nowrap hover:bg-zinc-100">{item}</span>);

function Demo({ name, title = name, children }: { name: string; title?: string; children: ReactNode }) {
  return (
    <section id={name} data-component={name} className="scroll-mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-zinc-500 uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Variants({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-6">{children}</div>;
}

function Variant({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="text-xs text-zinc-500">{caption}</figcaption>
      {children}
    </figure>
  );
}

function compare(a: Person, b: Person, sorts: readonly Sort[]) {
  for (const sort of sorts) {
    const key = sort.key as keyof Person;
    const order = String(a[key]).localeCompare(String(b[key]));
    if (order) return sort.direction === "asc" ? order : -order;
  }
  return 0;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [standing, setStanding] = useState("");
  const [joinedIn, setJoinedIn] = useState("");
  const [sorts, setSorts] = useState<Sort[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [fruit, setFruit] = useState("apple");
  const [fruits, setFruits] = useState<string[]>(["banana"]);
  const [clearableFruit, setClearableFruit] = useState("");
  const [date, setDate] = useState("");
  const [folder, setFolder] = useState("invoices");
  const [lastAction, setLastAction] = useState("");
  const folderRef = useRef(folder);
  folderRef.current = folder;
  const folders = useRef(new WeakMap<File, string>());

  const sorted = useMemo(
    () => PEOPLE
      .filter((person) => person.name.toLowerCase().includes(query.toLowerCase()) && (!role || person.role === role) && (!standing || (standing === "active") === person.active) && (!joinedIn || person.joined.startsWith(joinedIn)))
      .sort((a, b) => compare(a, b, sorts)),
    [query, role, standing, joinedIn, sorts]
  );
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const from = Math.min(page, pages - 1) * pageSize;
  const rows = sorted.slice(from, from + pageSize);
  const sortBy = (key: string, direction: "asc" | "desc") => setSorts((current) => headerSort(current, key, direction));
  const toggle = (id: string) => setSelected((current) => {
    const next = new Set(current);
    if (!next.delete(id)) next.add(id);
    return next;
  });
  const toggleFruit = (value: string) => setFruits((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);

  async function upload(_file: File, progress: (sent: number, total: number) => void) {
    for (let step = 1; step <= 5; step++) {
      await wait(250);
      progress(step, 5);
    }
  }

  async function uploadToFolder(file: File, progress: (sent: number, total: number) => void) {
    folders.current.set(file, folderRef.current);
    await upload(file, progress);
  }

  async function failingUpload() {
    await wait(600);
    throw new Error("The server refused this file");
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">gibbing-headless-ui · React</h1>
        <nav className="flex flex-wrap gap-2 text-sm">
          {COMPONENTS.map((name) => <a key={name} href={`#${name.split(" ")[0]}`} className="rounded-full border border-zinc-200 bg-white px-3 py-1 hover:bg-zinc-100">{name}</a>)}
        </nav>
      </header>

      <Demo name="Breadcrumbs">
        <Variants>
          <Variant caption="Default">
            <Breadcrumbs crumbs={[{ label: "Home", href: "#", home: true }, { label: "Clients", href: "#" }, { label: "Ada Lovelace" }]} />
          </Variant>
          <Variant caption="Text separator and home icon">
            <Breadcrumbs separator="/" homeIcon="⌂" crumbs={[{ label: "Home", href: "#", home: true }, { label: "Settings", href: "#" }, { label: "Billing", href: "#" }, { label: "Invoices" }]} />
          </Variant>
        </Variants>
      </Demo>

      <Demo name="CardA">
        <Variants>
          {CARD_A.map(([interact, caption]) => (
            <Variant key={caption} caption={caption}>
              <div className="h-40">
                <CardA interact={interact} className="h-full" cardClass="rounded-xl" image={<div className="h-full w-full rounded-xl bg-indigo-300"></div>}>
                  <div className="flex h-full items-center justify-center rounded-xl bg-indigo-900 p-4 text-white">Back of the card</div>
                </CardA>
              </div>
            </Variant>
          ))}
        </Variants>
      </Demo>

      <Demo name="CardB">
        <Variants>
          {CARD_B.map(([preset, caption, color]) => (
            <Variant key={caption} caption={caption}>
              <div className="h-40">
                <CardB from_color={color} preset={preset} className="h-full rounded-xl" image={<div className="h-full w-full bg-zinc-300"></div>}>
                  <p className="p-4 text-white">Revealed on hover</p>
                </CardB>
              </div>
            </Variant>
          ))}
        </Variants>
      </Demo>

      <Demo name="DatePicker">
        <Variants>
          <Variant caption="Default"><DatePicker label="Due date" formId="demo-picker" value={date} onChange={setDate} /></Variant>
          <Variant caption="French locale"><DatePicker label="Échéance" formId="demo-picker-fr" locale="fr-FR" value={date} onChange={setDate} /></Variant>
          <Variant caption="Narrow: compact day labels"><DatePicker label="Narrow" formId="demo-picker-mini" value={date} onChange={setDate} className="max-w-52" /></Variant>
        </Variants>
      </Demo>

      <Demo name="DatePickerInput">
        <Variants>
          <Variant caption="Default (TextboxA), opens below"><DatePickerInput label="Start date" formId="demo-picker-input" value={date} onChange={setDate} /></Variant>
          <Variant caption="field = TextboxB"><DatePickerInput label="Due date" formId="demo-picker-input-b" value={date} onChange={setDate} field={(input) => <TextboxB {...input} />} /></Variant>
          <Variant caption="field = TextboxC, opens above"><DatePickerInput label="End date" formId="demo-picker-input-c" preset={DropdownPreset.TOP} value={date} onChange={setDate} field={(input) => <TextboxC {...input} placeholder="YYYY-MM-DD" />} /></Variant>
        </Variants>
      </Demo>

      <Demo name="Digitbox">
        <Variants>
          <Variant caption="6 digits, numbers only"><Digitbox label="Code" formId="demo-digits" digits={6} /></Variant>
          <Variant caption="4 characters in a form"><form><Digitbox label="Invite" formId="demo-digits-text" name="code" digits={4} isNumeric={false} /></form></Variant>
          <Variant caption="Disabled"><Digitbox label="Locked" formId="demo-digits-off" digits={4} disabled /></Variant>
        </Variants>
      </Demo>

      <Demo name="DualSlider">
        <Variants>
          <Variant caption="Labels outside"><DualSlider label="Price" formId="demo-dual" max={100} labelPos="o" /></Variant>
          <Variant caption="Step 0.5 with a formatter"><DualSlider label="Rating" formId="demo-dual-step" min={0} max={10} step={0.5} labelPos="o" labelParse={(n) => `${n.toFixed(1)}★`} /></Variant>
          <Variant caption="Labels inside the thumbs"><DualSlider label="Age" formId="demo-dual-in" min={18} max={99} labelPos="i" thumbClass="w-8" /></Variant>
          <Variant caption="No labels, custom colours"><DualSlider label="Range" formId="demo-dual-bare" max={1000} step={50} trackClass="bg-indigo-600" thumbClass="bg-indigo-600" /></Variant>
        </Variants>
      </Demo>

      <Demo name="FieldGuide">
        <Variants>
          <Variant caption="Short: no toggle"><FieldGuide text="Use a work email you can reach." /></Variant>
          <Variant caption="Long: default 3rem limit"><FieldGuide text={LONG_GUIDE} /></Variant>
          <Variant caption="limit={1.5} with custom toggles"><FieldGuide text={LONG_GUIDE} limit={1.5} expand="Read more ↓" collapse="Show less ↑" /></Variant>
        </Variants>
      </Demo>

      <Demo name="FileViewer">
        <Variants>
          <Variant caption="Image"><div className="h-56"><FileViewer src="/sample.svg" name="sample.svg" /></div></Variant>
          <Variant caption="Text from content"><div className="h-56"><FileViewer src="" name="notes.txt" content={"Meeting notes\n\n- Ship the demo\n- Review the z-index scale\n- Publish 1.2.0"} /></div></Variant>
          <Variant caption="Unsupported type: fallback"><div className="h-56"><FileViewer src="/sample.svg" name="archive.zip" kind="other" fallback="No preview for this file type." /></div></Variant>
        </Variants>
      </Demo>

      <Demo name="FilterRow">
        <div className="flex flex-col gap-6">
          <Variant caption="Search only">
            <FilterRow id="demo-filter" query={query} onInput={setQuery} clearable={!!query} onClear={() => setQuery("")} placeholder="Filter people" />
          </Variant>
          <Variant caption="With a filter control and refresh (filters the table below)">
            <FilterRow
              id="demo-filter-role"
              query={query}
              onInput={setQuery}
              sizes={[FILTER_SIZE]}
              applied={!!role}
              clearable={!!query || !!role}
              onClear={() => { setQuery(""); setRole(""); }}
              onRefresh={() => {}}
              placeholder="Filter people"
              controls={(slot) => (
                <Select label="Role" className="filter-slot" style={slot(0)} options={ROLES} value={role} placeholder="Any role" clearable onChange={setRole} />
              )}
            />
          </Variant>
          <Variant caption="Three filters: the More filters toggle appears only when they wrap">
            <FilterRow
              id="demo-filter-many"
              query={query}
              onInput={setQuery}
              sizes={[FILTER_SIZE, FILTER_SIZE, WIDE_SIZE]}
              applied={!!role || !!standing || !!joinedIn}
              clearable={!!query || !!role || !!standing || !!joinedIn}
              onClear={() => { setQuery(""); setRole(""); setStanding(""); setJoinedIn(""); }}
              placeholder="Filter people"
              controls={(slot) => (
                <>
                  <Select label="Role" className="filter-slot" style={slot(0)} options={ROLES} value={role} placeholder="Any role" clearable onChange={setRole} />
                  <Select label="Status" className="filter-slot" style={slot(1)} options={STANDINGS} value={standing} placeholder="Any status" clearable onChange={setStanding} />
                  <Select label="Joined in" className="filter-slot" style={slot(2)} options={YEARS} value={joinedIn} placeholder="Any year" clearable onChange={setJoinedIn} />
                </>
              )}
            />
          </Variant>
        </div>
      </Demo>

      <Demo name="GridView">
        <div className="flex flex-col gap-6">
          <Variant caption="Columns follow the container width">
            <GridView className="h-56" cardClass="rounded-lg" childrens={Object.fromEntries([...SWATCHES, "bg-lime-200", "bg-orange-200"].map((swatch, index) => [swatch, tile(index, swatch)]))} />
          </Variant>
          <Variant caption="columns={2}">
            <GridView className="h-56" columns={2} cardClass="rounded-lg" childrens={Object.fromEntries(SWATCHES.slice(0, 4).map((swatch, index) => [swatch, tile(index + 2, swatch)]))} />
          </Variant>
        </div>
      </Demo>

      <Demo name="ImageCarousel">
        <div className="flex flex-col gap-8">
          <Variant caption="Autoplay with indicators">
            <div className="h-56">
              <ImageCarousel timeout={4} className="h-full" cursor_color="text-zinc-700" indicators={{ indicated_color: "bg-indigo-600", dormant_color: "bg-zinc-300" }}
                images={SWATCHES.slice(0, 4).map((swatch) => [swatch, slide(swatch)])} />
            </div>
          </Variant>
          <Variant caption="Autoplay with a progress loader">
            <div className="h-56">
              <ImageCarousel timeout={5} className="h-full" cursor_color="text-zinc-700"
                loader={{ type: "linear-loader", fill_color: "bg-indigo-600", empty_color: "bg-zinc-200", onBottom: true }}
                images={SWATCHES.slice(2, 5).map((swatch) => [swatch, slide(swatch)])} />
            </div>
          </Variant>
          <Variant caption="Manual only">
            <div className="h-56">
              <ImageCarousel className="h-full" cursor_color="text-zinc-700" images={SWATCHES.slice(0, 2).map((swatch) => [swatch, slide(swatch)])} />
            </div>
          </Variant>
        </div>
      </Demo>

      <Demo name="Panel">
        <Variants>
          {PANELS.map(([preset, caption]) => (
            <Variant key={caption} caption={caption}>
              <div className="relative h-56 overflow-hidden rounded-xl border border-zinc-200">
                <Panel preset={preset} default_ratio="40%" modalClass="bg-white" modal={<p className="p-4">Drag the handle.</p>}>
                  <div className="h-full w-full bg-zinc-100 p-4">Main content</div>
                </Panel>
              </div>
            </Variant>
          ))}
          <Variant caption="Snaps to 25% or 75%">
            <div className="relative h-56 overflow-hidden rounded-xl border border-zinc-200">
              <Panel preset={PanelPreset.BOTTOM} ratio={[0, "<=", 0.25, "<", 0.5, "<=", 0.75, "<=", 1]} default_ratio={0} modalClass="bg-white" modal={<p className="p-4">Let go and it snaps.</p>}>
                <div className="h-full w-full bg-zinc-100 p-4">Main content</div>
              </Panel>
            </div>
          </Variant>
        </Variants>
      </Demo>

      <Demo name="PasswordField">
        <Variants>
          <Variant caption={'variant="a" (default)'}><PasswordField label="Password" formId="demo-password" /></Variant>
          <Variant caption={'variant="b", new password with an error'}><PasswordField variant="b" label="New password" formId="demo-password-new" autoComplete="new-password" defaultValue="abc" error="Use at least 12 characters" /></Variant>
          <Variant caption={'variant="c", text toggle'}><PasswordField variant="c" label="PIN" formId="demo-password-text" maxLength={8} showIcon="Show" hideIcon="Hide" placeholder="8 characters" /></Variant>
        </Variants>
      </Demo>

      <Demo name="PhoneField">
        <Variants>
          <Variant caption="Default input (menu opens above)"><PhoneField label="Phone" formId="demo-phone" /></Variant>
          <Variant caption="field = TextboxB, menu below"><PhoneField label="Mobile" formId="demo-phone-b" preset={DropdownPreset.BOTTOM} field={(input) => <TextboxB {...input} />} /></Variant>
          <Variant caption="field = TextboxC, with an error"><PhoneField label="Phone" formId="demo-phone-c" value="12" error="That number is too short" preset={DropdownPreset.BOTTOM} field={(input) => <TextboxC {...input} placeholder="412 345 678" />} /></Variant>
          <Variant caption="field = TextboxA"><PhoneField label="Work phone" formId="demo-phone-a" preset={DropdownPreset.BOTTOM} field={(input) => <TextboxA {...input} />} /></Variant>
        </Variants>
      </Demo>

      <Demo name="QrCode">
        <Variants>
          <Variant caption="Level M (default)"><QrCode value={REPO} label="Repository link" className="w-40" /></Variant>
          <Variant caption="Level H, no quiet zone"><QrCode value={REPO} label="Repository link" level="H" quiet={0} className="w-40" /></Variant>
          <Variant caption="Level L, small"><QrCode value="gibbing" label="Short text" level="L" className="w-24" /></Variant>
        </Variants>
      </Demo>

      <Demo name="ResourceTable">
        <div className="flex flex-col gap-6">
          <Variant caption={`Table: sorting, selection, paging, row actions${lastAction ? ` · last action: ${lastAction}` : ""}`}>
            <ResourceTable
              stackAt={40}
              columns={COLUMNS}
              rows={rows}
              status={status}
              menu
              actions={(person) => [
                { id: "edit", label: "Edit", run: () => setLastAction(`Edit ${person.name}`) },
                { id: "archive", label: "Archive", tone: "caution", run: () => setLastAction(`Archive ${person.name}`) },
                { id: "delete", label: "Delete", tone: "danger", run: () => setLastAction(`Delete ${person.name}`) }
              ]}
              sorts={sorts}
              sortable={SORTABLE}
              sortHeading={(key, label) => <SortHeading sortKey={key} label={label} sorts={sorts} onSort={sortBy} />}
              selectable
              selected={selected}
              onSelect={toggle}
              onSelectPage={(on) => setSelected(on ? new Set(rows.map((row) => row.id)) : new Set())}
              page={Math.min(page, pages - 1)}
              pages={pages}
              from={from}
              to={from + rows.length}
              total={sorted.length}
              pageSize={pageSize}
              pageSizes={[5, 10, 20]}
              onPage={setPage}
              onPageSize={(size) => {
                setPageSize(size);
                setPage(0);
              }}
            />
          </Variant>
          <Variant caption="Stacked cards (default stackAt) with an inline action">
            <ResourceTable columns={COLUMNS} rows={PEOPLE.slice(0, 3)} status={status} actions={(person) => [{ id: "open", label: "Open", run: () => setLastAction(`Open ${person.name}`) }]} />
          </Variant>
          <Variants>
            <Variant caption="Loading"><ResourceTable stackAt={24} columns={COLUMNS} rows={[]} busy /></Variant>
            <Variant caption="Empty, custom message"><ResourceTable stackAt={24} columns={COLUMNS} rows={[]} empty="No people match these filters." /></Variant>
          </Variants>
        </div>
      </Demo>

      <Demo name="Select" title="Select & Dropdown">
        <Variants>
          <Variant caption="Single"><Select label="Fruit" options={FRUITS} value={fruit} onChange={setFruit} /></Variant>
          <Variant caption="Multiple"><Select label="Fruits" options={FRUITS} multiple values={fruits} summary={fruits.length ? `${fruits.length} selected` : ""} onToggle={toggleFruit} /></Variant>
          <Variant caption="Clearable with a placeholder"><Select label="Fruit" options={FRUITS} value={clearableFruit} placeholder="Pick one" clearable onChange={setClearableFruit} /></Variant>
          <Variant caption="Custom option and error">
            <Select label="Fruit" options={FRUITS} value={fruit} error="Apples are out of season" onChange={setFruit}
              option={(option) => <span className="flex items-center gap-2"><span className={`size-2.5 rounded-full ${DOTS[option.value]}`}></span>{option.label}</span>} />
          </Variant>
          <Variant caption="Opens above"><Select label="Fruit" options={FRUITS} value={fruit} preset={DropdownPreset.TOP} onChange={setFruit} /></Variant>
        </Variants>
        <div id="Dropdown" data-component="Dropdown" className="mt-6">
          <h3 className="mb-3 text-[0.8125rem] font-semibold text-zinc-700">Dropdown</h3>
          <Variants>
            <Variant caption="Click, below">
              <Dropdown preset={DropdownPreset.BOTTOM} interact={Interact.CLICK} clickOut className="w-full" innerModalClass="border border-zinc-200 p-1" menu={menuItems}>
                <span className="field-box flex items-center justify-between">Open menu {chevron}</span>
              </Dropdown>
            </Variant>
            <Variant caption="Hover, below">
              <Dropdown preset={DropdownPreset.BOTTOM} interact={Interact.HOVER} className="w-full" innerModalClass="border border-zinc-200 p-1" menu={menuItems}>
                <span className="field-box flex items-center justify-between">Hover me {chevron}</span>
              </Dropdown>
            </Variant>
            <Variant caption="Click, opens to the right">
              <Dropdown preset={DropdownPreset.RIGHT} interact={Interact.CLICK} clickOut innerModalClass="border border-zinc-200 p-1" menu={menuItems}>
                <span className="field-box flex items-center gap-2">Open →</span>
              </Dropdown>
            </Variant>
            <Variant caption={"Select inside a dropdown, zIndex={Z.popover + 1}"}>
              <Dropdown preset={DropdownPreset.BOTTOM} interact={Interact.CLICK} clickOut zIndex={Z.popover} innerModalClass="w-64 border border-zinc-200 p-3"
                menu={[<Select key="fruit" label="Fruit" zIndex={Z.popover + 1} options={FRUITS} value={fruit} onChange={setFruit} />]}>
                <span className="field-box flex items-center justify-between">Open settings {chevron}</span>
              </Dropdown>
            </Variant>
          </Variants>
        </div>
      </Demo>

      <Demo name="Slider">
        <Variants>
          <Variant caption="Label on the right"><Slider label="Volume" formId="demo-slider" max={100} defaultValue={40} labelPos="r" /></Variant>
          <Variant caption="Label on the left, step 0.25"><Slider label="Zoom" formId="demo-slider-left" min={0.5} max={3} step={0.25} defaultValue={1} labelPos="l" labelParse={(n) => `${n.toFixed(2)}×`} /></Variant>
          <Variant caption="Label inside the thumb"><Slider label="Level" formId="demo-slider-in" max={10} defaultValue={3} labelPos="i" thumbClass="w-8" /></Variant>
          <Variant caption="No label, custom colours"><Slider label="Bare" formId="demo-slider-bare" max={100} defaultValue={70} trackClass="bg-emerald-600" thumbClass="bg-emerald-600" /></Variant>
        </Variants>
      </Demo>

      <Demo name="SmartGridView">
        <Variants>
          <Variant caption="3 columns">
            <SmartGridView className="h-56" columns={3} images={Object.fromEntries(SWATCHES.map((swatch, index) => [swatch, [1 + (index % 3) * 0.5, tile(index, swatch)]]))} />
          </Variant>
          <Variant caption="2 columns">
            <SmartGridView className="h-56" columns={2} images={Object.fromEntries(SWATCHES.slice(0, 4).map((swatch, index) => [swatch, [2 - (index % 2), tile(index + 1, swatch)]]))} />
          </Variant>
        </Variants>
      </Demo>

      <Demo name="SortHeading">
        <p className="mb-3 text-sm text-zinc-500">Shares its sort state with the table above: {sorts.length ? sorts.map((sort) => `${sort.key} ${sort.direction}`).join(", ") : "unsorted"}</p>
        <table><thead><tr>
          <th className="pr-8"><SortHeading sortKey="name" label="Name" sorts={sorts} onSort={sortBy} /></th>
          <th className="pr-8"><SortHeading sortKey="role" label="Role" sorts={sorts} onSort={sortBy} /></th>
          <th><SortHeading sortKey="joined" label="Joined" sorts={sorts} onSort={sortBy} ascLabel="Oldest" descLabel="Newest" /></th>
        </tr></thead></table>
      </Demo>

      <Demo name="TextEditor">
        <div className="flex flex-col gap-6">
          <Variant caption="Full toolbar with insertable snippets">
            <TextEditor label="Message" formId="demo-editor" maxLength={500} snippets={[{ label: "First name", text: "{{first_name}}" }, { label: "Company", text: "{{company}}" }]} />
          </Variant>
          <Variants>
            <Variant caption="Short, with an error"><TextEditor label="Bio" formId="demo-editor-error" rows={4} value="Hi" error="Write at least 20 characters" /></Variant>
            <Variant caption="Read-only"><TextEditor label="Terms" formId="demo-editor-ro" rows={4} readOnly value={"**These terms** are read-only.\n\n- You can select text\n- You cannot edit it"} /></Variant>
          </Variants>
        </div>
      </Demo>

      <Demo name="TextboxA">
        <Variants>
          <Variant caption="Default"><TextboxA label="Full name" formId="demo-a" /></Variant>
          <Variant caption="With an error"><TextboxA label="Username" formId="demo-a-error" error="That name is taken" /></Variant>
          <Variant caption="Digits only (guard)"><TextboxA label="Postcode" formId="demo-a-guard" mode="numeric" guard={/^\d{0,5}$/} maxLength={5} /></Variant>
          <Variant caption="Textarea (height 6)"><TextboxA label="Notes" formId="demo-a-area" height={6} wrap /></Variant>
        </Variants>
      </Demo>

      <Demo name="TextboxB">
        <Variants>
          <Variant caption="Default"><TextboxB label="Email" formId="demo-b" mode="email" /></Variant>
          <Variant caption="With an error"><TextboxB label="Email" formId="demo-b-error" defaultValue="ada@" error="Enter a valid email" /></Variant>
          <Variant caption="Textarea (height 6)"><TextboxB label="Message" formId="demo-b-area" height={6} wrap /></Variant>
          <Variant caption="On a tinted background"><TextboxB label="Search" formId="demo-b-tint" mode="search" className="rounded-xl bg-indigo-50 px-3" /></Variant>
        </Variants>
      </Demo>

      <Demo name="TextboxC">
        <Variants>
          <Variant caption="Default with a placeholder"><TextboxC label="Label" formId="demo-c" placeholder="Input text" /></Variant>
          <Variant caption="With an error"><TextboxC label="Amount" formId="demo-c-error" mode="decimal" defaultValue="-5" error="Must be positive" /></Variant>
          <Variant caption="Textarea (height 6)"><TextboxC label="Address" formId="demo-c-area" height={6} wrap placeholder="Street, city, postcode" /></Variant>
        </Variants>
      </Demo>

      <Demo name="Toggle">
        <Variants>
          <Variant caption="Default"><Toggle label="Notifications" formId="demo-toggle" /></Variant>
          <Variant caption="Custom colours"><Toggle label="Dark mode" formId="demo-toggle-color" trackClass="peer-checked:bg-indigo-600" /></Variant>
        </Variants>
      </Demo>

      <Demo name="Tooltip">
        <Variants>
          <Variant caption="String content, above (default)">
            <Tooltip content="Saves a draft without publishing"><button className="field-box">Save draft</button></Tooltip>
          </Variant>
          <Variant caption="Render prop content, below">
            <Tooltip preset={DropdownPreset.BOTTOM} content={() => <span className="flex flex-col"><b>Ctrl + K</b><span>Opens the command menu</span></span>}>
              <button className="field-box">Shortcuts</button>
            </Tooltip>
          </Variant>
          <Variant caption="Left and right">
            <span className="flex gap-16 px-12">
              <Tooltip preset={DropdownPreset.LEFT} content="Previous"><button className="field-box" aria-label="Previous">←</button></Tooltip>
              <Tooltip preset={DropdownPreset.RIGHT} content="Next"><button className="field-box" aria-label="Next">→</button></Tooltip>
            </span>
          </Variant>
          <Variant caption="Inline, trigger gets aria-describedby">
            <p className="text-sm text-zinc-600">Billed as{" "}
              <Tooltip content="Annual percentage rate">{(trigger) => <button type="button" {...trigger} className="cursor-help underline decoration-dotted">APR</button>}</Tooltip>
              {" "}each month.</p>
          </Variant>
          <Variant caption="Interactive, light theme">
            <Tooltip interactive innerModalClass="bg-white text-zinc-700 border border-zinc-200" content={() => <span>Read the <a className="text-indigo-600 underline" href="#Tooltip">docs</a></span>}>
              <button className="field-box">Hover, then click the link</button>
            </Tooltip>
          </Variant>
          <Variant caption="Always open">
            <span className="pt-10"><Tooltip open content="Pinned with open"><span className="field-box">Anchor</span></Tooltip></span>
          </Variant>
        </Variants>
      </Demo>

      <Demo name="UploadPanel">
        <div className="flex flex-col gap-6">
          <Variant caption="Default"><UploadPanel upload={upload} /></Variant>
          <Variant caption="Extra content and a per-file tag (folder chosen before upload)">
            <UploadPanel
              upload={uploadToFolder}
              tag={(item) => <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">{FOLDERS.find((entry) => entry.value === folders.current.get(item.file))?.label ?? "—"}</span>}
            >
              <Select label="Upload into" options={FOLDERS} value={folder} onChange={setFolder} className="max-w-xs" />
            </UploadPanel>
          </Variant>
          <Variant caption="Images only, one at a time, always fails"><UploadPanel upload={failingUpload} accept="image/*" multiple={false} /></Variant>
        </div>
      </Demo>
    </div>
  );
}
