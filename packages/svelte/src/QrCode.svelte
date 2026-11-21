<script lang="ts" module>
  export type { QrLevel } from "./_internal/qr";
</script>

<script lang="ts">
  import { qrDrawing, type QrLevel } from "./_internal/qr";
  import { ify } from "./utils";

  export let value: string;
  export let label: string;
  export let level: QrLevel = "M";
  export let quiet: number = 4;
  export let className: string | undefined = undefined;

  $: drawing = qrDrawing(value, level, quiet);
</script>

<svg
  viewBox="0 0 {drawing.side} {drawing.side}"
  role="img"
  aria-label={label}
  shape-rendering="crispEdges"
  class={ify("qr-code", className)}
>
  <path d={drawing.path} fill="currentColor" />
</svg>
