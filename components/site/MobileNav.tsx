"use client";

import { useState } from "react";
import type { NavigationItem } from "@/content/schema";

export function MobileNav({ items, onNavigate }: { items: NavigationItem[]; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <nav aria-label="Mobile navigation" className="mobile-nav">
      <ul>
        {items.map((item, index) => {
          const hasChildren = Boolean(item.children?.length);
          const isExpanded = expanded === item.label;
          return (
            <li key={item.href} className="mobile-nav__item">
              <div className="mobile-nav__row">
                <a href={item.href} onClick={onNavigate}>{item.label}</a>
                {hasChildren ? (
                  <button
                    aria-controls={`mobile-menu-${index}`}
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? "Close" : "Open"} ${item.label} menu`}
                    onClick={() => setExpanded(isExpanded ? null : item.label)}
                    type="button"
                  >
                    <span aria-hidden="true">+</span>
                  </button>
                ) : null}
              </div>
              {hasChildren && isExpanded ? (
                <ul id={`mobile-menu-${index}`} className="mobile-nav__submenu">
                  {item.children?.map((child) => (
                    <li key={child.href}><a href={child.href} onClick={onNavigate}>{child.label}</a></li>
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
