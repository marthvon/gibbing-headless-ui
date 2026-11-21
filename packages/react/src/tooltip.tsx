"use client";

import type { ReactNode } from "react";
import { useId } from "react";
import { ify, zLayer } from "./utils";
import { DropdownPreset } from "./presets.client";

export type TooltipTrigger = { "aria-describedby": string };

function tooltipSide(preset: DropdownPreset) {
  return "tooltip-" + preset.split(" ")[2].replace("dropdown-hover-", "");
}

export default function Tooltip({
  content, preset = DropdownPreset.TOP, open, interactive, zIndex, className, wrapperClass, modalClass, innerModalClass, children
}: {
  content: ReactNode | (() => ReactNode);
  preset?: DropdownPreset;
  open?: boolean;
  interactive?: boolean;
  zIndex?: number;
  className?: string;
  wrapperClass?: string;
  modalClass?: string;
  innerModalClass?: string;
  children?: ReactNode | ((trigger: TooltipTrigger) => ReactNode);
}) {
  const id = "--tw-tooltip-" + useId();
  return (
    <span className={ify("tooltip", tooltipSide(preset), className)} style={zLayer(zIndex)} data-open={open || undefined} data-interactive={interactive || undefined}>
      {typeof children === "function" ? children({ "aria-describedby": id }) : children}
      <span id={id} role="tooltip" className={ify("dropdown-wrapper tooltip-wrapper", wrapperClass)}>
        <span className={ify("dropdown-outer-modal tooltip-outer", modalClass)}>
          <span className={ify("dropdown-modal tooltip-modal", innerModalClass)}>{typeof content === "function" ? content() : content}</span>
        </span>
      </span>
    </span>
  );
}
