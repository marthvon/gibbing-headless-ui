"use client";

import { qrDrawing, type QrLevel } from "./_internal/qr";
import { ify } from "./utils";

export type { QrLevel } from "./_internal/qr";

export default function QrCode({
  value, label, level = "M", quiet = 4, className
}: {
  value: string;
  label: string;
  level?: QrLevel;
  quiet?: number;
  className?: string;
}) {
  const drawing = qrDrawing(value, level, quiet);
  return (
    <svg
      viewBox={`0 0 ${drawing.side} ${drawing.side}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={ify("qr-code", className)}
    >
      <path d={drawing.path} fill="currentColor" />
    </svg>
  );
}
