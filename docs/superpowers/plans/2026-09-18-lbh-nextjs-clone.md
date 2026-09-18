# LBH Appliances Bilingual Next.js Clone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and privately publish a bilingual, responsive Next.js reproduction of every public LBH Appliances page, with local assets and matching frontend interactions.

**Architecture:** A statically exported Next.js App Router application renders locale-prefixed routes from typed local content manifests. Shared server components render page templates, focused client components provide interaction, and a reproducible capture pipeline inventories the public source site and downloads its public media without creating a runtime dependency on it.

**Tech Stack:** Next.js 16.3.5, React 19.3.0, TypeScript 7.0.2, CSS Modules/global CSS, Vitest 5.0.1, Testing Library, Playwright 1.63.0, Node.js capture scripts.

**Spec:** `docs/superpowers/specs/2026-09-18-lbh-nextjs-clone-design.md`

## Global Constraints

- Implement both `/en` and `/cn` with one shared component architecture.
- Preserve all unique public routes represented by the 102-entry source sitemap, including 24 product details and 34 news/FAQ details.
- Preserve legacy unprefixed source URLs through static redirect pages that send users to `/en` equivalents.
- Store required public media locally under `public`; production rendering must not depend on LBH page HTML or LBH business APIs.
- Match the source design at 1440px desktop and 390px mobile widths without horizontal overflow.
- Keep the inquiry UI complete, but use a simulated submission adapter; expose `/api/inquiry` as the future adapter endpoint without sending mail.
- Do not add accounts, checkout, a CMS, search, a database, or other unrequested features.
- Use `apply_patch` for authored file changes and preserve the approved design document.

## Planned File Map

- `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`: project, build, and test configuration.
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/icon.svg`, `app/not-found.tsx`: root shell, default redirect, design tokens, favicon, and fallback.
- `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `app/[locale]/[...slug]/page.tsx`: locale shell, home, and typed content routing.
- `components/site/*`: header, navigation, footer, floating actions, media primitives, and shared page sections.
- `components/interactive/*`: carousel, drawer, tabs, gallery/lightbox, accordion, video modal, counter, and inquiry form.
- `components/templates/*`: home, product index/category/detail, editorial, article list/detail, contact, and download templates.
- `content/schema.ts`, `content/site.ts`, `content/pages.ts`, `content/products.ts`, `content/articles.ts`: typed bilingual content manifests.
- `lib/i18n.ts`, `lib/routes.ts`, `lib/content.ts`, `lib/inquiry.ts`, `lib/media.ts`: locale, lookup, inquiry boundary, and media helpers.
- `scripts/capture-source.mjs`, `scripts/build-content.mjs`, `scripts/check-routes.mjs`, `scripts/check-assets.mjs`: source inventory, typed-content generation, and integrity checks.
- `source-cache/manifest.json`, `source-cache/pages/*.html`: ignored capture cache used to regenerate authored manifests.
- `public/media/**`, `public/downloads/**`: localized public assets.
- `tests/unit/**`, `tests/integration/**`, `tests/e2e/**`: data, rendering, interaction, route, and visual tests.

---

### Task 1: Scaffold the Next.js application and test harness

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/icon.svg`
- Create: `tests/unit/smoke.test.tsx`, `tests/setup.ts`
- Modify: `.gitignore`, `.openai/hosting.json`

**Interfaces:**
- Produces: `npm run dev`, `npm test`, `npm run build`, and a static `out/` directory.
- Produces: `RootLayout({ children }: Readonly<{ children: React.ReactNode }>)`.

- [ ] **Step 1: Configure the Sites execution profile**

Run:

```bash
node /Users/zsc/.codex/plugins/cache/openai-curated-remote/sites/0.1.65/scripts/configure-execution-profile.mjs
```

Expected: portable profile recorded under ignored `.sites-runtime/` without modifying the approved spec.

- [ ] **Step 2: Write the failing root-layout smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";

it("declares the LBH document shell", () => {
  render(<RootLayout><main>content</main></RootLayout>);
  expect(screen.getByText("content")).toBeInTheDocument();
});
```

- [ ] **Step 3: Run the test and verify the scaffold is absent**

Run: `npm test -- tests/unit/smoke.test.tsx`

Expected: FAIL because the Next.js project and `@/app/layout` do not exist.

- [ ] **Step 4: Create the minimal Next.js project**

