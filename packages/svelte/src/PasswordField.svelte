<script lang="ts">
  import TextboxA from "./TextboxA.svelte";
  import TextboxB from "./TextboxB.svelte";
  import TextboxC from "./TextboxC.svelte";

  export let variant: "a" | "b" | "c" = "a";
  export let label: string;
  export let value: string = "";
  export let revealed: boolean = false;
  export let maxLength: number = 64;
  export let autocomplete: "current-password" | "new-password" = "current-password";
  export let onchange: ((value: string) => void) | undefined = undefined;

  $: Textbox = variant === "b" ? TextboxB : variant === "c" ? TextboxC : TextboxA;
</script>

<svelte:component
  this={Textbox}
  {...$$restProps}
  {label}
  {value}
  {maxLength}
  {autocomplete}
  spellcheck="false"
  secret
  bind:revealed
  oninput={(event: Event & { currentTarget: HTMLInputElement }) => {
    value = event.currentTarget.value;
    onchange?.(value);
  }}
/>
