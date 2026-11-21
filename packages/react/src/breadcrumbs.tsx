"use client";

import type { ReactNode } from "react";
import { Fragment } from "react";
import { ify } from "./utils";

export type Crumb = { label: string; href?: string; home?: boolean };

export default function Breadcrumbs({
  crumbs, label = "Breadcrumb", className, listClass, itemClass, separator, homeIcon, crumb
}: {
  crumbs: readonly Crumb[];
  label?: string;
  className?: string;
  listClass?: string;
  itemClass?: string;
  separator?: ReactNode;
  homeIcon?: ReactNode;
  crumb?: (crumb: Crumb, current: boolean) => ReactNode;
}) {
  const face = (entry: Crumb) =>
    entry.home ? homeIcon ?? (
      <svg viewBox="0 0 24 24" className="breadcrumbs-home" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2.5 3 10.5V21.5h18V10.5L12 2.5ZM10.2 21.5V14.2h3.6v7.3h-3.6Z" />
      </svg>
    ) : entry.label;

  const fallback = (entry: Crumb, current: boolean) =>
    current ? (
      <span aria-current="page" aria-label={entry.home ? entry.label : undefined} className="breadcrumbs-current">{face(entry)}</span>
    ) : (
      <a href={entry.href} aria-label={entry.home ? entry.label : undefined} className="breadcrumbs-link">{face(entry)}</a>
    );

  return (
    <nav aria-label={label} className={ify("breadcrumbs", className)}>
      <ol className={ify("breadcrumbs-list", listClass)}>
        {crumbs.map((entry, index) => (
          <Fragment key={`${index}-${entry.label}`}>
            {index > 0 ? <li aria-hidden="true" className="breadcrumbs-separator">{separator ?? "/"}</li> : null}
            <li className={ify("breadcrumbs-item", itemClass)}>{(crumb ?? fallback)(entry, !entry.href)}</li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
