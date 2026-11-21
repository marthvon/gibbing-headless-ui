"use client";

import type { ChangeEvent, DragEvent, ForwardedRef, ReactNode } from "react";
import { forwardRef, useId, useImperativeHandle, useRef, useState } from "react";
import { KIND_LABELS, formatBytes, kindOf, uploadPercent, type Upload, type UploadFile } from "./_internal/upload";
import { ify, type Content } from "./utils";

export type { Upload, UploadFile, UploadKind, UploadProgress, UploadState } from "./_internal/upload";
export type UploadPanelHandle = { add: (files: Iterable<File>) => void };

export type UploadPanelProps = {
  upload: UploadFile;
  isDuplicate?: (error: unknown) => boolean;
  concurrency?: number;
  accept?: string;
  multiple?: boolean;
  formId?: string;
  uploadsLabel?: string;
  errorLabel?: string;
  className?: string;
  dropClass?: string;
  headerClass?: string;
  listClass?: string;
  itemClass?: string;
  barClass?: string;
  fillClass?: string;
  drop?: (dragging: boolean) => ReactNode;
  heading?: ReactNode;
  clear?: Content<[run: () => void]>;
  children?: ReactNode;
  name?: (upload: Upload) => ReactNode;
  tag?: (upload: Upload) => ReactNode;
  status?: (upload: Upload) => ReactNode;
  note?: (upload: Upload) => ReactNode;
  failure?: (upload: Upload, retry: () => void) => ReactNode;
  onSettled?: () => void;
};

function describe(item: Upload): string {
  if (item.state === "queued") return "Waiting";
  else if (item.state === "done") return "Uploaded";
  else if (item.state === "failed") return "Failed";
  else if (item.state === "duplicate") return "Duplicate";
  else if (item.sent >= item.total) return "Saving…";
  else return `${formatBytes(item.sent)} of ${formatBytes(item.total)}`;
}

const UploadPanel = forwardRef<UploadPanelHandle, UploadPanelProps>(function UploadPanel({
  upload, isDuplicate, concurrency = 2, accept, multiple = true, formId,
  uploadsLabel = "Uploads", errorLabel = "The upload failed", className, dropClass, headerClass, listClass,
  itemClass, barClass, fillClass, drop, heading, clear, children, name, tag, status, note, failure, onSettled
}: UploadPanelProps, ref: ForwardedRef<UploadPanelHandle>) {
  const inputId = (formId ? `${formId}-` : "--tw-upload-") + useId();
  const list = useRef<Upload[]>([]);
  const counter = useRef(0);
  const finished = useRef(false);
  const latest = useRef({ upload, isDuplicate, concurrency, errorLabel, onSettled });
  latest.current = { upload, isDuplicate, concurrency, errorLabel, onSettled };
  const [, render] = useState(0);
  const [dragging, setDragging] = useState(false);

  function replace(next: Upload[]) {
    list.current = next;
    render((count) => count + 1);
  }

  function patch(key: number, change: Partial<Upload>) {
    replace(list.current.map((item) => (item.key === key ? { ...item, ...change } : item)));
  }

  function pump() {
    let sending = list.current.filter((item) => item.state === "sending").length;
    for (const item of list.current) {
      if (sending >= latest.current.concurrency) break;
      if (item.state !== "queued") continue;
      sending += 1;
      patch(item.key, { state: "sending" });
      void send(item);
    }
    if (sending === 0 && finished.current) {
      finished.current = false;
      latest.current.onSettled?.();
    }
  }

  async function send(item: Upload) {
    try {
      await latest.current.upload(item.file, (sent, total) => patch(item.key, total > 0 ? { sent, total } : { sent }));
      const total = list.current.find((entry) => entry.key === item.key)?.total ?? item.total;
      patch(item.key, { state: "done", sent: total });
    } catch (error) {
      patch(item.key, {
        state: latest.current.isDuplicate?.(error) ? "duplicate" : "failed",
        error: error instanceof Error && error.message ? error.message : latest.current.errorLabel,
      });
    }
    finished.current = true;
    pump();
  }

  function add(files: Iterable<File>) {
    const added = Array.from(files, (file): Upload => ({
      key: counter.current++,
      file,
      kind: kindOf(file.name, file.type),
      sent: 0,
      total: file.size,
      state: "queued",
      error: null,
    }));
    replace([...list.current, ...added]);
    pump();
  }

  useImperativeHandle(ref, () => ({ add }), []);

  function retry(item: Upload) {
    patch(item.key, { state: "queued", sent: 0, error: null });
    pump();
  }

  function clearFinished() {
    replace(list.current.filter((item) => item.state === "queued" || item.state === "sending"));
  }

  function dragover(event: DragEvent) {
    event.preventDefault();
    setDragging(true);
  }

  const uploads = list.current;
  const settled = uploads.some((item) => item.state === "done" || item.state === "failed" || item.state === "duplicate");

  return (
    <div className={ify("upload-panel", className)}>
      <label
        htmlFor={inputId}
        className={ify("upload-drop", dragging && "upload-dragging", dropClass)}
        onDragEnter={dragover}
        onDragOver={dragover}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragging(false);
          add(Array.from(event.dataTransfer?.files ?? []));
        }}
      >
        {drop ? drop(dragging) : (
          <>
            <span className="upload-drop-title">Drop files here, or click to choose</span>
            <span className="upload-drop-hint">Images, videos, and documents. Each upload is sorted by its type.</span>
          </>
        )}
      </label>
      <input
        id={inputId}
        type="file"
        multiple={multiple}
        accept={accept}
        className="upload-input"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const input = event.currentTarget;
          add(Array.from(input.files ?? []));
          input.value = "";
        }}
      />
      {children}
      {uploads.length > 0 ? (
        <>
          <div className={ify("upload-header", headerClass)}>
            {heading == null || typeof heading === "string" ? <h3 className="upload-heading">{heading ?? uploadsLabel}</h3> : heading}
            {settled ? (typeof clear === "function" ? clear(clearFinished) : <button type="button" className="upload-clear" onClick={clearFinished}>{clear ?? "Clear finished"}</button>) : null}
          </div>
          <ul aria-label={uploadsLabel} className={ify("upload-list", listClass)}>
            {uploads.map((item) => (
              <li key={item.key} className={ify("upload-item", itemClass)}>
                <div className="upload-row">
                  {name ? name(item) : <span className="upload-name" title={item.file.name}>{item.file.name}</span>}
                  {tag ? tag(item) : null}
                  {status ? status(item) : <span className="upload-status">{KIND_LABELS[item.kind]} · {describe(item)}</span>}
                </div>
                <div
                  className={ify("upload-bar", barClass)}
                  role="progressbar"
                  aria-label={item.file.name}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={uploadPercent(item)}
                >
                  <div className={ify("upload-fill", fillClass)} data-state={item.state} style={{ width: `${uploadPercent(item)}%` }}></div>
                </div>
                {item.error && item.state === "duplicate"
                  ? (note ? note(item) : <p className="upload-note">{item.error}</p>)
                  : item.error
                    ? (failure ? failure(item, () => retry(item)) : (
                        <div className="upload-error">
                          <span className="upload-error-text">{item.error}</span>
                          <button type="button" className="upload-retry" onClick={() => retry(item)}>Retry</button>
                        </div>
                      ))
                    : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
});
UploadPanel.displayName = "UploadPanel";
export default UploadPanel;
