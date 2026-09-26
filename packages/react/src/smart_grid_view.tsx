"use client";

import type { MutableRefObject, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ify } from "./utils";

type SmartGridImg = { [key in string]: [ number, ReactNode ] };
type SmartGridLayout = {
  source: SmartGridImg | null, columns: number,
  cols: string[][], heights: number[], placed: Set<string>
};

function shortestCol(heights: number[]) {
  let shortest = 0;
  for(let i = 1; i < heights.length; ++i)
    if(heights[i] < heights[shortest])
      shortest = i;
  return shortest;
}

function relayout(images: SmartGridImg, columns: number, prev: SmartGridLayout): SmartGridLayout {
  const entries = Object.entries(images);
  const kept = prev.columns === columns
    && entries.reduce((count, [ key ]) => count + (prev.placed.has(key)? 1 : 0), 0) === prev.placed.size;
  const appended = kept? entries.filter(([ key ]) => !prev.placed.has(key)) : entries;
  if(kept && appended.length === 0)
    return { ...prev, source: images };
  const layout: SmartGridLayout = kept? {
    source: images, columns, cols: prev.cols.map(col => col.slice()),
    heights: prev.heights.slice(), placed: new Set(prev.placed)
  } : {
    source: images, columns, cols: Array.from({ length: columns }, () => [] as string[]),
    heights: Array.from({ length: columns }, () => 0), placed: new Set<string>()
  };
  for(const [ key, [ ratio ] ] of appended) {
    const col = shortestCol(layout.heights);
    layout.cols[col].push(key);
    layout.heights[col] += ratio > 0? ratio : 1;
    layout.placed.add(key);
  }
  return layout;
}

export default function SmartGridView({
  images, className, innerClass, cardClass, template, columns, loading, threshold = 0, onScrollEnd
} : {
  className?: string, innerClass?: string, cardClass?: string,
  images: SmartGridImg, template?: ReactNode,
  columns?: number, loading?: boolean, threshold?: number,
  onScrollEnd?: ()=>void
}) {
  const grid : MutableRefObject<HTMLDivElement|null> = useRef(null);
  const row : MutableRefObject<HTMLDivElement|null> = useRef(null);
  const sentinel : MutableRefObject<HTMLDivElement|null> = useRef(null);
  const scrollEnd : MutableRefObject<(()=>void)|undefined> = useRef(onScrollEnd);
  const pending = useRef(false);
  const [ colCount, setColCount ] = useState(columns && columns > 0? columns : 1);
  const [ layout, setLayout ] = useState<SmartGridLayout>(
    () => ({ source: null, columns: 0, cols: [], heights: [], placed: new Set<string>() })
  );

  if(layout.source !== images || layout.columns !== colCount)
    setLayout(relayout(images, colCount, layout));

  useEffect(() => { scrollEnd.current = onScrollEnd }, [onScrollEnd]);
  useEffect(() => {
    if(columns && columns > 0) {
      setColCount(columns);
      return;
    }
    const el = row.current;
    if(el == null)
      return;
    const readCols = () => {
      const declared = parseInt(getComputedStyle(el).getPropertyValue("--tw-smart-grid-cols"));
      setColCount(declared > 0? declared : 1);
    };
    readCols();
    const resized = new ResizeObserver(readCols);
    resized.observe(el);
    return () => resized.disconnect();
  }, [columns]);
  useEffect(() => {
    const el = sentinel.current;
    if(el == null || grid.current == null)
      return;
    pending.current = false;
    const watcher = new IntersectionObserver(([ entry ]) => {
      if(!entry.isIntersecting) {
        pending.current = false;
        return;
      }
      if(pending.current)
        return;
      pending.current = true;
      scrollEnd.current?.();
    }, { root: grid.current, rootMargin: threshold+"px" });
    watcher.observe(el);
    return () => watcher.disconnect();
  }, [layout.placed.size, threshold]);

  return (<div ref={grid} className={ify("smart-grid-view", className)}>
    <div ref={row} className="smart-grid-columns">
      { layout.cols.map((col, index) =>
        <ul key={index} className={ify("smart-grid-column", innerClass)}>
          { col.map(key => <li key={key} className={ify("smart-grid-card", cardClass)}>{ images[key]?.[1] }</li>) }
          { loading && template && <li aria-hidden className={ify("smart-grid-card", cardClass)}>{ template }</li> }
        </ul>
      )}
    </div>
    <div ref={sentinel} aria-hidden className="smart-grid-sentinel"></div>
  </div>);
}
