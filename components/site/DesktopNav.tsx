"use client";

import { useRef, useState } from "react";
import type { NavigationItem } from "@/content/schema";

export function DesktopNav({ items }: { items: NavigationItem[] }) {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const openedByToggleRef = useRef<string | null>(null);

  return (
    <nav className="desktop-nav" aria-label="Primary">
      <ul className="desktop-nav__list">
        {items.map((item, index) => {
          const expanded = openLabel === item.label;
          const hasChildren = Boolean(item.children?.length);
          return (
            <li
              className="desktop-nav__item"
              key={item.href}
              onMouseEnter={() => {
                if (!hasChildren) return;
                openedByToggleRef.current = null;
                setOpenLabel(item.label);
              }}
              onMouseLeave={() => {
                openedByToggleRef.current = null;
                setOpenLabel(null);
              }}
            >
              <a href={item.href}>{item.label}</a>
              {hasChildren ? (
                <button
                  aria-controls={`desktop-menu-${index}`}
                  aria-expanded={expanded}
                  aria-label={`${expanded ? "Close" : "Open"} ${item.label} menu`}
                  className="desktop-nav__toggle"
                  onClick={() => {
                    if (expanded && openedByToggleRef.current === item.label) {
                      openedByToggleRef.current = null;
                      setOpenLabel(null);
                      return;
                    }
                    openedByToggleRef.current = item.label;
                    setOpenLabel(item.label);
                  }}
                  onFocus={() => {
                    openedByToggleRef.current = null;
                    setOpenLabel(item.label);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      openedByToggleRef.current = null;
                      setOpenLabel(null);
                    }
                  }}
                  type="button"
                >
                  <span aria-hidden="true">⌄</span>
                </button>
              ) : null}
              {hasChildren && expanded ? (
                <ul className="desktop-nav__menu" id={`desktop-menu-${index}`}>
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
