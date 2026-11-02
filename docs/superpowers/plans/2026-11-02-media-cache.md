# Static media negative-cache repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent migration-era cached 404 responses from breaking otherwise valid site images.

**Architecture:** Stable query version on built-in image URLs; preserve existing image files, SSR, native lazy loading and project basePath. Browser regression uses a local HTTP origin to prime the old site's five-day negative-cache policy without request interception disabling browser caching.

**Tech Stack:** Next 16.3.5, React 19.3, TypeScript, Vitest, Playwright Chrome.

**Spec:** `docs/superpowers/specs/2026-11-02-media-cache-design.md`

## Global Constraints

- Stable `apower_v=20261102`; preserve existing query/hash and make transformation idempotent.
- Version only built-in `/media/` images, never external images or UUID `/uploads/`.
- Preserve pixels, native lazy/eager priorities, no-JS SSR and `/chui` basePath.
- No DNS, paid infrastructure, credentials, database or upload changes.
- Local build; staged new release and reversible activation; do not push GitHub Pages main.

## Review Focus

- Previously prefixed basePath must not duplicate or lose the media version.
- Existing query/hash must survive; repeated normalization must be idempotent.
- External and persistent uploads must retain their original URL contract.
- Invalid/missing assets must not acquire a successful long-cache policy.
- Browser test must exercise real HTTP caching rather than routing interception.

### Task 1: Repair built-in image URLs and prove cache recovery

**Files:** `lib/media-path.ts`, image-rendering components, `tests/unit/media-path.test.tsx`, `tests/live/media-cache.spec.ts`, existing source-image assertions, operations docs.

**Interfaces:** `mediaPath(src: string): string` consumes a raw or base-prefixed source; returns the stable, prefixed, versioned image URL when under `/media/`, otherwise its normal sitePath value.

- [x] Write browser test priming original category URLs with real-cacheable 404s; run and observe four images fail before implementation.
- [x] Write component boundary tests for media/basePath/query/hash/idempotency/external/upload inputs and preserve lazy/eager attributes; observe missing version failure.
- [x] Implement helper and use it at built-in image rendering boundaries; update original-image assertions for unchanged pathname plus version query.
- [x] Run `npm test`, `npx tsc --noEmit`, production live build and full local live browser suite; require all pass, document pre-existing build warning.
- [ ] Commit and obtain fresh review of this task range; fix Important findings with RED→GREEN tests.
- [ ] Document cache evidence and publish staged server-only release, preserving persistent state; verify production category images and cache regression, then record actual release and results.
