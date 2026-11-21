"use client";

import type { CSSProperties, FocusEventHandler, FormEventHandler, ForwardedRef, InputEventHandler, InputHTMLAttributes } from "react";
import { forwardRef, useId } from "react";
import { Reveal, useReveal, type RevealProps } from "./_internal/reveal";
import { ify } from "./utils";

type TextboxProps = {
  formId?: string, label?: string, maxLength?: number,
  mode?: "text"|"search"|"none"|"tel"|"url"|"email"|"numeric"|"decimal", guard?: RegExp,
  height?: number, wrap?: boolean, text_size?: string|"text-*", 
  border_active?: string|"border-*", border_error?: string|"border-*",
  className ?: string, boxClass?: string, labelClass?: string, name?: string 
  error ?: string|null, onBlur ?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>,
  onChange?: FormEventHandler<HTMLInputElement | HTMLTextAreaElement>,
} & RevealProps & Omit<InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, "className" | "children" | "inputMode" | "placeholder" | "type" | "onChange" | "onBlur">;

const Textbox = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextboxProps>(({
  className, boxClass, labelClass, 
  border_active, border_error="border-red-600",
  mode="text", height=2.25, guard, maxLength,
  text_size="text-base", wrap=false, onChange,
  onBlur, formId, label, error, name,
  secret=false, revealed, onReveal, showLabel, hideLabel, showIcon, hideIcon, revealClass, style, ...rest
} : TextboxProps, 
  ref : ForwardedRef<HTMLTextAreaElement | HTMLInputElement>) => 
{
  const form_uuid = (formId ? `${formId}-` : "--tw-textbox-") + useId();
  const [shown, toggle] = useReveal(revealed, onReveal);
  const hidden = secret && height <= 3.25;
  const guardCallback = guard? function(e){
    const currentValue = e.currentTarget.value;
    if(!guard.test(
      currentValue.slice(0, e.currentTarget.selectionStart??0) + (e.nativeEvent.data??"")
        + currentValue.slice(e.currentTarget.selectionEnd??0))
    ) e.preventDefault();
  } as InputEventHandler<HTMLInputElement|HTMLTextAreaElement> : undefined
  const boxClasses = ify("peer textbox-a0",text_size,boxClass,!wrap && 'whitespace-nowrap',hidden && (typeof showIcon === "string" || typeof hideIcon === "string" ? "pr-16" : "pr-10"),error? border_error : ify('textbox-a1',border_active));
  return (
    <div className={ify("relative flex flex-col m-2",className)}>
      { height > 3.25 ?
        <textarea {...rest} name={name} className={boxClasses} onBeforeInput={guardCallback}
            ref={ref as ForwardedRef<HTMLTextAreaElement>} style={{...style, height: `${height}rem`}} inputMode={mode} id={form_uuid} placeholder="ㅤ" onBlur={onBlur} onChange={onChange} maxLength={maxLength}></textarea>
        : <input {...rest} name={name} className={boxClasses} 
            ref={ref as ForwardedRef<HTMLInputElement>} style={{...style, height: `${height}rem`}} 
            type={hidden && !shown ? "password" : ({"none":"text","numeric":"number","decimal":"number"}[mode as string] ?? mode)} maxLength={maxLength} 
            inputMode={mode} id={form_uuid} placeholder="ㅤ" onBlur={onBlur} onChange={onChange} onBeforeInput={guardCallback} />
      }{ error ? 
        <label className={ify("textbox-text-a textbox-error-a pointer-events-none",labelClass)} htmlFor={form_uuid}>{error}</label>
        : <label className={ify("textbox-text-a textbox-label-a pointer-events-none",labelClass)} 
          htmlFor={form_uuid}>{label}</label>
      }
      { hidden ? <Reveal revealed={shown} target={form_uuid} showLabel={showLabel} hideLabel={hideLabel} showIcon={showIcon} hideIcon={hideIcon}
          className={revealClass} style={{ "--textbox-reveal-top": `${height / 2}rem` } as CSSProperties} onToggle={toggle} /> : null }
    </div>
  );
});
Textbox.displayName = 'Textbox';
export default Textbox;
