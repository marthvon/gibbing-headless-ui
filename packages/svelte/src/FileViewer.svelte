<script lang="ts" module>
  export type { FileKind } from "./_internal/file_view";
  export type FileError = "image" | "video" | "read";
</script>

<script lang="ts">
  import { onDestroy, type Snippet } from "svelte";
  import { fileBadge, fileKind, fitPageWidth, htmlDocument, type FileKind } from "./_internal/file_view";
  import { ify, type Content } from "./utils";

  export let src: string;
  export let name: string;
  export let type: string = "";
  export let kind: FileKind | undefined = undefined;
  export let poster: string | undefined = undefined;
  export let content: string | undefined = undefined;
  export let fitWidth: boolean = true;
  export let autoplay: boolean = true;
  export let className: string | undefined = undefined;
  export let mediaClass: string | undefined = undefined;
  export let posterClass: string | undefined = undefined;
  export let frameClass: string | undefined = undefined;
  export let textClass: string | undefined = undefined;
  export let fallback: Content | undefined = undefined;
  export let loading: Content | undefined = undefined;
  export let failure: Content<[FileError]> | undefined = undefined;
  export let soundOnly: Content | undefined = undefined;
  export let prev: Content<[() => void]> | undefined = undefined;
  export let next: Content<[() => void]> | undefined = undefined;
  export let children: Snippet | undefined = undefined;
  export let onprev: (() => void) | undefined = undefined;
  export let onnext: (() => void) | undefined = undefined;
  export let onerror: ((error: FileError) => void) | undefined = undefined;

  let loaded = false;
  let problem: FileError | null = null;
  let noPicture = false;
  let fetched: string | null = null;
  let controller: AbortController | undefined;

  $: shown = kind ?? fileKind(name, type);
  $: open(src, shown, content);
  $: text = content ?? fetched;
  $: waiting = !problem && ((shown === "image" && !loaded) || ((shown === "text" || shown === "html") && text === null));

  onDestroy(() => controller?.abort());

  function fail(error: FileError) {
    problem = error;
    onerror?.(error);
  }

  function open(url: string, view: FileKind, given: string | undefined) {
    controller?.abort();
    controller = undefined;
    loaded = false;
    problem = null;
    noPicture = false;
    fetched = null;
    if ((view !== "text" && view !== "html") || given !== undefined || typeof window === "undefined") return;
    const current = new AbortController();
    controller = current;
    fetch(url, { signal: current.signal })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.text();
      })
      .then((body) => {
        if (!current.signal.aborted) fetched = body;
      })
      .catch(() => {
        if (!current.signal.aborted) fail("read");
      });
  }
</script>

{#snippet defaultFallback(note: string)}
  <div class="file-viewer-fallback">
    <span class="file-viewer-badge">{fileBadge(name)}</span>
    <p class="file-viewer-title">{name}</p>
    <p class="file-viewer-note">{note}</p>
  </div>
{/snippet}
{#snippet defaultLoading(text: string)}<p role="status" class="file-viewer-status">{text}</p>{/snippet}
{#snippet defaultFailure(error: FileError, text: string | undefined)}
  <p role="alert" class="file-viewer-error">
    {text ?? (error === "image" ? "This image could not be loaded" : error === "video" ? "This browser could not play the video. Download it to watch it" : "This file could not be opened")}
  </p>
{/snippet}
{#snippet defaultSoundOnly(text: string)}
  <p role="status" class="file-viewer-notice">{text}</p>
{/snippet}
{#snippet defaultPrev(run: () => void, text: string | undefined)}
  <button type="button" data-side="prev" aria-label="Previous file" class="file-viewer-nav" onclick={run}>
    {#if text}{text}{:else}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>{/if}
  </button>
{/snippet}
{#snippet defaultNext(run: () => void, text: string | undefined)}
  <button type="button" data-side="next" aria-label="Next file" class="file-viewer-nav" onclick={run}>
    {#if text}{text}{:else}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>{/if}
  </button>
{/snippet}

<div class={ify("file-viewer", className)}>
  {#if shown === "image"}
    {#if poster && !loaded}
      <img src={poster} alt="" aria-hidden="true" class={ify("file-viewer-poster", posterClass)} />
    {/if}
    {#if !problem}
      <img {src} alt={name} class={ify("file-viewer-media", mediaClass)} onload={() => (loaded = true)} onerror={() => fail("image")} />
    {/if}
  {:else if shown === "video"}
    <!-- svelte-ignore a11y_media_has_caption -->
    <video
      {src}
      {poster}
      controls
      {autoplay}
      playsinline
      class={ify("file-viewer-media file-viewer-video", mediaClass)}
      onloadeddata={(event) => (noPicture = event.currentTarget.videoWidth === 0)}
      onerror={() => fail("video")}
    ></video>
    {#if noPicture}{#if typeof soundOnly === "function"}{@render soundOnly()}{:else}{@render defaultSoundOnly(soundOnly ?? "This browser cannot show this video, only its sound. Download it to watch it.")}{/if}{/if}
  {:else if shown === "pdf"}
    <iframe src={fitWidth ? fitPageWidth(src) : src} title={name} class={ify("file-viewer-frame", frameClass)}></iframe>
  {:else if shown === "html"}
    {#if text !== null}
      <iframe sandbox="" srcdoc={htmlDocument(text)} title={name} class={ify("file-viewer-frame", frameClass)}></iframe>
    {/if}
  {:else if shown === "text"}
    {#if text !== null}<pre class={ify("file-viewer-text", textClass)}>{text}</pre>{/if}
  {:else}
    {#if typeof fallback === "function"}{@render fallback()}{:else}{@render defaultFallback(fallback ?? "This format has no preview. Download it to open it.")}{/if}
  {/if}
  {#if children}{@render children()}{/if}
  {#if waiting}{#if typeof loading === "function"}{@render loading()}{:else}{@render defaultLoading(loading ?? "Loading…")}{/if}{/if}
  {#if problem}{#if typeof failure === "function"}{@render failure(problem)}{:else}{@render defaultFailure(problem, failure)}{/if}{/if}
  {#if onprev}{#if typeof prev === "function"}{@render prev(onprev)}{:else}{@render defaultPrev(onprev, prev)}{/if}{/if}
  {#if onnext}{#if typeof next === "function"}{@render next(onnext)}{:else}{@render defaultNext(onnext, next)}{/if}{/if}
</div>
