"use client";

import type { Dispatch, FormEventHandler, ForwardedRef, MouseEventHandler, MutableRefObject, RefObject, SetStateAction, TouchEventHandler } from "react";
import { forwardRef, useState, useRef, useMemo, useEffect } from "react";
import { formatValue, labelWidth, snapValue } from "./_internal/slider";
import { bindRef, disable, ify } from "./utils";

type DualSliderProps = {
  formId?: string, label?: string,
  max: number, min?: number, step?: number,
  onInput?: FormEventHandler<HTMLInputElement>, onChange?: FormEventHandler<HTMLInputElement>,
  className?: string, trackClass?: string, thumbClass?: string, backtrackClass?: string,
  labelPos?: 'i'|'o', labelClass?: string, labelParse?: (n:number)=>string, name?: string
};
function findPercent(min:number, curr:number, max:number) {
  return (curr-min)/(max-min);
}
function findFraction(x:number, rect: DOMRect) {
  return (x - rect.left) / rect.width;
}
function EventFactory(
  self:number, internalRef:RefObject<HTMLInputElement>, 
  touchRef:MutableRefObject<[number|null, number|null]>, 
  setter:Dispatch<SetStateAction<number>>, 
  rect: MutableRefObject<DOMRect|undefined>,
  sliderRef: RefObject<HTMLDivElement>,
  rules: MutableRefObject<{ min: number, max: number, step: number }>,
  events: MutableRefObject<{
    onChange: Function | undefined;
    onInput: FormEventHandler<HTMLInputElement> | undefined;
  }>
) 
  : [ MouseEventHandler, TouchEventHandler, (e: MouseEvent | Touch) => void ]
{
  function measure() {
    if(sliderRef.current == null) return false;
    rect.current = sliderRef.current.getBoundingClientRect();
    return true;
  }
  function handleMouseDown() {
    if(!measure()) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('visibilitychange', handleMouseUp);
    window.addEventListener('blur', handleMouseUp);
  };
  function handleMouseMove(e: MouseEvent|Touch) {
    if(rect.current == undefined) return;
    const { min, max, step } = rules.current;
    const value = snapValue(findFraction(e.clientX, rect.current), min, max, step);
    const valSplit = (internalRef.current?.value)? internalRef.current.value.split(',') : [ min, max ];
    const limit = Number(valSplit[(self+1)%2]);
    if(self? value <= limit : value >= limit)
      return;
    valSplit[self] = String(value);
    internalRef.current && (internalRef.current.value = valSplit.join(','));
    setter(value);
    e instanceof MouseEvent && events.current.onInput && events.current.onInput(e as any);
  }
  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('visibilitychange', handleMouseUp);
    window.removeEventListener('blur', handleMouseUp);
    events.current.onChange && events.current.onChange(internalRef.current?.value);
  }
  const handleTouchStart : TouchEventHandler<HTMLDivElement> = (e) => {
    if(!measure()) return;
    touchRef.current[self] = e.targetTouches[0].identifier;
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('visibilitychange', handleTouchEnd);
    window.addEventListener('blur', handleTouchEnd);
  };
  function handleTouchMove(e: TouchEvent) {
    for (const touch of Array.from(e.touches))
      if (touch.identifier === touchRef.current[self]) {
        handleMouseMove(touch);
        events.current.onInput && events.current.onInput(e as any);
        break;
      }
  }
  function handleTouchEnd() {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('visibilitychange', handleTouchEnd);
    window.removeEventListener('blur', handleTouchEnd);
    touchRef.current[self] = null;
    events.current.onChange && events.current.onChange(internalRef.current?.value);
  }
  return [ handleMouseDown, handleTouchStart, handleMouseMove ];
}

