"use client";

import type { ReactNode } from "react";
import { useId } from "react";
import { ify } from "./utils";
import { type DropdownPreset, Interact } from "./presets.client";

export default function Dropdown({
  className, modalClass, innerModalClass, 
  preset, interact, clickOut, menu, children
} : {
  className?: string, modalClass?: string, innerModalClass?: string,
  preset: DropdownPreset, interact: Interact, clickOut?: boolean
  menu: ReactNode[], children: ReactNode
}) {
  const id = "--tw-dropdown-modal-"+useId();
  const styles = preset.split(' ');
  return (<div className={ify("flex group",styles[0],className)}>
    <input type="checkbox" id={id} className="peer ghost-node" />
    <label htmlFor={id} className="group layer cursor-pointer w-full">{ children }</label>
    { (interact & Interact.CLICK) && clickOut? 
      <label  htmlFor={id} className="modal-background hidden-modal transition-all duration-300 peer-checked:appear-modal">
        <div className="h-full w-screen"></div>
      </label> 
    :'' }
    <label htmlFor={id} className={ify(
      "dropdown-wrapper semi-absolute", 
      (interact & Interact.CLICK) && styles[1], 
      (interact & Interact.HOVER) && styles[2]
    )}>
      <div className={ify("dropdown-outer-modal cursor-pointer",modalClass)}><div className={ify("dropdown-modal",innerModalClass)}>
        { menu.map(el => el) }
      </div></div>
    </label>
  </div>);
}