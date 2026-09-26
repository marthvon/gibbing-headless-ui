"use client";

import type { Dispatch, FormEventHandler, ForwardedRef, MouseEventHandler, MutableRefObject, RefObject, SetStateAction, TouchEventHandler } from "react";
import { forwardRef, useState, useRef, useMemo, useEffect } from "react";
import { bindRef, cacheRect, disable, ify } from "./utils";

type DualSliderProps = {
  formId?: string, label?: string,
  max: number, min?: number, step?: number,
  onInput?: FormEventHandler<HTMLInputElement>, onChange?: FormEventHandler<HTMLInputElement>,
  className?: string, trackClass?: string, thumbClass?: string, backtrackClass?: string,
  labelPos?: 'i'|'o', labelClass?: string, labelParse?: (n:number)=>string
};
function findPercent(min:number, curr:number, max:number) {
  return (curr-min)/(max-min);
}
function findValue(x:number, rect: DOMRect, range: number) {
  return ((x - rect.left) / rect.width) * range;
}
function EventFactory(
  self:number, internalRef:RefObject<HTMLInputElement>, 
  touchRef:MutableRefObject<[number|null, number|null]>, 
  setter:Dispatch<SetStateAction<number>>, 
  rect: MutableRefObject<DOMRect>,
  rules: MutableRefObject<{ min: number, max: number, step?: number }>,
  events: MutableRefObject<{
    onChange: Function | undefined;
    onInput: FormEventHandler<HTMLInputElement> | undefined;
  }>
) 
  : [ MouseEventHandler, TouchEventHandler, (e: MouseEvent | Touch) => void ]
{
  function handleMouseDown() {
    if(rect.current == undefined) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('visibilitychange', handleMouseUp);
    window.addEventListener('blur', handleMouseUp);
  };
  function handleMouseMove(e: MouseEvent|Touch) {
    const { min, max, step } = rules.current;
    let value = findValue(e.clientX, rect.current, max-min);
    const valSplit = (internalRef.current?.value)? internalRef.current.value.split(',') : [ min, max ];
    const limit = Number(valSplit[(self+1)%2]);
    if(step)
      value = Math.round((value - min) / step)*step;
    if(self) {
      if(value <= limit)
        return;
      else if(value > max)
        value = max;
    } else {
      if(value >= limit)
        return;
      else if(value < min)
        value = min;
    }
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
    if(rect.current == undefined) return;
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
  formId, label, max, min=0, step, onChange, onInput, labelParse,
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
  const [ left_thumb_pos, setLeftThumbPos ] = useState(min);
  const [ right_thumb_pos, setRightThumbPos ] = useState(max);
  const lp = findPercent(min, left_thumb_pos, max)*100;
  const rp = findPercent(min, right_thumb_pos, max)*100;
  
  const [ handleMinMouseDown, handleMinTouchStart, handleMinMouseMove ] = 
    useMemo(() => EventFactory(0, internalRef, touchRef, setLeftThumbPos, rect as MutableRefObject<DOMRect>, rules, events), []);
  const [ handleMaxMouseDown, handleMaxTouchStart, handleMaxMouseMove ] = 
    useMemo(() => EventFactory(1, internalRef, touchRef, setRightThumbPos, rect as MutableRefObject<DOMRect>, rules, events), []);
  const inferHandlerMouse : MouseEventHandler<HTMLDivElement> = 
    (e) => rect.current && (findValue(e.clientX, rect.current, max-min) < ((max-min)/2)?
      (handleMinMouseDown(e) as undefined || handleMinMouseMove(e as any)) 
        : (handleMaxMouseDown(e) as undefined || handleMaxMouseMove(e as any)));
  const inferHandlerTouch : TouchEventHandler<HTMLDivElement> = 
    (e) => rect.current && (findValue(e.targetTouches[0].clientX, rect.current, max-min) < ((max-min)/2)?
      (handleMinTouchStart(e) as undefined || handleMinMouseMove(e.targetTouches[0] as Touch)) 
        : (handleMaxTouchStart(e) as undefined || handleMaxMouseMove(e.targetTouches[0] as Touch)));

  useEffect(() => cacheRect(rect, sliderRef.current), []);
  useEffect(() => { rules.current = { min, max, step } }, [min,max,step]);
  useEffect(() => { events.current = { onChange, onInput } }, [onChange, onInput]);
  useEffect(() => bindRef(ref, internalRef.current), [ref]);
  const core = (<div draggable={false} onDragStart={disable} className={ify("layers items-center w-full select-none drag-none",labelPos||labelPos=='o'||className)}>
    <input id={`${formId}-${label}`} ref={internalRef} type="hidden" />
    <div draggable={false} onDragStart={disable} onMouseDown={inferHandlerMouse} onTouchEnd={inferHandlerTouch} ref={sliderRef} 
      className={ify("layer slider-backtrack select-none drag-none",backtrackClass)} />
    <div draggable={false} onDragStart={disable} style={{marginLeft: lp+'%', width: (rp-lp)+'%'}} 
      className={ify("layer slider-track select-none drag-none",trackClass)} />
    <div draggable={false} onDragStart={disable} onMouseDown={handleMinMouseDown} onTouchStart={handleMinTouchStart}
      style={{marginLeft: lp+'%', transform: `translateX(-${lp}%)`}} className={ify("layer slider-thumb flex box select-none drag-none",thumbClass)}>
        {labelPos=='i'? <span className={ify("flex box slider-label-in",labelClass)}>{labelParse?labelParse(left_thumb_pos):left_thumb_pos}</span> :''}
    </div>
    <div draggable={false} onDragStart={disable} onMouseDown={handleMaxMouseDown} onTouchStart={handleMaxTouchStart}
      style={{marginLeft: rp+'%', transform: `translateX(-${rp}%)`}} className={ify("layer slider-thumb flex box select-none drag-none",thumbClass)}>
        {labelPos=='i'? <span className={ify("flex box slider-label-in",labelClass)}>{labelParse?labelParse(right_thumb_pos):right_thumb_pos}</span> :''}
    </div>
  </div>);
  return labelPos && labelPos == 'o'? (<div className={ify("flex",className)}>
    <span className={ify("p-2",labelClass)}>{labelParse?labelParse(left_thumb_pos):left_thumb_pos}</span>
    { core }
    <span className={ify("p-2",labelClass)}>{labelParse?labelParse(right_thumb_pos):right_thumb_pos}</span>
  </div>) : core;
})
DualSlider.displayName = "DualSlider";
export default DualSlider;