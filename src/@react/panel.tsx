"use client";

import type { ReactNode, TouchEventHandler } from "react";
import { useEffect, useRef } from "react";
import { cacheRect, disable, ify } from "./utils";
import type { PanelPreset } from "./presets.client";

function scanPanelResize(value: number, ratio: (number | ('<'|'<=') | 'x')[]) {
  const evalRatioComp = {
    '<': (a:number, b:number) => a < b,
    '<=': (a:number, b:number) => a <= b
  } as const;
  let left = 0; let right = ratio.length-1;
  while(left <= right) {
    const mid = (left+right)/2;
    switch( // @ts-ignore
      evalRatioComp[ratio[mid+1]](value, ratio[mid+2]) // @ts-ignore val < x
      + (evalRatioComp[ratio[mid-1]](ratio[mid-2], value) << 1) // x < val
    ) {
      case 1: right = mid-2; break; // val < x
      case 2: left = mid+2; break; // x < val
      case 3: return ratio[mid] as number|'x';
    }
  }
  return left == 0? '-' : '+';
}

function panelPercentSize(side: 't'|'l'|'r'|'b', e: MouseEvent|Touch, prect: DOMRect) {
  return Math.min(Math.max((()=>{
    switch(side) {
      case 'l': return (e.clientX - prect.left) / prect.width;
      case 'r': return (prect.right - e.clientX) / prect.width;
      case 't': return (e.clientY - prect.top) / prect.height;
      case 'b': return (prect.bottom - e.clientY) / prect.height;
    }
  })(), 0.0), 1.0);
}

function applyPanelLockSize(
  container: HTMLDivElement, draggable: HTMLDivElement, 
  side: 't'|'l'|'r'|'b', ratio: (number | ('<'|'<=') | 'x')[]
) {
  const resize_lock = scanPanelResize(
    parseFloat(container.style[(side == 'l' || side == 'r')? 'width' : 'height']
      .match(/max\((.*?)%/)![1]
    ) / 100, 
  ratio);
  if(resize_lock != 'x'){
    const new_style = 'max('+(resize_lock as number*100)+'%, '
      +draggable[(side == 'l' || side == 'r')? 
        'offsetWidth' : 'offsetHeight'
      ]+'px)';
    (side == 'l' || side == 'r')? (container.style.width = new_style) 
      : (container.style.height = new_style);
  }
}

export default function Panel({ 
  children, modal, preset, className, modalClass, dragClass, 
  default_ratio, ratio=[0,'<=','x','<=',1.0]
} : {
  children: ReactNode, modal: ReactNode, preset: PanelPreset,
  dragClass?: string, className?: string, modalClass?: string, 
  ratio?: (number | ('<'|'<=') | 'x')[], default_ratio?: number|string
}) {
  const parent = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const draggable = useRef<HTMLDivElement>(null);
  const prect = useRef<DOMRect>();
  const touchRef = useRef<number|null>(null);
  
  const styles = preset.split(' ')
  const side = styles.pop() as 't'|'l'|'r'|'b';

  useEffect(() => cacheRect(prect, parent.current), []);
  function handleMouseDown() {
    if(prect.current == undefined) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('visibilitychange', handleMouseUp);
    window.addEventListener('blur', handleMouseUp);
  };
  function handleMouseMove(e: MouseEvent|Touch) { if(container.current && parent.current && draggable.current) {
    const new_size = 'max('+(panelPercentSize(side, e, prect.current as DOMRect)*100)+'%, '
      +draggable.current[(side == 'l' || side == 'r')? 'offsetWidth' : 'offsetHeight']+'px)';
    (side == 'l' || side == 'r')? (container.current.style.width = new_size) 
      : (container.current.style.height = new_size);
  }}
  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('visibilitychange', handleMouseUp);
    window.removeEventListener('blur', handleMouseUp);
    applyPanelLockSize(container.current!, draggable.current!, side, ratio);
  }
  const handleTouchStart : TouchEventHandler<HTMLDivElement> = (e) => {
    if(prect.current == undefined) return;
    touchRef.current = e.targetTouches[0].identifier;
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('visibilitychange', handleTouchEnd);
    window.addEventListener('blur', handleTouchEnd);
  };
  function handleTouchMove(e: TouchEvent) {
    for (const touch of Array.from(e.touches))
      if (touch.identifier === touchRef.current) {
        handleMouseMove(touch);
        break;
      }
  }
  function handleTouchEnd() {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('visibilitychange', handleTouchEnd);
    window.removeEventListener('blur', handleTouchEnd);
    touchRef.current = null;
    applyPanelLockSize(container.current!, draggable.current!, side, ratio);
  }
  useEffect(() => { if(container.current) {
    container.current.style.width = '';
    container.current.style.height = '';
  }}, [side]);
  useEffect(() => { if(container.current && parent.current && draggable.current) {
    const new_size = default_ratio? (typeof default_ratio == 'string'? 
      default_ratio : (ratio[2+(default_ratio*4)]+'%')
    ) : '50%';
    (side == 'l' || side == 'r')? (container.current.style.width = new_size == 'x'? '50%' : new_size) 
      : (container.current.style.height = new_size == 'x'? '50%' : new_size);
  }}, [ side, ratio, default_ratio ]);
  return (<div ref={parent} className={ify("layers w-full h-full",className)}>
    <div className="layer w-full h-full">{ children }</div>
    <div draggable={false} onDragStart={disable} ref={container} className={ify("flex layer overflow-hidden transition-all border-slate-200",styles[0],modalClass)}>
      <article draggable={false} onDragStart={disable} className={ify("flex flex-col shrink w-full h-full select-none drag-none", side=='b'?'pt-4':(side=='t'&&'pb-4'))}>{ modal }</article>
      <div draggable={false} onDragStart={disable} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} ref={draggable} className={ify("flex sticky gap-1 p-1 bg-slate-100 border-slate-400",styles[1],dragClass)}>
        {(side=='l'||side=='r')? <svg className={ify("my-auto h-1/4",side=='r'&&'-scale-x-100')} height="100%" width="12" preserveAspectRatio="none" viewBox="0 0 16 80">
          <line x1="4" y1="25" x2="4" y2="55" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <line x1="12" y1="10" x2="12" y2="70" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
        </svg> : <svg className={ify("mx-auto w-1/8",side=='b'&&'-scale-y-100')} height="14" width="100%" preserveAspectRatio="none" viewBox="0 0 320 20">
          <line y1="5" x1="100" y2="5" x2="220" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <line y1="15" x1="40" y2="15" x2="280" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
        </svg>}
      </div>
    </div>
  </div>);
}