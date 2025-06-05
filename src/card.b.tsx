"use client";

import { useId, type ReactNode } from "react";
import Image from "next/image";
import { ify, Interact, type InteractType } from "./utils";

export const CardInfoFrom = {
  RIGHT: {
    gradient_to: 'bg-gradient-to-l',
    translate_origin: 'translate-x-full',
    dormant_state: '-bg-position-x',
    initial_bg: [ 'bg-x-1/2', 'bg-x-3/4' ]
  },
  LEFT: {
    gradient_to: 'bg-gradient-to-r',
    translate_origin: '-translate-x-full',
    dormant_state: 'bg-position',
    initial_bg: [ 'bg-x-down', 'bg-x-1/2' ]
  },
  TOP: {
    gradient_to: 'bg-gradient-to-b',
    translate_origin: '-translate-y-full',
    dormant_state: '-bg-position-y',
    initial_bg: [ 'bg-y-1/2', 'bg-y-3/4' ]
  },
  BOTTOM: {
    gradient_to: 'bg-gradient-to-t',
    translate_origin: 'translate-y-full',
    dormant_state: 'bg-position',
    initial_bg: [ 'bg-y-down', 'bg-y-1/2' ]
  }
};
export type CardInfoFromType = typeof CardInfoFrom[keyof typeof CardInfoFrom];

export default function Card({ image, from_color, info_from=CardInfoFrom.BOTTOM, initial_clear=0, className, cardClass, interact=Interact.HOVER, children } : {
  image: ImageType, from_color: string | 'from-*', info_from?: CardInfoFromType, initial_clear?: 0 | 1,
  className?: string, cardClass?: string, interact?: InteractType, children?: ReactNode
}) {
  const id = "--tw-info-card-"+useId();
  return (<article className={ify("group layers overflow-hidden w-full", className)}>
    <input type="checkbox" id={"--tw-info-card-"+id} className="peer hidden absolute" />
    <Image src={image.src} width={image.width} height={image.height} alt={image.alt} className="layer w-full" />
    <label htmlFor={id} className={ify(
      "layer w-full h-full transition-all to-transparent", cardClass, info_from.dormant_state, info_from.initial_bg[initial_clear],
      from_color, info_from.gradient_to, (interact & Interact.HOVER) && "group-hover:bg-full", (interact & Interact.CLICK) && "peer-checked:bg-full cursor-pointer"
    )}></label>
    <label htmlFor={id} className={ify(
      "layer text-wrap overflow-auto w-fit max-w-full max-h-full transition-all", info_from.translate_origin, cardClass,
      (interact & Interact.HOVER) && "group-hover:translate-0", (interact & Interact.CLICK) && "peer-checked:translate-0 cursor-pointer"
    )}>
      { children }
    </label>
  </article>);  
}