import type { Snippet } from "svelte";

export type Content<Args extends unknown[] = []> = string | Snippet<Args>;

export const Z = { raised: 1, sticky: 2, backdrop: 40, popover: 50, modal: 60, toast: 70 } as const;

export function zLayer(zIndex?: number, style?: string): string | undefined {
  if (zIndex === undefined) return style;
  return `${style ? `${style};` : ""}--z-popover:${zIndex};--z-backdrop:${zIndex}`;
}

export function ify(...classes: (string|boolean|undefined|null|number)[]) : string|undefined {
  return (classes.reduce((ret, val) => val && typeof val == "string"? (ret+' '+val) : ret, "") as string)||undefined;
}
let instances = 0;
export function twId(component: string, label?: string, formId?: string): string {
  const slug = label ? `-${label.toLowerCase().replaceAll(" ", "_")}` : "";
  return `${formId ? `${formId}-` : "--tw-"}${component}${slug}-${++instances}`;
}
export function classify(obj: Record<string, unknown>): string|undefined {
  let ret = "";
  for(const key in obj)
    if(obj[key]) ret += " " + key;
  return ret.slice(1) || undefined;
}
export function disable(e: Event) {
  e.preventDefault();
}
export function cacheRect(el: HTMLElement | null, setRect: (rect: DOMRect) => void) {
  if(el == null) return;
  setRect(el.getBoundingClientRect());
  const resized = new ResizeObserver(els => setRect(els[0].target.getBoundingClientRect()));
  resized.observe(el);
  return () => resized.disconnect();
}
export function addEventListeners<K extends keyof DocumentEventMap>(
  ...events: [K|K[], (this: Document, ev: DocumentEventMap[K]) => any][]
) {
  for(const [ event, listener ] of events)
    if(Array.isArray(event))
      for(const e of event)
        document.addEventListener(e, listener);
    else
      document.addEventListener(event, listener);
}
export function removeEventListeners<K extends keyof DocumentEventMap>(...events: [K|K[], (this: Document, ev: DocumentEventMap[K]) => any][]) {
  for(const [ event, listener ] of events)
    if(Array.isArray(event))
      for(const e of event)
        document.removeEventListener(e, listener);
    else
      document.removeEventListener(event, listener);
}
