export function restartLoader(clock: HTMLElement | null | undefined, running: boolean) {
  if (!clock) return;
  clock.removeAttribute("data-running");
  if (!running) return;
  void clock.offsetWidth;
  clock.setAttribute("data-running", "");
}
