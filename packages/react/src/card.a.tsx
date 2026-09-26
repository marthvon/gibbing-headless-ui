"use client";

import { useId, type ReactNode } from "react";
import { ify } from "./utils";
import { Interact } from './presets.client';

export default function Card({ image, className, cardClass, interact=Interact.HOVER, children } : {
  image: ReactNode, className?: string, cardClass?: string, 
  interact?: Interact, children: ReactNode
}) {
  const id = "--tw-flip-card-"+useId();
  return (<article className={ify("group layers w-full drop-shadow-2xl", className)}>
    { (interact & Interact.CLICK) !== 0 && <input type="checkbox" id={"--tw-flip-card-"+id} className="peer ghost-node" /> }
    <label htmlFor={id} className={ify(
      "layer backface-hidden transition-all h-full w-full",
      cardClass, (interact & Interact.HOVER) && "group-hover:flip-xform", (interact & Interact.CLICK) && "peer-checked:flip-xform cursor-pointer"
    )}>{ image }</label>
    <label htmlFor={id} className={ify(
      "layer backface-hidden transition-all flip-xform text-wrap overflow-auto contained-bounds",
      cardClass, (interact & Interact.HOVER) && "group-hover:unflip-xform", (interact & Interact.CLICK) && "peer-checked:unflip-xform cursor-pointer"
    )}>
      { children }
    </label>
  </article>);  
}