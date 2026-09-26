"use client";

import type { FocusEventHandler, FormEventHandler, ForwardedRef, InputEventHandler, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";
import { ify } from "./utils";

type TextboxProps = {
  formId?: string, label?: string, maxLength?: number,
  mode?: "text"|"search"|"none"|"tel"|"url"|"email"|"numeric"|"decimal", guard?: RegExp,
  height?: number, wrap?: boolean, text_size?: string|"text-*", 
  border_active?: string|"border-*", border_error?: string|"border-*",
  className ?: string, boxClass?: string, labelClass?: string, name?: string 
  error ?: string|null, onBlur ?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>,
  onChange?: FormEventHandler<HTMLInputElement | HTMLTextAreaElement>,
} & (InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>);

const Textbox = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextboxProps>(({
  className, boxClass, labelClass, 
  border_active, border_error="border-red-600",
  mode="text", height=2.25, guard, maxLength,
  text_size="text-base", wrap=false, onChange,
  onBlur, formId, label, error, name
} : TextboxProps, 
  ref : ForwardedRef<HTMLTextAreaElement | HTMLInputElement>) => 
{
  const form_uuid = `${formId}-${label&&label.toLowerCase().replaceAll(' ','_')}`;
  const guardCallback = guard? function(e){
    const currentValue = e.currentTarget.value;
    if(!guard.test(
      currentValue.slice(0, e.currentTarget.selectionStart??0) + (e.nativeEvent.data??"")
        + currentValue.slice(e.currentTarget.selectionEnd??0))
    ) e.preventDefault();
  } as InputEventHandler<HTMLInputElement|HTMLTextAreaElement> : undefined
  return (
    <div className={ify("flex flex-col m-2",className)}>
      { height > 3.25 ?
        <textarea name={name} className={ify("peer textbox-a0",text_size,boxClass,!wrap && 'whitespace-nowrap',error? border_error : ify('textbox-a1',border_active))} onBeforeInput={guardCallback}
            ref={ref as ForwardedRef<HTMLTextAreaElement>} style={{height: `${height}rem`}} inputMode={mode} id={form_uuid} placeholder="ㅤ" onBlur={onBlur} onChange={onChange} maxLength={maxLength}></textarea>
        : <input name={name} className={ify("peer textbox-a0",text_size,boxClass,!wrap && 'whitespace-nowrap',error? border_error : ify('textbox-a1',border_active))} 
            ref={ref as ForwardedRef<HTMLInputElement>} style={{height: `${height}rem`}} 
            type={{"none":"text","numeric":"number","decimal":"number"}[mode as string] ?? mode} maxLength={maxLength} 
            inputMode={mode} id={form_uuid} placeholder="ㅤ" onBlur={onBlur} onChange={onChange} onBeforeInput={guardCallback} />
      }{ error ? 
        <label className={ify("textbox-text-a textbox-error-a pointer-events-none",labelClass)} htmlFor={form_uuid}>{error}</label>
        : <label className={ify("textbox-text-a textbox-label-a pointer-events-none",labelClass)} 
          htmlFor={form_uuid}>{label}</label>
      }
    </div>
  );
});
Textbox.displayName = 'Textbox';
export default Textbox;