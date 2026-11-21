import { observeSize, unobserveSize } from "./resize";

export function watchOverflow(content: Element, limit: number) {
  observeSize(content, (entry, rem) => {
    const body = entry.target.parentElement;
    if (body == null) return;
    const height = entry.borderBoxSize?.[0]?.blockSize ?? (entry.target as HTMLElement).offsetHeight;
    body.style.setProperty("--field-guide-full", `${Math.ceil(height)}px`);
    body.toggleAttribute("data-overflow", height > limit * rem + 1);
  });
}

export function overflow(node: HTMLElement, limit: number) {
  watchOverflow(node, limit);
  return {
    update: (next: number) => watchOverflow(node, next),
    destroy: () => unobserveSize(node)
  };
}
