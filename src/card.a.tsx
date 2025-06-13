"use client";

import { useId, type ReactNode } from "react";
import Image from "next/image";
import { ify, Interact } from "./utils";
import type { ImageType, InteractType } from './types';

export default function Card({ image, className, cardClass, interact=Interact.HOVER, children } : {
  image: ImageType, className?: string, cardClass?: string, 
  interact?: InteractType, children: ReactNode
}) {
  const id = "--tw-flip-card-"+useId();
  return (<article className={ify("group layers w-full drop-shadow-2xl", className)}>
    { (interact & Interact.CLICK) !== 0 && <input type="checkbox" id={"--tw-flip-card-"+id} className="peer hidden absolute" /> }
    <label htmlFor={id} className={ify(
      "layer backface-hidden transition-all h-full w-full",
      cardClass, (interact & Interact.HOVER) && "group-hover:flip-xform", (interact & Interact.CLICK) && "peer-checked:flip-xform cursor-pointer"
    )}>
      <Image src={image.src} width={image.width} height={image.height} alt={image.alt} className="w-full" />
    </label>
    <label htmlFor={id} className={ify(
      "layer backface-hidden transition-all flip-xform text-wrap overflow-auto max-h-full max-w-full",
      cardClass, (interact & Interact.HOVER) && "group-hover:unflip-xform", (interact & Interact.CLICK) && "peer-checked:unflip-xform cursor-pointer"
    )}>
      { children }
    </label>
  </article>);  
}