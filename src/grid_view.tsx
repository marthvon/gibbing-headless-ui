"use client";

import type { ReactNode } from "react";
import { ify } from "./utils";

export default function GridView({ className, innerClass, cardClass, childrens } : {
  className?: string, innerClass?: string, cardClass?: string, childrens: { [key in string]: ReactNode }
}) {
  return (<div className={ify("@container w-full overflow-y-auto overflow-x-hidden",className)}>
    <ul className={ify("columns-1 @md:columns-2 @3xl:columns-3 @5xl:columns-4 @8xl:columns-5 @10xl:columns-6 @12xl:columns-7 w-full gap-3",innerClass)}>
      {Object.entries(childrens).map(([key, children]) => (
        <li key={key} className={ify("h-fit w-full my-3 break-inside",cardClass)}>{ children }</li>
      ))}
    </ul>
  </div>);
}