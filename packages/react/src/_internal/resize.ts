type Measure = (entry: ResizeObserverEntry, rem: number) => void;

const measures = new WeakMap<Element, Measure>();
let observer: ResizeObserver | undefined;

function run(entries: ResizeObserverEntry[]) {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  for (const entry of entries) measures.get(entry.target)?.(entry, rem);
}

export function observeSize(element: Element, measure: Measure) {
  measures.set(element, measure);
  observer ??= new ResizeObserver(run);
  observer.unobserve(element);
  observer.observe(element);
}

export function unobserveSize(element: Element) {
  measures.delete(element);
  observer?.unobserve(element);
}

export function sizeRef<T>(watch: (element: Element, value: T) => void, value: T) {
  let current: Element | null = null;
  return (element: Element | null) => {
    if (current) unobserveSize(current);
    current = element;
    if (element) watch(element, value);
  };
}
