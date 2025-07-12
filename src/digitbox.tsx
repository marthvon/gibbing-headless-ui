"use client";

import type { FormEvent, FormEventHandler, ForwardedRef, MutableRefObject } from "react";
import { createRef, forwardRef, useEffect, useRef } from "react";
import { bindRef, ify } from "./utils";

type DigitboxProps = {
  formId?: string, label?: string,
  digits: number, isNumeric?: boolean, disabled?: boolean
  className?: string, digitClass?: string,
  onInput?: FormEventHandler<HTMLInputElement>, 
  onChange?: FormEventHandler<HTMLInputElement>,
}

const Digitbox = forwardRef<HTMLInputElement, DigitboxProps>(({
  formId, label, digits, className, digitClass, isNumeric=true, onInput, onChange, disabled=false
}, ref: ForwardedRef<HTMLInputElement>) => {
  const digitboxes = useRef(Array.from({ length: digits }, () => createRef<HTMLInputElement>()));
  function updateDigits(e:FormEvent<HTMLInputElement>) {
    if(internalRef.current == null)
      return;
    internalRef.current.value = digitboxes.current.reduce((prev, curr) => prev+(curr.current?.value||' '), "");
    onInput && onInput(e);
  }
  const internalRef = useRef<HTMLInputElement>(null);
  useEffect(() => bindRef(ref, internalRef.current), [ref]);
  if(digits < digitboxes.current.length)
    digitboxes.current.length = digits;
  else if(digits > digitboxes.current.length)
    digitboxes.current.push(...Array.from({ length: digits-digitboxes.current.length }, () => createRef<HTMLInputElement>()));
  return (<div className={ify("flex gap-2 h-12",className)}> <input ref={internalRef} type="hidden" /> { digitboxes.current.map((subref, i, boxes) => (<>
    <input key={i} ref={subref} type={isNumeric?"number":"text"} maxLength={1} className={ify("code-box",digitClass)} 
      onFocus={()=>subref.current!.value = ''} disabled={disabled}
      onInput={(i+1) == boxes.length? (e)=>{boxes[i].current?.blur();updateDigits(e);onChange&&onChange(e)} : (e)=>{boxes[i+1].current?.focus();updateDigits(e)}} />
  </>))} </div>);
})
Digitbox.displayName = 'Digitbox';
export default Digitbox;