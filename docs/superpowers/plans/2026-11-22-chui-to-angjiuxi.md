# Chui to Angjiuxi Website Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current Chui/legacy product site in this GitHub repository with the verified 昂玖熙 B2B women’s denim website while preserving the repository history and its Sites project identity.

**Architecture:** Use the existing verified dependency-free static website as the source of truth. The target repository will build directly into `out/`, matching its existing Sites hosting configuration, and will keep only the new website source, assets, tests, build scripts, and deployment metadata at the active project surface.

**Tech Stack:** Node.js ESM, static HTML/CSS/JS, WebP/PNG assets, Node test runner, GitHub, OpenAI Sites static hosting.

**Spec:** `E:\知识库\docs\superpowers\specs\2026-11-10-angjiuxi-b2b-website-design.md`

## Global Constraints

- Keep the direct offline wholesale positioning for livestream teams, Nanyou second-batch customers, and physical stores.
- Use verified brand/contact facts only; do not publish Feishu credentials, placeholder text, unverified rankings, exact operating metrics, or unauthorized client names.
- Preserve the target repository’s `.openai/hosting.json` project identity while changing its static directory to the new build output.
- Keep the public site crawlable, responsive, and structured for GEO with canonical metadata, JSON-LD, sitemap, and robots files.
- Do not push until the migrated repository builds, tests, and public-output security scans pass.

---

### Task 1: Copy verified website source into the target repository

**Files:**
- Copy from `E:\知识库\angjiuxi-site\website\` to the target repository root: `package.json`, `public/`, `scripts/`, `src/`, `tests/`, `README.md`, `.gitignore`
- Preserve target `.git/`, `.openai/hosting.json`, `AGENTS.md`, and existing Git history until the replacement commit is ready.

- [ ] Verify the source website contains 17 prepared image assets, 15 routes, and its 38 passing tests before copying.
- [ ] Copy source files into the target root without copying the generated `dist/` directory.
- [ ] Remove legacy active-site directories only after confirming they are not needed by the new build: `app/`, `components/`, `content/`, `lib/`, `source-cache/`, and old root `scripts/`, `tests/`, `public/` contents.

### Task 2: Align the target build and Sites output

**Files:**
- Modify `package.json`
- Modify `.openai/hosting.json`
- Modify `scripts/build.mjs`
- Modify `README.md`

- [ ] Change the build command to generate `out/` and the dev command to serve `out/`.
- [ ] Keep the target Sites project ID and change only the static directory from `out` if needed; the final value must be `out`.
- [ ] Use the real deployment URL through `SITE_URL` for canonical, Open Graph, sitemap, and robots output.
- [ ] Document local preview and the requirement to rotate the previously exposed Feishu bot key before any data integration.

### Task 3: Validate the migrated website

**Files:**
- Test existing `tests/*.test.mjs`
- Add or update `tests/migration.test.mjs` if target-output assertions are missing.

- [ ] Run `npm test` and require all tests to pass.
- [ ] Run `npm run build` and require `out/index.html`, all 15 route pages, `out/sitemap.xml`, `out/robots.txt`, `out/styles.css`, `out/site.js`, and `out/og.png`.
- [ ] Scan `out/` for `cli_`, `Jvmo`, `app_secret`, `待确认`, `.example`, unverified ranking/metric claims, and legacy Chui/LBH product markers.
- [ ] Start the normal preview server and verify the homepage, main routes, assets, sitemap, and robots return successfully.

### Task 4: Commit and push the replacement

**Files:**
- Git commit in the target repository

- [ ] Review `git diff --stat` and confirm only the requested project migration is included.
- [ ] Commit with `feat: transform chui into Angjiuxi B2B website`.
- [ ] Push `main` to `https://github.com/aazhihui12-dotcom/chui.git`.
- [ ] Re-read the remote HEAD and report the final commit and what changed.
