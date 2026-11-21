<script lang="ts" module>
  export type Crumb = { label: string; href?: string; home?: boolean };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { ify, type Content } from "./utils";

  export let crumbs: readonly Crumb[];
  export let label: string = "Breadcrumb";
  export let className: string | undefined = undefined;
  export let listClass: string | undefined = undefined;
  export let itemClass: string | undefined = undefined;
  export let separator: Content | undefined = undefined;
  export let homeIcon: Content | undefined = undefined;
  export let crumb: Snippet<[Crumb, boolean]> | undefined = undefined;
</script>

{#snippet face(entry: Crumb)}
  {#if entry.home && typeof homeIcon === "function"}
    {@render homeIcon()}
  {:else if entry.home && homeIcon}
    {homeIcon}
  {:else if entry.home}
    <svg viewBox="0 0 24 24" class="breadcrumbs-home" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M12 2.5 3 10.5V21.5h18V10.5L12 2.5ZM10.2 21.5V14.2h3.6v7.3h-3.6Z" />
    </svg>
  {:else}
    {entry.label}
  {/if}
{/snippet}

{#snippet defaultCrumb(entry: Crumb, current: boolean)}
  {#if current}
    <span aria-current="page" aria-label={entry.home ? entry.label : undefined} class="breadcrumbs-current">{@render face(entry)}</span>
  {:else}
    <a href={entry.href} aria-label={entry.home ? entry.label : undefined} class="breadcrumbs-link">{@render face(entry)}</a>
  {/if}
{/snippet}

<nav aria-label={label} class={ify("breadcrumbs", className)}>
  <ol class={ify("breadcrumbs-list", listClass)}>
    {#each crumbs as entry, index (`${index}-${entry.label}`)}
      {#if index > 0}
        <li aria-hidden="true" class="breadcrumbs-separator">{#if typeof separator === "function"}{@render separator()}{:else}{separator ?? "/"}{/if}</li>
      {/if}
      <li class={ify("breadcrumbs-item", itemClass)}>{@render (crumb ?? defaultCrumb)(entry, !entry.href)}</li>
    {/each}
  </ol>
</nav>
