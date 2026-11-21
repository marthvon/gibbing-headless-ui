"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { fileBadge, fileKind, fitPageWidth, htmlDocument, type FileKind } from "./_internal/file_view";
import { ify, type Content } from "./utils";

export type { FileKind } from "./_internal/file_view";
export type FileError = "image" | "video" | "read";

export type FileViewerProps = {
  src: string;
  name: string;
  type?: string;
  kind?: FileKind;
  poster?: string;
  content?: string;
  fitWidth?: boolean;
  autoPlay?: boolean;
  className?: string;
  mediaClass?: string;
  posterClass?: string;
  frameClass?: string;
  textClass?: string;
  fallback?: ReactNode;
  loading?: ReactNode;
  failure?: Content<[error: FileError]>;
  soundOnly?: ReactNode;
  prev?: Content<[run: () => void]>;
  next?: Content<[run: () => void]>;
  children?: ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  onError?: (error: FileError) => void;
};

const MESSAGES: Readonly<Record<FileError, string>> = {
  image: "This image could not be loaded",
  video: "This browser could not play the video. Download it to watch it",
  read: "This file could not be opened",
};

export default function FileViewer({
  src, name, type = "", kind, poster, content, fitWidth = true, autoPlay = true, className, mediaClass, posterClass,
  frameClass, textClass, fallback, loading, failure, soundOnly, prev, next, children, onPrev, onNext, onError
}: FileViewerProps) {
  const shown = kind ?? fileKind(name, type);
  const [loaded, setLoaded] = useState(false);
  const [problem, setProblem] = useState<FileError | null>(null);
  const [noPicture, setNoPicture] = useState(false);
  const [fetched, setFetched] = useState<string | null>(null);
  const latest = useRef(onError);
  latest.current = onError;

  function fail(error: FileError) {
    setProblem(error);
    latest.current?.(error);
  }

  useEffect(() => {
    setLoaded(false);
    setProblem(null);
    setNoPicture(false);
    setFetched(null);
    if ((shown !== "text" && shown !== "html") || content !== undefined) return;
    const controller = new AbortController();
    fetch(src, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.text();
      })
      .then((body) => {
        if (!controller.signal.aborted) setFetched(body);
      })
      .catch(() => {
        if (!controller.signal.aborted) fail("read");
      });
    return () => controller.abort();
  }, [src, shown, content]);

  const text = content ?? fetched;
  const waiting = !problem && ((shown === "image" && !loaded) || ((shown === "text" || shown === "html") && text === null));

  let body: ReactNode;
  if (shown === "image")
    body = (
      <>
        {poster && !loaded ? <img src={poster} alt="" aria-hidden="true" className={ify("file-viewer-poster", posterClass)} /> : null}
        {problem ? null : <img src={src} alt={name} className={ify("file-viewer-media", mediaClass)} onLoad={() => setLoaded(true)} onError={() => fail("image")} />}
      </>
    );
  else if (shown === "video")
    body = (
      <>
        <video
          src={src}
          poster={poster}
          controls
          autoPlay={autoPlay}
          playsInline
          className={ify("file-viewer-media file-viewer-video", mediaClass)}
          onLoadedData={(event) => setNoPicture(event.currentTarget.videoWidth === 0)}
          onError={() => fail("video")}
        ></video>
        {noPicture
          ? soundOnly == null || typeof soundOnly === "string"
            ? <p role="status" className="file-viewer-notice">{soundOnly ?? "This browser cannot show this video, only its sound. Download it to watch it."}</p>
            : soundOnly
          : null}
      </>
    );
  else if (shown === "pdf")
    body = <iframe src={fitWidth ? fitPageWidth(src) : src} title={name} className={ify("file-viewer-frame", frameClass)}></iframe>;
  else if (shown === "html")
    body = text !== null ? <iframe sandbox="" srcDoc={htmlDocument(text)} title={name} className={ify("file-viewer-frame", frameClass)}></iframe> : null;
  else if (shown === "text")
    body = text !== null ? <pre className={ify("file-viewer-text", textClass)}>{text}</pre> : null;
  else
    body = fallback == null || typeof fallback === "string" ? (
      <div className="file-viewer-fallback">
        <span className="file-viewer-badge">{fileBadge(name)}</span>
        <p className="file-viewer-title">{name}</p>
        <p className="file-viewer-note">{fallback ?? "This format has no preview. Download it to open it."}</p>
      </div>
    ) : fallback;

  return (
    <div className={ify("file-viewer", className)}>
      {body}
      {children}
      {waiting ? (loading == null || typeof loading === "string" ? <p role="status" className="file-viewer-status">{loading ?? "Loading…"}</p> : loading) : null}
      {problem ? (typeof failure === "function" ? failure(problem) : <p role="alert" className="file-viewer-error">{failure ?? MESSAGES[problem]}</p>) : null}
      {onPrev ? (typeof prev === "function" ? prev(onPrev) : (
        <button type="button" data-side="prev" aria-label="Previous file" className="file-viewer-nav" onClick={onPrev}>
          {prev ?? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>}
        </button>
      )) : null}
      {onNext ? (typeof next === "function" ? next(onNext) : (
        <button type="button" data-side="next" aria-label="Next file" className="file-viewer-nav" onClick={onNext}>
          {next ?? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>}
        </button>
      )) : null}
    </div>
  );
}
