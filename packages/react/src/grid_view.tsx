"use client";

import type { ReactNode } from "react";
import { ify } from "./utils";

export default function GridView({ className, innerClass, cardClass, childrens, template } : {
  className?: string, innerClass?: string, cardClass?: string,
  childrens: { [key in string]: ReactNode }, template?: ReactNode,
  onScrollEnd?: ()=>void
}) {
  return (<div className={ify("@container w-full overflow-y-auto overflow-x-hidden",className)}>
    <ul className={ify("grid-view w-full gap-3",innerClass)}>
      {Object.entries(childrens).map(([key, children]) => (
        <li key={key} className={ify("h-fit w-full my-3 break-inside-avoid",cardClass)}>{ children }</li>
      ))}
    </ul>
  </div>);
}
