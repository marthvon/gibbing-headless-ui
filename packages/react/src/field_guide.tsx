"use client";

import type { CSSProperties, ReactNode } from "react";
import { useId, useMemo } from "react";
import { overflowRef } from "./_internal/field_guide";
import { ify, type Content } from "./utils";

export default function FieldGuide({
  text, id, className, limit = 3, body, expand, collapse
}: {
  text: string;
  id?: string;
  className?: string;
  limit?: number;
  body?: (text: string) => ReactNode;
  expand?: Content<[id: string]>;
  collapse?: Content<[id: string]>;
}) {
  const toggleId = "--tw-field-guide-" + useId();
  const watch = useMemo(() => overflowRef(limit), [limit]);
  return (
    <div id={id} className={ify("field-guide", className)} style={{ "--field-guide-limit": `${limit}rem` } as CSSProperties}>
      <input id={toggleId} type="checkbox" className="field-guide-switch" />
      <div className="field-guide-body">
        <div ref={watch} className="field-guide-content">
          {body ? body(text) : <p className="field-guide-text">{text}</p>}
        </div>
      </div>
      {typeof expand === "function" ? expand(toggleId) : <label htmlFor={toggleId} className="field-guide-toggle field-guide-expand">{expand ?? "See more"}</label>}
      {typeof collapse === "function" ? collapse(toggleId) : <label htmlFor={toggleId} className="field-guide-toggle field-guide-collapse">{collapse ?? "See less"}</label>}
    </div>
  );
}
