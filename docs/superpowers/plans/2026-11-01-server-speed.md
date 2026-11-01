# Existing-server speed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce unnecessary downloads on the existing 2Mbps server, deploy safely, and report measured cold/warm speed.

**Architecture:** Split existing font data without changing glyphs, replace content-heavy browser route lookup with a generated path index, and defer background video until half visible. No CDN or visual redesign.

**Tech Stack:** Next.js 16.3.5 / React 19.3 / Vitest / Playwright / fontTools + Brotli (offline asset preparation only).

**Spec:** docs/superpowers/specs/2026-11-01-server-speed-design.md

## Global Constraints

- Preserve original image bytes, Inter Medium and Han glyph shapes/metrics, layouts, CMS persistence, TLS, DNS, and server package.
- No paid services or GitHub main publication. Stage and retain rollback.

## Review Focus

- All legacy translated IDs, unknown paths and APOWER products retain alternate links; index drift must fail tests.
- Font subsets retain all original glyphs and symbols, including newly used original-subset characters.
- Mobile partial visibility avoids eager video but scrolling, manual pause and reduced-motion changes still work.
- No stale or error-page caching, CMS auth/data unchanged.
- Timing comparisons use matching viewport/locale/cache conditions; LCP is not network-idle.

### Task 1: Demand-loaded identical fonts

Files: scripts/split-han-font.py, app/han-fonts.css, app/apower-v3.css, app/[locale]/layout.tsx, public/fonts, tests/live/font-speed.spec.ts.

Interfaces: consume original APOWER-Han-Medium.woff; produce disjoint UI/body WOFF2 fonts and unicode-range CSS. Original remains.

- [x] Add browser test: English loads <20KB Han data; Chinese loads the body shard; original/candidate canvas metrics match.
- [x] Run test against original build and confirm expected failure.
- [x] Implement deterministic split (non-CJK + 中文 in UI), retaining all original glyphs and license metadata. Keep Inter unchanged.
- [x] Verify cmap/glyph outlines/metrics union and browser font decode, then run full suite; commit.

### Task 2: Lightweight alternate-path lookup

Files: scripts/build-route-index.mjs, content/route-index.json, content/apower-models.json, content/apower.ts, lib/routes.ts, package.json, tests/unit/routes.test.ts, tests/live/server-speed.spec.ts.

Interfaces: preserve getAlternatePath(locale, slug):string, localizedLegacyPath and unknown-home fallback. Path index is generated from literal exported content arrays, plus shared APOWER models and garment category. No article bodies in client lookup.

- [x] Add failure proving route lookup works without importing lib/content and exhaustive correspondence against server getPage.
- [x] Observe failure; implement generated index and generation in build commands, preserving every path.
- [x] Full tests and production build; verify public client JS shrinks and language switch/menu/inquiry still work; commit.

### Task 3: Meaningful visibility and release

Files: components/interactive/VideoModal.tsx, tests/unit/media-loading.test.tsx, tests/live/video-visibility.spec.ts, docs/media-performance.md.

Interfaces: backgroundVisible only at intersectionRatio >=0.5; existing no-observer fallback unchanged.

- [x] Add partial visibility failing tests including CN 390x900 and mobile 844 tall.
- [x] Observe failure; change threshold/check; verify scroll playback/manual pause/reduced motion.
- [x] Full suite, type check, production build, all live tests; fresh final review (no Critical/Important findings; two Minor deferred in results).
- [x] Stage new release without changing current; test locally on server; backup, atomic switch with rollback and health checks.
- [ ] Sequential cold/warm Chrome measurements; document actual results and server limitations; push server branch only.
