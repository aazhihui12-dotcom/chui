"use client";

import { useState } from "react";
import type { NavigationItem } from "@/content/schema";

export function DesktopNav({ items }: { items: NavigationItem[] }) {
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  return (
    <nav className="desktop-nav" aria-label="Primary">
      <ul className="desktop-nav__list">
        {items.map((item) => {
          const expanded = openLabel === item.label;
          const hasChildren = Boolean(item.children?.length);
          return (
            <li
              className="desktop-nav__item"
              key={item.href}
              onMouseEnter={() => hasChildren && setOpenLabel(item.label)}
              onMouseLeave={() => hasChildren && setOpenLabel(null)}
            >
              <a href={item.href}>{item.label}</a>
              {hasChildren ? (
                <button
                  aria-controls={`desktop-menu-${item.label}`}
                  aria-expanded={expanded}
                  aria-label={`${expanded ? "Close" : "Open"} ${item.label} menu`}
                  className="desktop-nav__toggle"
                  onClick={() => setOpenLabel(item.label)}
                  onFocus={() => setOpenLabel(item.label)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setOpenLabel(null);
                    }
                  }}
                  type="button"
                >
                  <span aria-hidden="true">⌄</span>
                </button>
              ) : null}
              {hasChildren && expanded ? (
                <ul className="desktop-nav__menu" id={`desktop-menu-${item.label}`}>
                  {item.children?.map((child) => (
                    <li key={child.href}><a href={child.href}>{child.label}</a></li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
