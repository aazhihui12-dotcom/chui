# Media Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce unnecessary homepage media traffic without changing the site design or CMS publishing.

**Architecture:** Gate background video mounting/playback on visibility and motion preference. Use a native lazy background image and narrowly scoped runtime static caching. Deploy a tested new release with rollback.

**Tech Stack:** Existing Next.js 16.3.5, React 19.3, Vitest, Playwright, Nginx.

**Spec:** docs/superpowers/specs/2026-11-01-media-performance-design.md

## Global Constraints

- Preserve existing imagery, typography, hover/scroll effects, IP access and CMS data/accounts.
- No paid services, DNS changes, browser/system setting changes or GitHub Pages main publish.
- Only shipped public media/fonts get 86400-second caching; do not apply immutable to mutable names.
- Production tests are read-only; all writing CMS tests use isolated local data.

## Review Focus

- Video visibility changes must not undo a user's manual pause.
- Live reduced-motion changes and unsupported observers must not hide content or throw.
- Lazy background must cover the section without changing mobile/desktop layout or no-JS visibility.
- Missing assets and authenticated/API responses must not acquire the public asset cache policy.
- Releasing code must not modify persistent database/uploads, credentials or the original Pages branch.

### Task 1: Defer offscreen homepage media

**Files:** components/interactive/VideoModal.tsx; components/templates/HomeTemplate.tsx; content/home.ts; app/globals.css; app/home-sustainability.css; tests/unit/media-loading.test.tsx

**Interfaces:** Existing VideoModal props remain unchanged; HomeTemplate gains an original-image lazy background, not a new public API.

- [x] Add real-component tests for no screen-off video source, visible activation, reduced motion, manual dialog activation and lazy original background.
- [x] Run `npx vitest run tests/unit/media-loading.test.tsx`; observe the missing behavior failures.
- [x] Implement visibility-gated video with preserved manual pause, and native lazy background cover.
- [x] Run targeted tests and `npm test`; expect zero failures.
- [x] Commit only task files and these planning documents.

### Task 2: Cache public files and verify in real browsers

**Files:** runtime/next.config.mjs; tests/live/media-loading.spec.ts; docs/admin-operations.md

**Interfaces:** GET /media/* and /fonts/* successful file responses use public max-age=86400; CMS/API and HTML retain their existing policies.

- [x] Add production-browser tests: offscreen media absent, real video plays on entry and pauses offscreen, manual pause persists, reduced-motion poster, lazy background cover at 1440/390, public cache and missing-file/API exclusions.
- [x] Run them against the old local production build to observe expected cache/video/background failures.
- [x] Add scoped runtime headers and operating notes for static-file updates; rebuild with the production site URL.
- [x] Run `npm test`, all local CMS Playwright tests, `npx tsc --noEmit`; expect zero failures.
- [x] Commit and obtain one fresh whole-change review before production activation.

### Task 3: Publish and compare

**Files:** No persistent content or DNS changes; private verification artifacts only.

**Interfaces:** New immutable release directory → /opt/apower/current; same /var/lib/apower and /etc/apower.env.

- [x] Back up current release target/config metadata and run the existing CMS backup service.
- [x] Package the built runtime, copy existing dependencies/public into a new release, and health-check on an alternate local port.
- [x] Switch the release link and restart; roll back if trusted-TLS route checks fail.
- [x] Run read-only domain checks, cold/warm Chrome media measurements, visible video and original layout checks; record timings and unresolved DNS limitations without claiming global DNS repair.
- [x] Push only the existing server branch, not main; leave a concise handoff.
