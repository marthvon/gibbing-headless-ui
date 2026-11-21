import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { ify } from "../utils";

export type RevealProps = {
  secret?: boolean;
  revealed?: boolean;
  onReveal?: (revealed: boolean) => void;
  showLabel?: string;
  hideLabel?: string;
  showIcon?: ReactNode;
  hideIcon?: ReactNode;
  revealClass?: string;
};

export function Reveal({ revealed, target, showLabel = "Show password", hideLabel = "Hide password", showIcon, hideIcon, className, style, onToggle }: {
  revealed: boolean;
  target: string;
  showLabel?: string;
  hideLabel?: string;
  showIcon?: ReactNode;
  hideIcon?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={ify("textbox-reveal", className)}
      style={style}
      aria-label={revealed ? hideLabel : showLabel}
      aria-pressed={revealed}
      aria-controls={target}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onToggle}
    >
      {revealed
        ? hideIcon ?? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 5.1A10 10 0 0 1 12 4.8c5.5 0 9.2 4.4 10.2 6.2a13 13 0 0 1-2.2 3.1" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.1 6.1C3.8 7.6 2.2 9.8 1.8 11a13 13 0 0 0 5.2 6.1 10 10 0 0 0 6.3 1.1" />
            </svg>
          )
        : showIcon ?? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
              <circle cx="12" cy="12" r="2.75" />
            </svg>
          )}
    </button>
  );
}

export function useReveal(revealed: boolean | undefined, onReveal: ((revealed: boolean) => void) | undefined) {
  const [own, setOwn] = useState(false);
  const shown = revealed ?? own;
  return [shown, () => {
    setOwn(!shown);
    onReveal?.(!shown);
  }] as const;
}
