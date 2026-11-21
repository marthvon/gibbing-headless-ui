export function stepDecimals(step: number): number {
  const text = String(step);
  const exponent = text.indexOf("e-");
  if (exponent !== -1) return Number(text.slice(exponent + 2));
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

export function snapValue(fraction: number, min: number, max: number, step: number): number {
  const raw = min + Math.min(Math.max(fraction, 0), 1) * (max - min);
  const snapped = min + Math.round((raw - min) / step) * step;
  return Math.min(max, Number(snapped.toFixed(stepDecimals(step))));
}

export function formatValue(value: number, step: number, parse?: (n: number) => string): string {
  return parse ? parse(value) : value.toFixed(stepDecimals(step));
}

export function labelWidth(min: number, max: number, step: number, parse?: (n: number) => string): string {
  return `${Math.max(formatValue(min, step, parse).length, formatValue(max, step, parse).length)}ch`;
}