Pin `next@16.3.5`, `react@19.3.0`, `react-dom@19.3.0`, `typescript@7.0.2`, `vitest@5.0.1`, `@playwright/test@1.63.0`, Testing Library, jsdom, and their type packages. Set `next.config.ts` to `output: "export"`, `trailingSlash: true`, and unoptimized images. Set `.openai/hosting.json` to `{ "static": { "directory": "out" } }` while preserving a later Sites `project_id`.

Use this root page behavior:

```tsx
import { redirect } from "next/navigation";
export default function RootPage() { redirect("/en"); }
```

- [ ] **Step 5: Install and verify the harness**

Run:

```bash
node /Users/zsc/.codex/plugins/cache/openai-curated-remote/sites/0.1.65/scripts/install-dependencies.mjs
npm test -- tests/unit/smoke.test.tsx
```

Expected: PASS with a generated lockfile.

- [ ] **Step 6: Commit the scaffold**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json vitest.config.ts playwright.config.ts app tests .gitignore .openai/hosting.json
git commit -m "chore: scaffold LBH Next.js site"
```

### Task 2: Capture the public route and asset inventory

**Files:**
- Create: `scripts/capture-source.mjs`, `scripts/check-source-manifest.mjs`
- Create: `tests/integration/source-manifest.test.ts`
- Create: `source-cache/manifest.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `captureSource({ origin, cacheDir }): Promise<SourceManifest>`.
- Produces: `SourceManifest = { capturedAt: string; sitemapUrls: string[]; pages: SourcePage[]; assets: SourceAsset[] }`.
- `SourcePage` has `url`, `pathname`, `kind`, `localeVariants`, `cacheFile`, and `status`.
- `SourceAsset` has `sourceUrl`, `localPath`, `contentType`, `sha256`, and `referencedBy`.

- [ ] **Step 1: Write the failing manifest contract test**

```ts
import manifest from "@/source-cache/manifest.json";

it("inventories the complete public source", () => {
  expect(manifest.sitemapUrls).toHaveLength(102);
  expect(new Set(manifest.sitemapUrls).size).toBeLessThanOrEqual(102);
  expect(manifest.pages.filter((page) => page.kind === "product-detail")).toHaveLength(24);
  expect(manifest.pages.filter((page) => page.kind === "news-detail")).toHaveLength(34);
});
```

- [ ] **Step 2: Run the manifest test**

Run: `npm test -- tests/integration/source-manifest.test.ts`

Expected: FAIL because no capture manifest exists.

- [ ] **Step 3: Implement capture and deterministic classification**

Fetch `/sitemap.xml` and both `/en` and `/cn` variants with a normal browser user agent, retry 429/5xx responses three times with bounded backoff, save page HTML only under ignored `source-cache/pages`, and classify paths with this pure mapping:

```js
const classify = (pathname) => pathname.includes("/ProductDetail/") ? "product-detail"
  : pathname.includes("/NewsDetail/") ? "news-detail"
  : pathname.includes("/NewsList/") ? "news-list"
  : pathname.includes("/Product/") ? "product-category"
  : pathname.endsWith("/ProductIndex") ? "product-index"
  : pathname === "/" ? "home" : "content";
```

Normalize protocol-relative media URLs to HTTPS, deduplicate by absolute URL, calculate SHA-256 after download, and keep failed fetches in the manifest with their HTTP status rather than silently dropping them.

- [ ] **Step 4: Capture and validate**

Run:

```bash
node scripts/capture-source.mjs --origin https://lbhappliances.com --cache source-cache
npm test -- tests/integration/source-manifest.test.ts
```

Expected: PASS; all 102 sitemap records are present and classified.

- [ ] **Step 5: Commit the reproducible inventory tooling**

```bash
git add scripts tests/integration/source-manifest.test.ts source-cache/manifest.json .gitignore
git commit -m "build: add LBH source inventory pipeline"
```

### Task 3: Define typed bilingual content and route lookup

**Files:**
- Create: `content/schema.ts`, `content/site.ts`, `content/pages.ts`, `content/products.ts`, `content/articles.ts`
- Create: `lib/i18n.ts`, `lib/routes.ts`, `lib/content.ts`
- Create: `scripts/build-content.mjs`
- Create: `tests/unit/content.test.ts`, `tests/unit/routes.test.ts`

