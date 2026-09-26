export function ify(...classes: (string|boolean|undefined|null|number)[]) : string|undefined {
  return (classes.reduce((ret, val) => val && typeof val == "string"? (ret+' '+val) : ret, "") as string)||undefined;
}
export function twId(component: string, label?: string, formId?: string): string {
  const slug = label ? label.toLowerCase().replaceAll(" ", "_") : (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2));
  return formId ? `${formId}-${slug}` : `--tw-${component}-${slug}`;
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
