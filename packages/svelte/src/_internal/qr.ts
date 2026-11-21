import qrcode from "qrcode-generator";

export type QrLevel = "L" | "M" | "Q" | "H";

/** An SVG drawing of `text`: its viewBox side, `quiet` blank modules included on every edge, and one path of dark modules. */
export function qrDrawing(text: string, level: QrLevel = "M", quiet = 4): { side: number; path: string } {
  const code = qrcode(0, level);
  code.addData(text);
  code.make();
  const count = code.getModuleCount();
  let path = "";
  for (let row = 0; row < count; row += 1)
    for (let column = 0; column < count; column += 1)
      if (code.isDark(row, column)) path += `M${column + quiet} ${row + quiet}h1v1h-1z`;
  return { side: count + quiet * 2, path };
}
