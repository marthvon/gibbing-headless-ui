export type UploadKind = "image" | "video" | "document";
export type UploadState = "queued" | "sending" | "done" | "failed" | "duplicate";
export type UploadProgress = (sent: number, total: number) => void;
export type UploadFile = (file: File, progress: UploadProgress) => Promise<void>;
export type Upload = {
  key: number;
  file: File;
  kind: UploadKind;
  sent: number;
  total: number;
  state: UploadState;
  error: string | null;
};

const VIDEO_EXTENSIONS = new Set(["mp4", "m4v", "mov", "qt", "3gp", "3g2", "webm", "mkv", "avi", "mpg", "mpeg"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "jpe", "jfif", "png", "gif", "webp", "bmp", "tif", "tiff", "avif", "heic", "heif", "svg"]);

export const KIND_LABELS: Readonly<Record<UploadKind, string>> = { image: "Image", video: "Video", document: "Document" };

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1).toLowerCase() : "";
}

export function kindOf(name: string, mime: string): UploadKind {
  if (mime.startsWith("image/") || IMAGE_EXTENSIONS.has(extensionOf(name))) return "image";
  else if (mime.startsWith("video/") || VIDEO_EXTENSIONS.has(extensionOf(name))) return "video";
  else return "document";
}

export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return `${unit === 0 ? value : value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

export function uploadPercent(upload: Upload): number {
  if (upload.state === "done") return 100;
  else return upload.total > 0 ? Math.min(100, Math.round((upload.sent / upload.total) * 100)) : 0;
}
