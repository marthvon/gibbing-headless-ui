"use client";

import type { FormEventHandler, ForwardedRef, ReactNode } from "react";
import { forwardRef, useId } from "react";
import { ify } from "./utils";

type ToggleProps = {
  formId?: string, label?: string, children ?: ReactNode
  className?: string, trackClass?: string, thumbClass?: string,
  onChange?: FormEventHandler<HTMLInputElement>, name?: string
};

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(({
  formId, label, className, trackClass, thumbClass, children, onChange, name
}, ref: ForwardedRef<HTMLInputElement>) => {
  const id = `${formId}-${label}-${useId()}`;
  return (<div className={ify("layers toggle-base",className)}>
    <input name={name} ref={ref} id={id} type="checkbox" className="peer ghost-node" 
      onChange={(e) => {e.target.value = e.target.checked.toString(); onChange && onChange(e)}} />
    <div className={ify("layer toggle-track",trackClass)}></div>
    <div className="layer toggle-thumb-wrapper"><div className={ify("toggle-thumb",thumbClass)}>{ children }</div></div>
    <label htmlFor={id} className="layer cursor-pointer"></label>
  </div>);
});
Toggle.displayName = "Toggle";
export default Toggle;