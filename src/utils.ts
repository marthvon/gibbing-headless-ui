export function ify(...classes: (string|boolean|undefined|null|number)[]) : string {
   return classes.reduce((ret, val) => ret == ""? val : (val? (ret+' '+val) : ret), "") as string;
}

export const Interact = {
  HOVER: 1,
  CLICK: 2,
  HOVER_N_CLICK: 3
} as const;