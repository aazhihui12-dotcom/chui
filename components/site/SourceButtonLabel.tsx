import { Children, isValidElement, type ReactNode } from "react";

function labelText(children: ReactNode): string {
  return Children.toArray(children).map(child => typeof child === "string" || typeof child === "number" ? String(child) : isValidElement<{ children?: ReactNode; "aria-hidden"?: boolean | "true" }>(child) && !child.props["aria-hidden"] ? labelText(child.props.children) : "").join("").replace(/[↗→]/g, "").trim();
}

export function SourceButtonLabel({children}: {children: ReactNode}) {
  return <><span className="source-button__label">{labelText(children)}</span><span className="source-button__arrow" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span></>;
}