**Interfaces:**
- Produces: `type Locale = "en" | "cn"` and `isLocale(value: string): value is Locale`.
- Produces: `type ContentBlock = HeroBlock | RichTextBlock | MediaBlock | SplitBlock | StatsBlock | GalleryBlock | TimelineBlock | CtaBlock`.
- Produces: `getPage(locale: Locale, slug: string[]): SitePage | undefined`.
- Produces: `getAlternatePath(locale: Locale, slug: string[]): string`.
- Consumes: `source-cache/manifest.json` and captured source HTML.

- [ ] **Step 1: Write failing locale, count, and alternate-route tests**

```ts
expect(isLocale("en")).toBe(true);
expect(isLocale("fr")).toBe(false);
expect(products).toHaveLength(24);
expect(articles).toHaveLength(34);
expect(getAlternatePath("en", ["ProductDetail", "11906944.html"]))
  .toBe("/cn/ProductDetail/11906944.html");
```

- [ ] **Step 2: Verify the content layer is missing**

Run: `npm test -- tests/unit/content.test.ts tests/unit/routes.test.ts`

Expected: FAIL on unresolved content and route modules.

- [ ] **Step 3: Implement schemas and the build-content conversion**

Create discriminated unions keyed by `block.type`. Convert source headings, paragraphs, lists, images, statistics, and CTA groups into these known block types; strip inline scripts, event handlers, tracking markup, and source-builder chrome. Store product specifications as ordered `{ label, value }[]`, never as raw HTML.

The lookup contract must be:

```ts
export function getPage(locale: Locale, slug: string[]): SitePage | undefined {
  const key = `/${slug.join("/")}`;
  return allPages.find((page) => page.locale === locale && page.legacyPath === key);
}
```

- [ ] **Step 4: Generate and validate both languages**

Run:

```bash
node scripts/build-content.mjs --source source-cache --output content
npm test -- tests/unit/content.test.ts tests/unit/routes.test.ts
```

Expected: PASS with 24 products, 34 articles, all named company/service pages, and no raw `<script>` content.

- [ ] **Step 5: Commit the content model**

```bash
git add content lib scripts/build-content.mjs tests/unit/content.test.ts tests/unit/routes.test.ts
git commit -m "feat: add typed bilingual LBH content"
```

### Task 4: Build the responsive site shell

**Files:**
- Create: `app/[locale]/layout.tsx`
- Create: `components/site/Header.tsx`, `components/site/DesktopNav.tsx`, `components/site/MobileNav.tsx`, `components/site/Footer.tsx`, `components/site/FloatingActions.tsx`, `components/site/LanguageSwitch.tsx`
- Create: `components/interactive/MobileMenu.tsx`
- Modify: `app/globals.css`
- Create: `tests/unit/site-shell.test.tsx`, `tests/e2e/navigation.spec.ts`

**Interfaces:**
- Consumes: `Locale`, `siteConfig`, and `getAlternatePath`.
- Produces: `SiteShell({ locale, children })` and accessible navigation landmarks.

- [ ] **Step 1: Write failing shell behavior tests**

```tsx
render(<SiteShell locale="en"><main>Page</main></SiteShell>);
expect(screen.getByRole("link", { name: "Product" })).toHaveAttribute("href", "/en/ProductIndex");
expect(screen.getByRole("link", { name: "中文" })).toHaveAttribute("href", "/cn");
expect(screen.getByRole("contentinfo")).toHaveTextContent("tina.fang@linknove.com");
```

- [ ] **Step 2: Run the tests and confirm failure**

Run: `npm test -- tests/unit/site-shell.test.tsx`

Expected: FAIL because the shell components do not exist.

- [ ] **Step 3: Implement the shell and source-matched visual tokens**

Define CSS variables for the source black `#1f1b19`, LBH orange `#ef4b00`, warm background `#dbc6b7`, white, text gray, content widths, and motion durations. Implement keyboard-operable desktop menus and a focus-managed mobile drawer with `aria-expanded`, Escape close, backdrop close, and body scroll lock.

- [ ] **Step 4: Verify desktop and mobile navigation**

Run:

```bash
npm test -- tests/unit/site-shell.test.tsx
npx playwright test tests/e2e/navigation.spec.ts --project=chromium
```

Expected: PASS; language, dropdown, drawer, and footer links work at 1440px and 390px.

