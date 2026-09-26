"use client";

import { useId, type ReactNode } from "react";
import { ify } from "./utils";
import { type CardPreset, Interact } from './presets.client';

export default function Card({ image, from_color, preset, className, cardClass, interact=Interact.HOVER, children } : {
  image: ReactNode, from_color: string | 'from-*', className?: string, cardClass?: string, 
  interact?: Interact, preset: CardPreset, children?: ReactNode
}) {
  const id = "--tw-info-card-"+useId();
  const styles = preset.split(' | ');
  return (<article className={ify("group layers overflow-hidden w-full", className)}>
    <input type="checkbox" id={"--tw-info-card-"+id} className="peer ghost-node" />
    <div className="layer w-full h-full">{ image }</div>
    <label htmlFor={id} className={ify(
      "layer w-full h-full transition-all to-transparent", cardClass, styles[0],
      from_color, (interact & Interact.HOVER) && "group-hover:bg-full", (interact & Interact.CLICK) && "peer-checked:bg-full cursor-pointer"
    )}></label>
    <label htmlFor={id} className={ify(
      "layer text-wrap overflow-auto contained-bounds transition-all", styles[1], cardClass,
      (interact & Interact.HOVER) && "group-hover:translate-0", (interact & Interact.CLICK) && "peer-checked:translate-0 cursor-pointer"
    )}>
      { children }
    </label>
  </article>);  
}