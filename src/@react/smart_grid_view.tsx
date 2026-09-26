"use client";

import type { MutableRefObject, ReactNode } from "react";
import { useRef, useState } from "react";
import { ify } from "./utils";

type SmartGridImg = { [key in string]: [ number, ReactNode ] };
export default function SmartGridView({ images, className, innerClass, cardClass, template } : {
  className?: string, innerClass?: string, cardClass?: string,
  images: SmartGridImg, template?: ReactNode,
  onScrollEnd?: ()=>void
}) {
  const prevImg : MutableRefObject<SmartGridImg|null> = useRef(null);
  const imgTrie = useRef([]);
  const imgSet = useRef(new Set());
  const [ imgCols, setImgCols ] = useState([]);

  
  if(prevImg.current != images) {
    prevImg.current = images;
  }

  return (<div className={ify("flex flex-row w-full overflow-y-auto overflow-x-hidden",className)}>
    { imgCols.map(img =>
      <ul className={ify("flex flex-col w-full gap-3",innerClass)}>
        {/* <li key={key} className={ify("h-fit w-full my-3 break-inside-avoid",cardClass)}>{ children }</li>
      {Object.entries(childrens).map(([key, children]) => (
      ))} */}
      </ul>
    )}
  </div>);
}

/* { template && Array.from({ length: 7 }).map(() =>
  <div className="flex flex-col w-full break-inside-avoid hidden">{ template }</div>)
} */
