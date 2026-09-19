"use client";
import type { Action } from "@/content/schema";
import { SourceButtonLabel } from "./SourceButtonLabel";

/** Typed actions keep their source destination if the singleton dialog is unavailable. */
export function ContentAction({ action }: { action: Action }) {
  return <a className="lbh-button" href={action.href} download={action.action === "download" || undefined} onClick={(event) => {
    if (action.action !== "inquiry") return;
    const locale = /^\/cn(?:\/|$)/.test(action.href) ? "cn" : "en";
    const request = new CustomEvent("lbh:inquiry", { detail: { locale, title: action.label }, cancelable: true });
    if (!window.dispatchEvent(request)) event.preventDefault();
  }}><SourceButtonLabel>{action.label}</SourceButtonLabel></a>;
}
