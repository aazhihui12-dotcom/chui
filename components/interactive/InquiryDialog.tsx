"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/content/schema";
import { InquiryForm } from "./InquiryForm";

type InquiryContext = { locale: Locale; title: string; model?: string; productId?: string };

export function InquiryDialog({ locale }: { locale: Locale }) {
  const [context, setContext] = useState<InquiryContext | null>(null);
  const active = useRef(false);
  const trigger = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const accept = (event: Event) => {
      const detail: unknown = (event as CustomEvent).detail;
      if (!event.cancelable || !detail || typeof detail !== "object" || !("locale" in detail) || detail.locale !== locale || !("title" in detail) || typeof detail.title !== "string") return;
      if (("model" in detail && typeof detail.model !== "string") || ("productId" in detail && typeof detail.productId !== "string")) return;
      event.preventDefault();
      // An already open dialog owns the request; preserve the user's draft.
      if (active.current) return;
      active.current = true;
      trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setContext(detail as InquiryContext);
    };
    window.addEventListener("lbh:inquiry", accept);
    return () => window.removeEventListener("lbh:inquiry", accept);
  }, [locale]);
  useEffect(() => {
    if (!context) return;
    const node = dialog.current!;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (typeof node.showModal === "function") node.showModal();
    else node.setAttribute("open", "");
    node.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setContext(null); }
      if (event.key === "Tab") {
        const controls = [...node.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled)')];
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      active.current = false;
      trigger.current?.focus();
    };
  }, [context]);
  if (!context) return null;
  return <dialog ref={dialog} className="inquiry-dialog" aria-modal="true" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); setContext(null); }} onClick={(event) => { if (event.target === event.currentTarget) setContext(null); }}>
    <div className="inquiry-dialog__content">
      <div className="inquiry-dialog__top"><h2 id={titleId}>{context.title || (locale === "cn" ? "产品询盘" : "Product inquiry")}</h2><button type="button" aria-label={locale === "cn" ? "关闭询盘" : "Close inquiry"} onClick={() => setContext(null)}>×</button></div>
      <InquiryForm locale={locale} product={context.model} />
    </div>
  </dialog>;
}
