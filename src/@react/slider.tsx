"use client";

import type { FormEventHandler, ForwardedRef } from "react";
import { forwardRef, useState } from "react";
import { ify } from "./utils";

type SliderProps = {
  formId?: string, label?: string,
  max: number, min?: number, step?: number, defaultValue?: number,
  onInput?: FormEventHandler<HTMLInputElement>, onChange?: FormEventHandler<HTMLInputElement>,
  className?: string, trackClass?: string, thumbClass?: string, backtrackClass?: string,
  labelPos?: 'l'|'i'|'r', labelClass?: string, labelParse?: (n:number)=>string
};
function findPercent(min:number, curr:number, max:number) {
  return (curr-min)/(max-min);
}
const Slider = forwardRef<HTMLInputElement, SliderProps>(({
  formId, label,
  max, min=0, step, defaultValue, 
  onChange, onInput, labelParse,
  className, trackClass, thumbClass, backtrackClass, 
  labelPos, labelClass
} : SliderProps, 
  ref?: ForwardedRef<HTMLInputElement>) => 
{
  const [ thumb_pos, setThumbPos ] = useState(defaultValue??min);
  const p = (findPercent(min, thumb_pos, max)*100) + '%';
  const core = (<div className={ify("layers items-center w-full",(labelPos==undefined)||labelPos!='i'||className)}>
    <div className="layer slider-backtrack w-full"></div>
    <div style={{width: p}} className={ify("layer slider-track pointer-events-none",trackClass)}></div>
    <div style={{marginLeft: p, transform: `translateX(-${p})`}} 
      className={ify("layer slider-thumb flex box pointer-events-none",thumbClass)}>
        {labelPos=='i'? <span className={ify("flex box slider-label-in",labelClass)}>{labelParse?labelParse(thumb_pos):thumb_pos}</span> :''}
    </div>
    <input id={`${formId}-${label}`} type="range" ref={ref} max={max} min={min} step={step}
      className={ify("layer w-full appearance-none cursor-pointer opacity-0",backtrackClass)} 
      defaultValue={defaultValue??min} onChange={onChange}
      onInput={(e) => { setThumbPos(Number((e.target as HTMLInputElement).value)); onInput && onInput(e) }}
    />
  </div>);
  return labelPos && labelPos != 'i'? (<div className={ify("flex",labelPos=='r'&&"flex-row-reverse",className)}>
    <span className={ify("p-2",labelClass)}>{labelParse?labelParse(thumb_pos):thumb_pos}</span>
    { core }
  </div>) : core;
})
Slider.displayName = "Slider";
export default Slider;