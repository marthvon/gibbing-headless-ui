import { extensionOf, kindOf } from "./upload";

export type FileKind = "image" | "video" | "pdf" | "html" | "text" | "other";

const TEXT_EXTENSIONS = new Set(["txt", "md", "csv", "tsv", "json", "xml", "yaml", "yml", "log", "ini", "toml"]);
const HTML_POLICY = "default-src 'none'; img-src data: blob:; style-src 'unsafe-inline' data:; font-src data:";

export function fileKind(name: string, type: string = ""): FileKind {
  const media = kindOf(name, type);
  const extension = extensionOf(name);
  if (media !== "document") return media;
  else if (type === "application/pdf" || extension === "pdf") return "pdf";
  else if (type === "text/html" || extension === "html" || extension === "htm") return "html";
  else if (type.startsWith("text/") || TEXT_EXTENSIONS.has(extension)) return "text";
  else return "other";
}

export function fileBadge(name: string): string {
  return (extensionOf(name) || "file").toUpperCase();
}

/** Opens fitted to the page width with the thumbnail sidebar closed; an existing fragment is replaced. */
export function fitPageWidth(url: string): string {
  return `${url.split("#")[0]}#navpanes=0&view=FitH`;
}

/** The sandboxed frame gets no permissions and this policy loads nothing from the network, so a page cannot run scripts, call home, or show remote images. Links lose their own targets so the base sends every one to a popup, which the sandbox blocks. */
export function htmlDocument(source: string): string {
  return `<meta http-equiv="Content-Security-Policy" content="${HTML_POLICY}"><base target="_blank">${untargeted(source)}`;
}

function untargeted(source: string): string {
  if (typeof DOMParser === "undefined") return source.replace(/\starget\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  const page = new DOMParser().parseFromString(source, "text/html");
  for (const element of Array.from(page.querySelectorAll("[target]"))) element.removeAttribute("target");
  return page.documentElement.outerHTML;
}
