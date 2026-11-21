"use client";

import type { CSSProperties, DetailedHTMLProps, LiHTMLAttributes, ReactNode, TouchEventHandler } from "react";
import { useRef, useState, useEffect, useId } from "react";
import { ify } from "./utils";
import { restartLoader } from "./_internal/loader";

function getDegrees(index:number, curr_idx:number, length:number, inactive_opacity:number=0.5) {
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

export type CarouselLoader = { type: "linear-loader", fill_color: string, empty_color: string, onBottom?: boolean };

export default function ImageCarousel({ images, timeout, cursor_color, indicators, loader, className, children, bg_img_opacity=0.5 } : { 
  images: [string, ReactNode][], timeout?: number, className?: string, bg_img_opacity?: number,
  cursor_color?: string, indicators?: { indicated_color: string, dormant_color: string },
  loader?: CarouselLoader,
  children?: ReactNode
}) {
  const id = useId();
  const [ carousel_index, setIndex ] = useState(0);
  const [ paused, setPaused ] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = useRef(images.length);
  const touchX = useRef<number | null>(null);
  const clock = useRef<HTMLSpanElement | null>(null);
  count.current = images.length;

  function stop() {
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
  }
  function advance() {
    setIndex((index) => (index + 1) % count.current);
    restartLoader(clock.current, true);
  }
  function schedule() {
    stop();
    const running = timeout !== undefined && !paused;
    if (running) timer.current = setInterval(advance, timeout * 1000);
    restartLoader(clock.current, running);
  }
  useEffect(() => {
    schedule();
    return stop;
  }, [timeout, paused]);

  function set_carousel(index: number) {
    setIndex(index);
    schedule();
  }
  function carousel_next() {
    setIndex((index) => (index + 1) % images.length);
    schedule();
  }
  function carousel_prev() {
    setIndex((index) => (index ? index : images.length) - 1);
    schedule();
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
  const clockEl = loader && <button key={"--carousel-loader-component-"+id} type="button" aria-label={paused ? "Resume carousel" : "Pause carousel"} aria-pressed={paused}
    onClick={() => setPaused((value) => !value)}
    className={ify(loader.onBottom === true ? "layer ml-auto mr-3 my-1" : "ml-auto mr-3 my-1", "cursor-pointer z-[var(--z-raised,1)]")}>
    <span ref={clock} className={ify(loader.type+"-base", loader.type, loader.empty_color)} style={{ "--loader-duration": `${timeout ?? 5}s` } as CSSProperties}>
      <span className={ify(loader.type+"-fill", loader.fill_color)} />
    </span>
  </button>;
  return (<section className={ify("image_carousel with-navbar with-sides mx-auto",className)}>
    { children || (loader && loader['onBottom'] !== true)? <div className="flex top-nav pb-3"><div className="flex mx-auto w-full max-w-[inherit]">
      { children }
      { loader && loader.onBottom !== true ? clockEl : null }
    </div></div> : '' }
    { cursor_color && <button onClick={carousel_prev} className="group left-nav -carousel-arrows">
      <div className="semi-absolute m-auto"><div className={"carousel-arrows "+cursor_color}>&lt;</div></div>
    </button> }
    <ul className="main-content layers w-full h-full preserve-3d overflow-visible mx-auto" 
      onTouchEnd={onSwipe} onTouchStart={(event) => { if(event.targetTouches.length !== 0) touchX.current = event.targetTouches[0].clientX; }}
    >
      { images.map(([id, image], index) => <li key={id} className="carousel layer flex box w-full h-full" 
        style={getDegrees(index, carousel_index, images.length, bg_img_opacity)}>{ image }</li>
      ) }
    </ul>
    { cursor_color && <button onClick={carousel_next} className="group right-nav -carousel-arrows">
      <div className="semi-absolute m-auto"><div className={"carousel-arrows "+cursor_color}>&gt;</div></div>
    </button> }
    { (indicators || (loader && loader['onBottom'] === true)) && <div className="layers bottom-nav w-full pt-3">
      { indicators && <div className="layer flex box w-full">{[...images.keys()].map(index =>
        <button key={index} disabled={index === carousel_index} onClick={() => set_carousel(index)} 
          className={"mb-3 mx-1 rounded-full duration-500 transition-all cursor-pointer "
            +( index === carousel_index? ify('h-4 w-4',indicators!.indicated_color) : ify('h-3 w-3',indicators!.dormant_color) )
          } />
      )}</div> }
      { loader && loader.onBottom === true ? clockEl : null }
    </div> }
  </section>);
}