const DualSlider = forwardRef<HTMLInputElement, DualSliderProps>(({
  formId, label, max, min=0, step=1, onChange, onInput, labelParse, name,
  className, trackClass, thumbClass, backtrackClass, labelPos, labelClass
} : DualSliderProps, 
  ref: ForwardedRef<HTMLInputElement>) => 
{
  const internalRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<[number|null, number|null]>([null, null]);
  const rules = useRef({ min, max, step });
  const events = useRef({ onChange, onInput });
  const rect = useRef<DOMRect>();
  const width = labelWidth(min, max, step, labelParse);
  const [ left_thumb_pos, setLeftThumbPos ] = useState(min);
  const [ right_thumb_pos, setRightThumbPos ] = useState(max);
  const lp = findPercent(min, left_thumb_pos, max)*100;
  const rp = findPercent(min, right_thumb_pos, max)*100;
  
  const [ handleMinMouseDown, handleMinTouchStart, handleMinMouseMove ] = 
    useMemo(() => EventFactory(0, internalRef, touchRef, setLeftThumbPos, rect, sliderRef, rules, events), []);
  const [ handleMaxMouseDown, handleMaxTouchStart, handleMaxMouseMove ] = 
    useMemo(() => EventFactory(1, internalRef, touchRef, setRightThumbPos, rect, sliderRef, rules, events), []);
  const inferHandlerMouse : MouseEventHandler<HTMLDivElement> = 
    (e) => sliderRef.current && (findFraction(e.clientX, sliderRef.current.getBoundingClientRect()) < 0.5?
      (handleMinMouseDown(e) as undefined || handleMinMouseMove(e as any)) 
        : (handleMaxMouseDown(e) as undefined || handleMaxMouseMove(e as any)));
  const inferHandlerTouch : TouchEventHandler<HTMLDivElement> = 
    (e) => sliderRef.current && (findFraction(e.targetTouches[0].clientX, sliderRef.current.getBoundingClientRect()) < 0.5?
      (handleMinTouchStart(e) as undefined || handleMinMouseMove(e.targetTouches[0] as Touch)) 
        : (handleMaxTouchStart(e) as undefined || handleMaxMouseMove(e.targetTouches[0] as Touch)));

  useEffect(() => { rules.current = { min, max, step } }, [min,max,step]);
  useEffect(() => { events.current = { onChange, onInput } }, [onChange, onInput]);
  useEffect(() => bindRef(ref, internalRef.current), [ref]);
  const core = (<div draggable={false} onDragStart={disable} className={ify("layers items-center w-full select-none drag-none",labelPos||labelPos=='o'||className)}>
    <input name={name} id={`${formId}-${label}`} ref={internalRef} type="hidden" />
    <div draggable={false} onDragStart={disable} onMouseDown={inferHandlerMouse} onTouchEnd={inferHandlerTouch} ref={sliderRef} 
      className={ify("layer slider-backtrack select-none drag-none",backtrackClass)} />
    <div draggable={false} onDragStart={disable} style={{marginLeft: lp+'%', width: (rp-lp)+'%'}} 
      className={ify("layer slider-track select-none drag-none",trackClass)} />
    <div draggable={false} onDragStart={disable} onMouseDown={handleMinMouseDown} onTouchStart={handleMinTouchStart}
      style={{marginLeft: lp+'%', transform: `translateX(-${lp}%)`}} className={ify("layer slider-thumb flex box select-none drag-none",thumbClass)}>
        {labelPos=='i'? <span className={ify("flex box slider-label-in",labelClass)}>{formatValue(left_thumb_pos, step, labelParse)}</span> :''}
    </div>
    <div draggable={false} onDragStart={disable} onMouseDown={handleMaxMouseDown} onTouchStart={handleMaxTouchStart}
      style={{marginLeft: rp+'%', transform: `translateX(-${rp}%)`}} className={ify("layer slider-thumb flex box select-none drag-none",thumbClass)}>
        {labelPos=='i'? <span className={ify("flex box slider-label-in",labelClass)}>{formatValue(right_thumb_pos, step, labelParse)}</span> :''}
    </div>
  </div>);
  return labelPos && labelPos == 'o'? (<div className={ify("flex",className)}>
    <span style={{width}} className={ify("slider-label-out text-left",labelClass)}>{formatValue(left_thumb_pos, step, labelParse)}</span>
    { core }
    <span style={{width}} className={ify("slider-label-out text-right",labelClass)}>{formatValue(right_thumb_pos, step, labelParse)}</span>
  </div>) : core;
})
DualSlider.displayName = "DualSlider";
export default DualSlider;