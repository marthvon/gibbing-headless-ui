"use client";

import type { DetailedHTMLProps, LiHTMLAttributes, MutableRefObject, ReactNode, TouchEventHandler } from "react";
import { useRef, useState, useEffect, useId, useMemo } from "react";
import { ify } from "./utils";

function getDegrees(index:number, curr_idx:number,  length:number, inactive_opacity:number=0.5) {
  if(length < 3)
    return (index == curr_idx? {"--tw-degrees-left": "0deg", "--tw-degrees-right": "0deg", "--tw-opacity":1.0 } 
      : { "--tw-degrees-left": "90deg", "--tw-degrees-right": "-90deg", "--tw-opacity": inactive_opacity }) as 
        DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
  switch(index - curr_idx) {
    case ((c) => c === 0 || c === 1? 2 : c)(length-1): // image length -1
    case -1:
      return {"--tw-degrees-left":"-60deg","--tw-degrees-right":"60deg","--tw-opacity": inactive_opacity} as 
        DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
    case 0: 
      return {"--tw-degrees-left":"0deg","--tw-degrees-right":"-0deg","--tw-opacity":1.0} as 
        DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
    case (-length+1): // image length -1    
    case 1:
      return { "--tw-degrees-left":"60deg","--tw-degrees-right":"-60deg","--tw-opacity": inactive_opacity} as 
        DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
    default:
      return {"--tw-degrees-left":"180deg","--tw-degrees-right":"-180deg","--tw-opacity":0} as 
        DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
  }
}

export default function ImageCarousel({ images, timeout, cursor_color, indicators, loader, className, children } : { 
  images: [string, ReactNode][], timeout?: number, className?: string
  cursor_color?: string, indicators?: { indicated_color: string, dormant_color: string },
  loader?: { type: 'linear-loader', fill_color: string, empty_color: string, duration: string, onBottom?: boolean }, 
  children?: ReactNode
}) {
  const id = useId();
  const [ carousel_index, setIndex ] = useState(0);
  const intervalHandler: MutableRefObject<NodeJS.Timeout|null> = useRef(null);
  const touchX : MutableRefObject<number|null> = useRef(null);
  const clock : MutableRefObject<HTMLDivElement|null> = useRef(null);

  useEffect(() => {
    if(timeout == undefined)
      return;
    loader && clock.current?.classList.add(loader.type);
    intervalHandler.current = setInterval(carousel_next, timeout*1000);
    return () => { if(intervalHandler.current !== null) {
      clearInterval(intervalHandler.current);
      intervalHandler.current = null;
    }}
  }, [timeout]);
  function signalIntervalHandler() {
    if(intervalHandler.current == null)
      return;
    clearInterval(intervalHandler.current as NodeJS.Timeout);
    intervalHandler.current = setInterval(carousel_next, timeout!*1000);
    if(clock.current && loader) {
      clock.current.classList.remove(loader.type);
      void clock.current.offsetHeight;
      setTimeout(() => clock.current?.classList.add(loader.type), 10);
    }
  }
  const pauseCarousel = useMemo(() => loader? () => {
    if(intervalHandler.current){
      clearInterval(intervalHandler.current as NodeJS.Timeout);
      intervalHandler.current = null;
      loader && clock.current?.classList.remove(loader.type);
    } else {
      loader && clock.current?.classList.add(loader.type);
      intervalHandler.current = setInterval(carousel_next, timeout!*1000);
    }
  } : null, [loader]);
  const set_carousel = useMemo(() => indicators? (index : number) => {
    setIndex(index); 
    signalIntervalHandler();
  } : null, [indicators]);
  function carousel_next() {
    setIndex((carousel_index+1) % images.length);
    signalIntervalHandler();
  }
  function carousel_prev() {
    setIndex((carousel_index ? carousel_index : images.length)-1);
    signalIntervalHandler();
  }
  const onSwipe : TouchEventHandler<HTMLUListElement> = (event) => {
    if(touchX.current === null || event.changedTouches.length === 0)
      return;
    if((event.changedTouches[0].clientX - touchX.current) < 0)
      carousel_next();
    else if((event.changedTouches[0].clientX - touchX.current) > 0 )
      carousel_prev();
    touchX.current = null;
  }
  return (<section className={ify("image_carousel with-navbar with-sides mx-auto",className)}>
    { children || (loader && loader['onBottom'] !== true)? <div className="flex top-nav pb-3"><div className="flex mx-auto w-full max-w-[inherit]">
      { children }
      { (loader && loader['onBottom'] !== true)? <button key={"--carousel-loader-component-"+id} onClick={pauseCarousel as ()=>void} className="ml-auto mr-3 my-1 cursor-pointer z-10">
        <div ref={clock} className={ify(loader.type+'-base', loader.fill_color, loader.empty_color, loader.duration)}></div>
      </button> : '' }
    </div></div> : '' }
    { cursor_color && <button onClick={carousel_prev} className="group left-nav -carousel-arrows">
      <div className="semi-absolute m-auto"><div className={"carousel-arrows "+cursor_color}>&lt;</div></div>
    </button> }
    <ul className="main-content layers w-full h-full preserve-3d overflow-visible mx-auto" 
      onTouchEnd={onSwipe} onTouchStart={(event) => { if(event.targetTouches.length !== 0) touchX.current = event.targetTouches[0].clientX; }}
    >
      { images.map(([id, image], index) => <li key={id} className="carousel layer flex box w-full h-full" 
        style={getDegrees(index, carousel_index, images.length)}>{ image }</li>
      ) }
    </ul>
    { cursor_color && <button onClick={carousel_next} className="group right-nav -carousel-arrows">
      <div className="semi-absolute m-auto"><div className={"carousel-arrows "+cursor_color}>&gt;</div></div>
    </button> }
    { (indicators || (loader && loader['onBottom'] === true)) && <div className="layers bottom-nav w-full pt-3">
      { set_carousel && <div className="layer flex box w-full">{[...images.keys()].map(index =>
        <button key={index} disabled={index === carousel_index} onClick={() => set_carousel(index)} 
          className={"mb-3 mx-1 rounded-full duration-500 transition-all cursor-pointer "
            +( index === carousel_index? ify('h-4 w-4',indicators!.indicated_color) : ify('h-3 w-3',indicators!.dormant_color) )
          } />
      )}</div> }
      { loader && loader['onBottom'] === true && <button key={"--carousel-loader-component-"+id} onClick={pauseCarousel as ()=>void} className="layer ml-auto mr-3 my-1 z-10">
        <div ref={clock} className={ify(loader.type+'-base', loader.fill_color, loader.empty_color, loader.duration)}></div>
      </button> }
    </div> }
  </section>);
}