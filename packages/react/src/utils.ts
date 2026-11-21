import type { CSSProperties, ForwardedRef, MutableRefObject, ReactNode } from "react";

export type Content<Args extends unknown[] = []> = string | ((...args: Args) => ReactNode);

export const Z = { raised: 1, sticky: 2, backdrop: 40, popover: 50, modal: 60, toast: 70 } as const;

export function zLayer(zIndex?: number, style?: CSSProperties): CSSProperties | undefined {
  if (zIndex === undefined) return style;
  return { ...style, "--z-popover": zIndex, "--z-backdrop": zIndex } as CSSProperties;
}

export function ify(...classes: (string|boolean|undefined|null|number)[]) : string|undefined {
  return (classes.reduce((ret, val) => val && typeof val == "string"? (ret+' '+val) : ret, "") as string)||undefined;
}
export function disable(e: any) {
  e.preventDefault();
}
export function bindRef(ref: ForwardedRef<any>, el: HTMLElement|null) {
  if(ref) {
    if(ref instanceof Function) {
      ref(el); return () => ref(null);
    } else {
      ref.current = el; return () => ref.current = null;
    }
  }
}
export function cacheRect(rect: MutableRefObject<DOMRect|undefined>, el: HTMLElement|null) {
  if(el == null) return;
  rect.current = el.getBoundingClientRect();
  const resized = new ResizeObserver(els => rect.current = els[0].target.getBoundingClientRect());
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