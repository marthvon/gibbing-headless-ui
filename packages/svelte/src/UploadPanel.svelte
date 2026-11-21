<script lang="ts" module>
  export type { Upload, UploadFile, UploadKind, UploadProgress, UploadState } from "./_internal/upload";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { KIND_LABELS, formatBytes, kindOf, uploadPercent, type Upload, type UploadFile } from "./_internal/upload";
  import { ify, twId, type Content } from "./utils";

  export let upload: UploadFile;
  export let isDuplicate: ((error: unknown) => boolean) | undefined = undefined;
  export let concurrency: number = 2;
  export let accept: string | undefined = undefined;
  export let multiple: boolean = true;
  export let formId: string | undefined = undefined;
  export let uploadsLabel: string = "Uploads";
  export let errorLabel: string = "The upload failed";
  export let className: string | undefined = undefined;
  export let dropClass: string | undefined = undefined;
  export let headerClass: string | undefined = undefined;
  export let listClass: string | undefined = undefined;
  export let itemClass: string | undefined = undefined;
  export let barClass: string | undefined = undefined;
  export let fillClass: string | undefined = undefined;
  export let drop: Snippet<[boolean]> | undefined = undefined;
  export let heading: Content | undefined = undefined;
  export let clear: Content<[() => void]> | undefined = undefined;
  export let children: Snippet | undefined = undefined;
  export let name: Snippet<[Upload]> | undefined = undefined;
  export let tag: Snippet<[Upload]> | undefined = undefined;
  export let status: Snippet<[Upload]> | undefined = undefined;
  export let note: Snippet<[Upload]> | undefined = undefined;
  export let failure: Snippet<[Upload, () => void]> | undefined = undefined;
  export let onsettled: (() => void) | undefined = undefined;

  const inputId = twId("upload", "files", formId);
  let uploads: Upload[] = [];
  let dragging = false;
  let counter = 0;
  let finished = false;

  $: settled = uploads.some((item) => item.state === "done" || item.state === "failed" || item.state === "duplicate");

  export function add(files: Iterable<File>) {
    const added = Array.from(files, (file): Upload => ({
      key: counter++,
      file,
      kind: kindOf(file.name, file.type),
      sent: 0,
      total: file.size,
      state: "queued",
      error: null,
    }));
    uploads = [...uploads, ...added];
    pump();
  }

  function patch(key: number, change: Partial<Upload>) {
    uploads = uploads.map((item) => (item.key === key ? { ...item, ...change } : item));
  }

  function pump() {
    let sending = uploads.filter((item) => item.state === "sending").length;
    for (const item of uploads) {
      if (sending >= concurrency) break;
      if (item.state !== "queued") continue;
      sending += 1;
      patch(item.key, { state: "sending" });
      void send(item);
    }
    if (sending === 0 && finished) {
      finished = false;
      onsettled?.();
    }
  }

  async function send(item: Upload) {
    try {
      await upload(item.file, (sent, total) => patch(item.key, total > 0 ? { sent, total } : { sent }));
      const total = uploads.find((entry) => entry.key === item.key)?.total ?? item.total;
      patch(item.key, { state: "done", sent: total });
    } catch (error) {
      patch(item.key, {
        state: isDuplicate?.(error) ? "duplicate" : "failed",
        error: error instanceof Error && error.message ? error.message : errorLabel,
      });
    }
    finished = true;
    pump();
  }

  function retry(item: Upload) {
    patch(item.key, { state: "queued", sent: 0, error: null });
    pump();
  }

  function clearFinished() {
    uploads = uploads.filter((item) => item.state === "queued" || item.state === "sending");
  }

  function picked(event: Event & { currentTarget: HTMLInputElement }) {
    const input = event.currentTarget;
    add(Array.from(input.files ?? []));
    input.value = "";
  }

  function dragover(event: DragEvent) {
    event.preventDefault();
    dragging = true;
  }

  function dropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    dragging = false;
    add(Array.from(event.dataTransfer?.files ?? []));
  }
</script>

{#snippet defaultDrop()}
  <span class="upload-drop-title">Drop files here, or click to choose</span>
  <span class="upload-drop-hint">Images, videos, and documents. Each upload is sorted by its type.</span>
{/snippet}
{#snippet defaultHeading(text: string)}<h3 class="upload-heading">{text}</h3>{/snippet}
{#snippet defaultClear(run: () => void, text: string)}<button type="button" class="upload-clear" onclick={run}>{text}</button>{/snippet}
{#snippet defaultName(item: Upload)}<span class="upload-name" title={item.file.name}>{item.file.name}</span>{/snippet}
{#snippet defaultStatus(item: Upload)}
  <span class="upload-status">
    {KIND_LABELS[item.kind]} ·
    {#if item.state === "queued"}Waiting{:else if item.state === "done"}Uploaded{:else if item.state === "failed"}Failed{:else if item.state === "duplicate"}Duplicate{:else if item.sent >= item.total}Saving…{:else}{formatBytes(item.sent)} of {formatBytes(item.total)}{/if}
  </span>
{/snippet}
{#snippet defaultNote(item: Upload)}<p class="upload-note">{item.error}</p>{/snippet}
{#snippet defaultFailure(item: Upload, run: () => void)}
  <div class="upload-error">
    <span class="upload-error-text">{item.error}</span>
    <button type="button" class="upload-retry" onclick={run}>Retry</button>
  </div>
{/snippet}

<div class={ify("upload-panel", className)}>
  <label
    for={inputId}
    class={ify("upload-drop", dragging && "upload-dragging", dropClass)}
    ondragenter={dragover}
    ondragover={dragover}
    ondragleave={() => (dragging = false)}
    ondrop={dropped}
  >
    {#if drop}{@render drop(dragging)}{:else}{@render defaultDrop()}{/if}
  </label>
  <input id={inputId} type="file" {multiple} {accept} class="upload-input" onchange={picked} />
  {#if children}{@render children()}{/if}

  {#if uploads.length > 0}
    <div class={ify("upload-header", headerClass)}>
      {#if typeof heading === "function"}{@render heading()}{:else}{@render defaultHeading(heading ?? uploadsLabel)}{/if}
      {#if settled}{#if typeof clear === "function"}{@render clear(clearFinished)}{:else}{@render defaultClear(clearFinished, clear ?? "Clear finished")}{/if}{/if}
    </div>
    <ul aria-label={uploadsLabel} class={ify("upload-list", listClass)}>
      {#each uploads as item (item.key)}
        <li class={ify("upload-item", itemClass)}>
          <div class="upload-row">
            {@render (name ?? defaultName)(item)}
            {#if tag}{@render tag(item)}{/if}
            {@render (status ?? defaultStatus)(item)}
          </div>
          <div
            class={ify("upload-bar", barClass)}
            role="progressbar"
            aria-label={item.file.name}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={uploadPercent(item)}
          >
            <div class={ify("upload-fill", fillClass)} data-state={item.state} style:width="{uploadPercent(item)}%"></div>
          </div>
          {#if item.error && item.state === "duplicate"}
            {@render (note ?? defaultNote)(item)}
          {:else if item.error}
            {@render (failure ?? defaultFailure)(item, () => retry(item))}
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