- [ ] **Step 5: Commit the shared shell**

```bash
git add app components/site components/interactive/MobileMenu.tsx tests app/globals.css
git commit -m "feat: build responsive LBH site shell"
```

### Task 5: Implement the homepage and first meaningful preview

**Files:**
- Create: `app/[locale]/page.tsx`
- Create: `components/templates/HomeTemplate.tsx`
- Create: `components/interactive/HeroCarousel.tsx`, `components/interactive/CountUp.tsx`, `components/interactive/VideoModal.tsx`
- Create: `components/site/SectionRenderer.tsx`, `components/site/Media.tsx`
- Create: `tests/unit/home.test.tsx`, `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: typed locale home content and local media paths.
- Produces: `HomeTemplate({ page }: { page: SitePage })` and reusable `SectionRenderer`.
- Test fixture: `englishHome` is the English home `SitePage` exported from `content/pages.ts`.

- [ ] **Step 1: Write failing source-recognition tests**

```tsx
render(<HomeTemplate page={englishHome} />);
expect(screen.getByRole("heading", { name: /Saving You Time and Cost/ })).toBeVisible();
expect(screen.getByText("10 Automated Production Lines")).toBeVisible();
expect(screen.getByRole("heading", { name: /Why LBH's Personal Care Appliances Solutions/ })).toBeVisible();
```

- [ ] **Step 2: Run the homepage test**

Run: `npm test -- tests/unit/home.test.tsx`

Expected: FAIL because the homepage template and interactive primitives do not exist.

- [ ] **Step 3: Implement the smallest coherent homepage slice**

Build the black header, orange divider, first hero slide, source-matched typography, production-line bullets, and the opening manufacturing section. Reserve media dimensions and implement reduced-motion behavior before adding the remaining sections.

- [ ] **Step 4: Start and hand off the first preview**

Run `npm run dev` in a retained terminal session, request `/en`, require HTTP 200, then open the printed Local URL with the app preview tool. Do not make further planned product-source edits before this handoff.

Expected: the visible page is recognizably LBH, not a starter or skeleton.

- [ ] **Step 5: Complete both localized homepages**

Add every source homepage section, carousel controls, counters, video dialog, product category blocks, welcome copy, certifications, mission, and final CTA. Use local media paths from the manifest.

- [ ] **Step 6: Verify behavior and commit**

Run:

```bash
npm test -- tests/unit/home.test.tsx
npx playwright test tests/e2e/home.spec.ts --project=chromium
```

Expected: PASS in English and Chinese, including carousel, modal, counters, and no 390px overflow.

```bash
git add app components content tests public/media
git commit -m "feat: recreate bilingual LBH homepage"
```

### Task 6: Implement product index, categories, and 24 product details

**Files:**
- Create: `components/templates/ProductIndexTemplate.tsx`, `components/templates/ProductCategoryTemplate.tsx`, `components/templates/ProductDetailTemplate.tsx`
- Create: `components/interactive/ProductGallery.tsx`, `components/interactive/ProductTabs.tsx`
- Modify: `app/[locale]/[...slug]/page.tsx`, `lib/content.ts`
- Create: `tests/unit/products.test.tsx`, `tests/e2e/products.spec.ts`

**Interfaces:**
- Consumes: `Product`, `ProductCategory`, `getPage`, and inquiry-open callbacks.
- Produces: `generateStaticParams()` for all product routes and templates for each product page kind.
- Produces: `productStaticParams(): Array<{ locale: Locale; slug: string[] }>` as the product-only route helper tested independently before the catch-all route combines all content kinds.

- [ ] **Step 1: Write failing product route and rendering tests**

```ts
expect(productStaticParams()).toContainEqual({ locale: "en", slug: ["ProductDetail", "11906944.html"] });
expect(productStaticParams()).toContainEqual({ locale: "cn", slug: ["Product", "682975.html"] });
```

```tsx
render(<ProductDetailTemplate product={products[0]} locale="en" />);
expect(screen.getByRole("heading", { name: "LBH-3228" })).toBeVisible();
expect(screen.getByText(/100-120V\/220-240V/)).toBeVisible();
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- tests/unit/products.test.tsx`

Expected: FAIL because product templates and route params do not exist.

- [ ] **Step 3: Implement all product surfaces**

Render the product overview, five source categories, and all 24 detail pages. Implement thumbnail selection, lightbox dialog, ordered specification rows, parameter/features/accessory tabs, category filtering, and inquiry triggers. Keep desktop gallery/specification layout and mobile stacking aligned to the source.

- [ ] **Step 4: Run product tests**

Run:

```bash
npm test -- tests/unit/products.test.tsx
npx playwright test tests/e2e/products.spec.ts --project=chromium
```

Expected: PASS for index, five categories, representative straightener/dryer details, gallery, tabs, and mobile layout.

- [ ] **Step 5: Commit product pages**

```bash
git add app components/templates components/interactive content lib tests public/media/products
git commit -m "feat: add bilingual LBH product catalog"
```

### Task 7: Implement company, manufacturing, and service pages

**Files:**
- Create: `components/templates/EditorialTemplate.tsx`
- Create: `components/site/blocks/HeroBlock.tsx`, `RichTextBlock.tsx`, `MediaBlock.tsx`, `SplitBlock.tsx`, `StatsBlock.tsx`, `GalleryBlock.tsx`, `TimelineBlock.tsx`, `CtaBlock.tsx`
- Modify: `components/site/SectionRenderer.tsx`, `app/[locale]/[...slug]/page.tsx`
- Create: `tests/unit/editorial.test.tsx`, `tests/integration/editorial-routes.test.ts`

**Interfaces:**
- Consumes: every `ContentBlock` union member from `content/schema.ts`.
- Produces: exhaustive `renderBlock(block: ContentBlock)`; TypeScript must fail when a new block type is unhandled.

- [ ] **Step 1: Write failing exhaustive-renderer and route tests**

```ts
for (const path of expectedEditorialPaths) {
  expect(getPage("en", path.split("/").filter(Boolean))).toBeDefined();
  expect(getPage("cn", path.split("/").filter(Boolean))).toBeDefined();
}
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- tests/unit/editorial.test.tsx tests/integration/editorial-routes.test.ts`

Expected: FAIL for missing templates/block renderers.

- [ ] **Step 3: Implement typed block renderers and pages**

Render company profile, leadership, factory tour, milestone, certification, sustainability, product laboratory, exclusive sale, OEM, quality, design, order management, manufacturing, warranty, ventilation technology, and assistance pages. Match each source section order, image crop, background, alignment, and responsive stacking.

- [ ] **Step 4: Verify every editorial route**

Run: `npm test -- tests/unit/editorial.test.tsx tests/integration/editorial-routes.test.ts`

Expected: PASS with no unhandled block type and no missing bilingual content route.

- [ ] **Step 5: Commit editorial pages**

```bash
git add app components content tests public/media/pages
git commit -m "feat: recreate LBH company and service pages"
```

### Task 8: Implement Blog, FAQ, news, contact, and downloads

**Files:**
- Create: `components/templates/ArticleListTemplate.tsx`, `ArticleDetailTemplate.tsx`, `FaqTemplate.tsx`, `ContactTemplate.tsx`, `DownloadsTemplate.tsx`
- Create: `components/interactive/Accordion.tsx`
- Modify: `app/[locale]/[...slug]/page.tsx`
- Create: `tests/unit/content-pages.test.tsx`, `tests/integration/content-routes.test.ts`

**Interfaces:**
- Consumes: 34 `Article` records, FAQ records, contact details, and localized downloads.
- Produces: static params for lists, articles, FAQ, contact, and download pages.
- Produces: `articleStaticParams(): Array<{ locale: Locale; slug: string[] }>` with exactly 68 localized detail entries.

- [ ] **Step 1: Write failing content route tests**

```ts
expect(articleStaticParams()).toHaveLength(68);
expect(getPage("en", ["FAQ"])).toBeDefined();
expect(getPage("cn", ["Contact_Us"])).toBeDefined();
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- tests/unit/content-pages.test.tsx tests/integration/content-routes.test.ts`

Expected: FAIL because the content templates do not exist.

- [ ] **Step 3: Implement list/detail/FAQ/contact/download templates**

Render article metadata, headings, body blocks, images, list pagination states, accessible FAQ accordions, source contact details, product catalogue cards, and working links to localized files in `public/downloads`.

- [ ] **Step 4: Verify content surfaces**

Run: `npm test -- tests/unit/content-pages.test.tsx tests/integration/content-routes.test.ts`

Expected: PASS for all 68 localized article detail paths and all support pages.

- [ ] **Step 5: Commit content pages**

```bash
git add app components content tests public/downloads public/media/articles
git commit -m "feat: add LBH articles FAQ and contact pages"
```

### Task 9: Implement the inquiry boundary and shared modal

**Files:**
- Create: `lib/inquiry.ts`, `components/interactive/InquiryDialog.tsx`, `components/interactive/InquiryForm.tsx`
- Modify: `app/[locale]/layout.tsx`, product and contact templates
- Create: `tests/unit/inquiry.test.ts`, `tests/unit/inquiry-form.test.tsx`, `tests/e2e/inquiry.spec.ts`

**Interfaces:**
- Produces: `type InquiryPayload = { name: string; email: string; company?: string; phone?: string; message: string; product?: string; locale: Locale }`.
- Produces: `validateInquiry(payload: Partial<InquiryPayload>): Record<string, string>`.
- Produces: `submitInquiry(payload: InquiryPayload): Promise<{ ok: true; reference: string }>`.
- Future transport endpoint: `POST /api/inquiry`; current adapter simulates a 300ms response and does not send email.

- [ ] **Step 1: Write failing validation and submission tests**

```ts
expect(validateInquiry({ name: "", email: "bad", message: "", locale: "en" })).toEqual({
  name: "Name is required", email: "Enter a valid email", message: "Message is required"
});
```

```tsx
await user.click(screen.getByRole("button", { name: "Submit" }));
expect(await screen.findByText("Thank you. We will contact you soon.")).toBeVisible();
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- tests/unit/inquiry.test.ts tests/unit/inquiry-form.test.tsx`

Expected: FAIL because validation, adapter, and form are absent.

- [ ] **Step 3: Implement localized form states**

Add accessible labels, required/format validation, field errors linked with `aria-describedby`, pending disable state, localized success/failure copy, Escape-close behavior, focus return, and product prefill. Keep the transport isolated so replacing the mock with `fetch("/api/inquiry", ...)` changes only `lib/inquiry.ts`.

- [ ] **Step 4: Verify all inquiry entry points**

Run:

```bash
npm test -- tests/unit/inquiry.test.ts tests/unit/inquiry-form.test.tsx
npx playwright test tests/e2e/inquiry.spec.ts --project=chromium
```

Expected: PASS from header, product, CTA, and contact-page entry points in both languages.

- [ ] **Step 5: Commit inquiry behavior**

```bash
git add app components lib tests
git commit -m "feat: add simulated bilingual inquiry flow"
```

### Task 10: Add metadata, legacy redirects, sitemap, favicon, and route integrity

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/not-found.tsx`
- Modify: `app/layout.tsx`, `app/[locale]/layout.tsx`, `app/[locale]/[...slug]/page.tsx`, `app/icon.svg`, `next.config.ts`
- Create: `scripts/check-routes.mjs`, `tests/unit/metadata.test.ts`, `tests/integration/route-coverage.test.ts`

**Interfaces:**
- Consumes: every localized content path.
- Produces: canonical and alternate-language metadata, XML sitemap entries, localized 404s, and generated static redirect pages for every legacy path.

- [ ] **Step 1: Write failing coverage tests**

```ts
for (const sourcePath of uniqueSourcePaths) {
  expect(exportedPaths).toContain(`/en${sourcePath === "/" ? "" : sourcePath}`);
  expect(legacyRedirects).toContain(sourcePath);
}
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- tests/unit/metadata.test.ts tests/integration/route-coverage.test.ts`

Expected: FAIL for missing metadata and legacy route outputs.

- [ ] **Step 3: Implement metadata and static compatibility pages**

Generate titles/descriptions from content, `alternates.languages` for English and Chinese, canonical locale URLs, sitemap entries for both locales, a source-colored LBH favicon, robots rules, and small HTML redirect outputs for unprefixed source paths because `output: "export"` cannot use server redirects.

- [ ] **Step 4: Build and run route integrity checks**

Run:

```bash
npm test -- tests/unit/metadata.test.ts tests/integration/route-coverage.test.ts
npm run build
node scripts/check-routes.mjs --output out --manifest source-cache/manifest.json
```

Expected: PASS; every expected localized page and legacy redirect has an `index.html`, and internal links resolve.

- [ ] **Step 5: Commit discoverability and compatibility**

```bash
git add app next.config.ts scripts/check-routes.mjs tests
git commit -m "feat: add LBH metadata and legacy route coverage"
```

### Task 11: Localize and validate all required media

**Files:**
- Create: `scripts/check-assets.mjs`, `tests/integration/assets.test.ts`
- Modify: `public/media/**`, `public/downloads/**`, `content/**/*.ts`

**Interfaces:**
- Consumes: `SourceAsset[]` and every media reference from typed content.
- Produces: a zero-error asset report; every rendered media reference resolves locally.

- [ ] **Step 1: Write the failing asset integrity test**

```ts
for (const path of collectContentMediaPaths()) {
  expect(path.startsWith("/media/") || path.startsWith("/downloads/")).toBe(true);
  expect(existsSync(join(process.cwd(), "public", path))).toBe(true);
}
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- tests/integration/assets.test.ts`

Expected: FAIL with a concrete list of missing or remote assets.

- [ ] **Step 3: Complete downloads and rewrite content references**

Download each required source asset once, verify content type and SHA-256, preserve meaningful extensions, use deterministic local names, and update content manifests to local paths. Do not keep tracking pixels, source UI chrome, duplicate byte-identical files, or unresolved media references.

- [ ] **Step 4: Validate media and static output**

Run:

```bash
npm test -- tests/integration/assets.test.ts
node scripts/check-assets.mjs --public public --content content
npm run build
```

Expected: PASS; no required page asset or download returns missing, zero-byte, or remote-LBH dependency errors.

- [ ] **Step 5: Commit localized media**

```bash
git add public content scripts/check-assets.mjs tests/integration/assets.test.ts
git commit -m "assets: localize LBH public media"
```

### Task 12: Visual parity, accessibility, final verification, and private publishing

**Files:**
- Create: `tests/e2e/visual.spec.ts`, `tests/e2e/accessibility.spec.ts`
- Create: `tests/visual/reference/**`, `tests/visual/current/**`
- Modify: `app/globals.css`, affected components only when comparison finds a measured mismatch
- Modify: `.openai/hosting.json` only through Sites registration/publishing workflow

**Interfaces:**
- Consumes: completed static site and retained development preview.
- Produces: successful full test/build/route/asset run and a private deployed Sites URL.

- [ ] **Step 1: Add representative screenshot assertions**

Capture `/en`, `/cn`, `/en/ProductIndex`, `/en/ProductDetail/11906944.html`, `/cn/ProductDetail/11906921.html`, `/en/Company_Introduction`, `/en/NewsDetail/6860217.html`, and `/cn/Contact_Us` at 1440×1200 and 390×844. Assert `document.documentElement.scrollWidth === window.innerWidth` at mobile width.

- [ ] **Step 2: Run visual and accessibility checks**

Run:

```bash
npx playwright test tests/e2e/visual.spec.ts tests/e2e/accessibility.spec.ts --project=chromium
```

Expected: initial comparison may FAIL with named screenshot or accessibility mismatches; no page may crash.

- [ ] **Step 3: Fix measured mismatches only**

Adjust shared tokens, section spacing, image object positions, breakpoint behavior, focus visibility, labels, and contrast based on the representative failures. Re-run the same specs until PASS; do not introduce redesigns or new sections.

- [ ] **Step 4: Run the complete verification suite**

Run:

```bash
npm test
npx playwright test --project=chromium
node scripts/check-assets.mjs --public public --content content
node /Users/zsc/.codex/plugins/cache/openai-curated-remote/sites/0.1.65/scripts/build-site.mjs
node scripts/check-routes.mjs --output out --manifest source-cache/manifest.json
git diff --check
```

Expected: all commands PASS, `out/index.html` exists, and `git status --short` contains only intentional final changes.

- [ ] **Step 5: Commit the verified site**

```bash
git add app components content lib public scripts tests package.json package-lock.json next.config.ts .openai/hosting.json
git commit -m "test: verify LBH clone visual parity"
```

- [ ] **Step 6: Register and publish privately through Sites**

Follow the Sites registration flow once, preserve the returned `project_id`, package the exact verified commit, save a version, deploy owner-private, and verify deployment success. Never print or commit the source credential.

Expected: a private deployed URL loads the same verified build.

- [ ] **Step 7: Final handoff**

Return the private URL, state that both languages and all public routes are included, and note that the inquiry form is simulated until the user supplies the future email configuration.
