"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { NavigationItem } from "@/content/schema";
import { siteConfig } from "@/content/site";
import { MobileNav } from "@/components/site/MobileNav";

export function MobileMenu({ locale, items }: { locale: Locale; items: NavigationItem[] }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const labels = siteConfig[locale].labels;

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      triggerRef.current?.focus();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const keepFocusInDrawer = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keepFocusInDrawer);
    return () => {
      document.removeEventListener("keydown", keepFocusInDrawer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="mobile-menu">
      <button
        aria-controls="mobile-menu-drawer"
        aria-expanded={open}
        aria-label={labels.menu}
        className="mobile-menu__trigger"
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      {open ? (
        <div className="mobile-menu__layer" onKeyDown={(event) => event.key === "Escape" && close()}>
          <button aria-label={`${labels.close} menu`} className="mobile-menu__backdrop" onClick={close} type="button" />
          <section aria-label={labels.menu} aria-modal="true" className="mobile-menu__drawer" id="mobile-menu-drawer" ref={drawerRef} role="dialog">
            <div className="mobile-menu__topline">
              <p>LBH APPLIANCES</p>
              <button aria-label={`${labels.close} menu`} onClick={close} ref={closeRef} type="button">×</button>
            </div>
            <MobileNav items={items} onNavigate={close} />
          </section>
        </div>
      ) : null}
    </div>
  );
}
