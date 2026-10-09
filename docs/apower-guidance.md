# APOWER content update — 2026-10-08

## Source of truth

- Layout and supplied artwork: `APOWER TECH网站指导.xlsx` (首页、产品、关于).
- Chinese and English copy: `APOWER TECH官网文案中英对照【2026】-最新版.docx`.
- `content/apower-copy.json` preserves the extracted bilingual table entries. The document's editorial notes are not published.
- Existing LBH Chinese page section arrangements remain the structural reference. The approved charcoal, warm-gray and champagne palette and APOWER logo treatment remain in use.

## Implemented mapping

- Three homepage banners; four category destinations; AP-G1, AP-G3, AP-G11, AP-S1, AP-H1 and AP-AR01 product pages in both languages.
- Five supplied partner photographs, company billboard and white logo variant imported under `public/media/apower/`.
- Homepage, product overview, service/editorial pages, company story, team, milestones, factory, laboratory, contact information and 23 FAQ entries now use the supplied copy.
- Product overview video: `uGqOG4NfbZQ`; factory tour video: `bx1R2NQPTxw`. Players activate only after a click and include a YouTube fallback link.
- Canonical active catalog/navigation uses the four new categories. Legacy product detail and news URLs remain available for compatibility; archived pages are not represented as newly supplied APOWER specifications.

## Deliberately left pending

- The workbook requests a replacement 5S background without supplying a new image. The existing diagram remains pending a replacement asset.
- Only supplied product specifications are used; full specifications for the new models still need source material.
- Contact links use the supplied email and phone. Inquiry submission still uses the existing mock transport, not a live email delivery backend.
- No commit, GitHub push or public hosting deployment is part of this local-preview update.

## Verification commands

```sh
npm test -- --reporter=dot --maxWorkers=1
npx tsc --noEmit
PLAYWRIGHT_STATIC=1 npx playwright test tests/e2e/apower-guidance.spec.ts tests/e2e/theme-balance.spec.ts --workers=2 --reporter=line
node scripts/check-assets.mjs --output out
git diff --check
```

Use serial unit test workers because a pre-existing content-page test creates and removes a temporary public download while the asset audit walks that directory. Browser checks cover both locales at desktop and mobile widths, carousel content, contrast, category filtering, inquiry dialog, new detail routes, supplied video IDs and the company background image.

## Desktop homepage alignment

The follow-up request aligns homepage modules with the LBH Chinese reference while retaining APOWER copy/artwork, the four-category catalog and approved palette. `app/home-desktop.css` applies from 1024 px; `app/home-responsive.css` explicitly owns mobile/tablet metrics. The live reference stalled during inspection, so measurements were cross-checked against the retained September HTML, CSS, typography records and screenshots. A script-free local replay was used only for inspection; uninitialized carousel heights were not treated as authoritative.

- Hero: 36/54 px title, 18/27 px bullets, 5:12 height-to-viewport ratio at standard desktop widths. Longer replacement text has a 600 px minimum at 1024–1199 px to prevent overlap.
- Production: 40/60 px heading, 290 px video strip. The featured-model row remains mobile-only and follows the partnership cards, matching the source module order.
- Categories: retained four APOWER categories, each with a 224 px square image; source label and button spacing.
- Partnership: 1200 px container, 40 px card padding, 60 px row gaps, 530:308 image ratio, alternating image/text columns.
- Welcome: centered introduction, 980:549 video, then contact button.
- Testimonials: three wide-image cards instead of circular thumbnails. Certification images: 180×255 px containers.
- Mission: full-width heading above two columns. Restored separate brand/customization CTA and 137 px final contact strip.
- Homepage text-matching overrides are skipped in the source-style generator. Role-based homepage CSS owns all breakpoints, avoiding wrong fonts/buttons caused by matching replacement copy against unrelated source strings. Other page source-style mappings remain active.

Verify with `PLAYWRIGHT_STATIC=1 npx playwright test tests/e2e/home-desktop-reference.spec.ts tests/e2e/apower-guidance.spec.ts tests/e2e/theme-balance.spec.ts --workers=2 --reporter=line`. These checks include 1024/1280 laptop banner containment, 1440/1920 module measurements, customization hover readability and mobile isolation.

## Mobile and bilingual homepage alignment

- Header: 50 px. Hero: CN minimum 520 px / EN minimum 635 px; CN title 20/30 px and EN title 14/21 px, with 14/21 px bullets. Replacement copy may grow the banner rather than collide with product artwork.
- Section headings: CN 26/39 px / EN 22/33 px, normal weight. Tablet banners use 36/54 px headings and 18/27 px bullets.
- Production: video above a white statistics surface, with 50/50 px values and 14/21 px labels in two columns. Desktop keeps white text over its dark video overlay.
- Categories: one vertical column with square images occupying 76.9452% of viewport width; retain four APOWER destinations rather than reintroducing the old five-category catalog.
- Partnership: full-width cards with 40 px padding, 40 px corners, 530:308 photos, and stacked copy. Primary mobile buttons are 200×50 px; EN catalogue button is 260×50 px.
- Welcome: 980:549 video ratio followed by contact button. Testimonials use 16:9 images, and certificate images use two columns at 180:255.
- Mission: heading above image/copy. Separate brand/customization section is restored on mobile; the desktop-only final contact strip stays hidden there.
- Both locales are checked at 320, 390, 430 and 768 px; all three slides retain complete copy without horizontal overflow or text/artwork overlap on phones.

Verification on 2026-10-08: 32 targeted browser checks passed, 178 unit/integration tests passed, TypeScript and static asset audit passed, and the production export generated 272 pages. Use the combined four-file Playwright suite (responsive reference, desktop reference, APOWER guidance and theme balance) to repeat these checks. This is measured layout alignment against retained reference evidence, not a claim of whole-page pixel identity: APOWER text, artwork, colors, category count and three-slide content intentionally differ from LBH.

## Sustainability original-site restoration — 2026-10-09

The latest request references the original LBH homepage and supersedes the white-card screenshot draft. Live access was blocked by the origin's request filter, so retained homepage HTML/CSS and a script-free local replay provide the reference evidence (modules 724143437–440).

- Restore the original 1920×406 close-up leaf/sky background with no dark overlay, transparent columns, four original white PNG icons and white labels. No Unicode substitutes or opaque cards.
- Desktop title: EN Poppins bold 32/48 px; CN regular 40/60 px. Labels: EN Poppins bold 20/30 px; CN's first two labels are bold 20 px and the last two are bold 18 px, with the source 23.994 px inherited line-height and 微软雅黑 font family. The title container is 1200 px and the centered icon row has a 1089 px maximum width.
- Retain supplied APOWER copy; reorder the labels to correspond to the source icon semantics: renewable energy, energy-efficient products, eco-friendly packaging, sustainable materials. Links still lead to each locale's sustainability page.
- Phones use two transparent columns, with EN 22 px and CN 26 px headings. The source's outer 26 px span gives the EN heading a 39 px line box around its 22/33 px text; use that 39 px layout rhythm. Restore 10 px heading padding, the 99% icon row, 1 px gaps and the source 18 px icon-to-label spacing. EN phone label families follow the original: inherited sans-serif, Verdana, Poppins and Poppins; CN labels are 16 px with the source 23.994 px inherited line-height. The original separate mobile photograph was not captured, so phones crop the retained desktop photograph rather than claiming exact artwork identity.
- At 768–1199 px, a 320 px minimum section height keeps longer APOWER copy clear of the icon row. Explicit 100% width prevents aspect-ratio/min-height sizing from creating horizontal overflow.
- The follow-up typography correction restores the icon row's original negative offset (10.9718% of photograph width), rather than bottom-aligning labels or giving every label a 60 px minimum height. Labels use the full column content width, so line breaks follow the original available width. Container-relative units use actual module width, including when the browser has a scrollbar. English source declarations retain the exact `Poppins` family rather than adding a different fallback.

Other homepage modules, APOWER artwork and the approved palette remain unchanged. This is a local preview update; no GitHub push or public deployment is included.

Include `tests/e2e/home-sustainability-reference.spec.ts` in the targeted browser suite to guard this composition in both locales at 1098, 1440 and 390 px.

Typography verification on 2026-10-09: extended module checks cover both locales at 1098, 1280, 1440, 1920 and 390 px. The combined five-file browser suite passed 42 checks; all 178 unit/integration tests, TypeScript and production export checks passed. Replacement APOWER wording can wrap differently from the original LBH text at the same type size and column width; wording was not shortened to manufacture pixel identity.

## Homepage motion restoration — 2026-10-09

Live reference access remains blocked by the origin's request filter. Restore the scroll entrances from retained CN/EN homepage WOW attributes and shared animation CSS, rather than claiming a fresh live animation comparison. The source uses 150 px upward/rightward translations, opacity 0→1, `ease`, a 2.5-second duration and one-time viewport-triggered entrances.

- Sustainability icon row: `fadeInUp`, 0.5-second delay (CN modules 720156467 / 724117931, EN 724143440 / 724144855).
- Desktop hero: heading enters from the right and introductory bullets from below, both with a 0.5-second delay. Statistics enter from below after 1 second.
- Partnership cards: upward entrances with the original 0.3 / 0.6 / 0.9 / 1.2 / 1.5-second delays. Mobile featured products enter upward after 0.5 seconds; mission image after 0.3 seconds.
- Category buttons and desktop welcome CTA fade in after 0.5 seconds. The English category grid has an upward entrance without delay; the Chinese grid is not animated because its retained source has no WOW declaration.

`HomeMotion` applies Web Animations without adding layout wrappers. Individual `translate` preserves the sustainability row's existing horizontal centering transform. SSR/no-JavaScript output, unsupported observer/animation APIs and reduced-motion preferences retain visible content; changing to reduced motion or focusing a link cancels its entrance and reveals the content immediately. Existing numeric counting and partner autoplay are unchanged. Copy, static dimensions, imagery and palette are unchanged. No GitHub push or public deployment is included.

Verification: 53 checks passed in the six-file targeted Playwright suite, including actual mid-animation opacity/translation, original timing and stagger, no replay, natural completion at 1024/1280 px, keyboard focus, no-JavaScript and reduced-motion fallbacks. Static geometry tests use reduced motion to measure final layout, while motion tests explicitly enable normal motion. All 178 unit/integration tests, TypeScript, production export and the static asset audit passed. These checks verify the restored source-backed entrances, not whole-site dynamic identity against an inaccessible live original.

## Welcome photo/video module — 2026-10-09

User-approved bounded design follows the supplied screenshot: white background, centered heading and introduction, a large rounded photo-led video player and the contact button beneath it. APOWER bilingual wording, the existing overview video ID and the approved black/white brand CTA remain unchanged. Other players keep their previous appearance because `SourceVideo` receives optional poster/title props only in this homepage module.

- Replace the fragile `display:contents` / numbered grid rows with explicit intro, media and CTA elements in reading order. Desktop retains the 40/60 px heading, 16/24 px paragraph, 980×549 px player and 40 px corners. Phones retain localized heading/body sizes and use a full-width inset player with 24 px corners.
- Use the already-shipped `/media/manufacturing-poster.jpg` as a temporary local factory-photo cover. It is retained LBH manufacturing artwork, not a fetched thumbnail of the supplied APOWER video. The YouTube thumbnail fetch timed out; this limitation and the local cover substitution were disclosed to the user. Replace it with an APOWER cover when available.
- The centered red play control activates the unchanged `uGqOG4NfbZQ` privacy-enhanced YouTube embed only after a click. The YouTube fallback remains available. Provider playback itself depends on the user's network and was not claimed verified.
- Homepage CSS owns the player's relative positioning, full-size button/iframe and image clipping explicitly. Previously those base rules only loaded through the editorial template; visual QA caught that missing dependency. All new player styling stays scoped to the homepage welcome section.

Verification: all 181 unit/integration tests and 59 targeted browser checks passed, plus TypeScript, static production export and asset audit. New tests check CN/EN at 1440, 1024 and 390 px, final CTA order and centering, visible local image, full-size cover/button/iframe bounds, circular-corner clipping and unchanged video destinations/default players. Provider iframe requests are blocked in browser tests to isolate the local layout and activation contract from network availability. This is a local preview update; no GitHub push or public deployment is included.

## Partner logos and testimonial module — 2026-10-09

The user-approved design follows the supplied partner screenshot: a full-width light grey surface, centered heading, five desktop logo cells and three white testimonial cards. Existing bilingual APOWER wording, author names and original logo artwork remain unchanged; other homepage modules are outside this change.

- Scope the layout in `home-partners.css`: background #f8f9fb, centered 1200 px inner container, 40/60 px desktop heading and 145 px high logo cells. Cards use large 16:9 logo areas, left-aligned 14/28 px quotes and 20/30 px names. Flexible quote areas align the three author baselines without cutting text.
- Phones show 1.5 logo cells and stack the cards in one column. Quotes use 14/26 px and names 18/27 px. Desktop carousel controls overlay the logos on hover or keyboard focus; phone controls remain visible.
- The existing carousel implementation is unchanged: four-second autoplay, previous/next, pause, touch interaction and reduced-motion handling. The new section anchor is `#partners`.

Verification: 66 checks passed in the combined eight-file browser suite, including both locales at 1440, 1024 and 390 px, image loading, card geometry, author alignment, overflow, manual navigation, autoplay and keyboard focus. All 181 unit/integration tests, TypeScript, static production export and the asset audit passed (446 local files; zero errors). Desktop and phone screenshots were inspected. This is a local preview update only; no commit, GitHub push or public deployment is included.

## Partner carousel motion — 2026-10-09

The user approved restoring this module's source-derived motion without changing testimonial wording, images, colors or card layout. The live CN homepage could not be opened through web browsing; retained CN homepage HTML plus the publicly retrieved `/skinp/modules/ModuleSiteGalleryV2Giant/commonSiteGallery.js` provide parameter evidence. The partner heading and testimonial containers have no WOW entrance attributes in that retained HTML, so they remain static.

- Desktop gallery 720155361: `slideTime=4`, `slideSpeed=2`; the source desktop initializer converts speed to 2000 ms. Preserve five visible cells and add eased horizontal travel, previous-side buffers and atomic loop commits instead of instantaneous DOM reordering.
- Phone gallery 724116966: 1.5 centered slides, 1000 ms transition, coverflow rotate 0, stretch 55, depth 65, modifier 3, no slide shadows and 1200 px perspective. Three preceding loop buffers preserve the visible back-layer artwork across a commit.
- Real pointer dragging updates travel/depth under the finger. Short or cancelled drags snap back; a committed swipe advances one logo. Autoplay cannot move the gallery under a held pointer. Existing accessible manual navigation and explicit pause/resume remain; keyboard activation is never swallowed by drag-click suppression.
- Reduced motion keeps instant manual navigation and disables autoplay. Width changes settle pending travel into the new layout; transition-end commits have a timer fallback and cleanup so interrupted transitions do not lock controls.

Fresh verification: 181 unit/integration tests passed, TypeScript passed, production export passed (272 pages), and the asset audit passed (446 local files; zero errors). The combined ten-file browser run passed 82 of 84 checks. All 77 checks in the nine homepage/theme/APOWER files passed, including 11 new motion checks for real intermediate geometry, two-second/one-second travel, loop continuity, real touch dragging, held-pointer autoplay, keyboard resume, cancelled/short drags, resizing and reduced-motion changes.

Two unchanged older assertions in `tests/e2e/final-review.spec.ts` failed in that broader run and remain outside this change:

- `canonical Chinese OEM, Design and Quality retain their source opening layout and hover artwork` (line 73): its quality-page background assertion at line 92 expects #1a1a1a, while the existing approved palette renders #333232.
- `canonical Chinese desktop hero copy uses the full-width source text column` (line 109): it expects the title at x≤12, while the existing homepage layout places it at x=160 at 1440 px. Current desktop proportion checks pass with that layout.

Neither those regions nor their tests were altered to hide these failures. Read-only scoped review found no remaining critical/important issues; requested resize/cancelled-drag coverage was added. Local preview only; no commit, GitHub push or public deployment.

## Homepage mouse-hover restoration — 2026-10-09

The user reported that source mouse-hover effects were missing after carousel motion was restored. The live source page could not load during this inspection, so this repair uses retained canonical CN/EN homepage HTML and PageCss, rather than claiming a fresh whole-site pixel/interaction comparison. Current APOWER copy, approved palette and resting section dimensions remain intact.

- Home-only `home-hover.css` restores gallery layout 109 on partner logos and certificates: an inset white frame contracts from -10 px to 10 px over 500 ms, while a 50 px magnifier fades/rises into the center over 300 ms. The source hides these mouse-only overlays on phones; image activation remains available.
- Audience/contact buttons follow layout 109's 400 ms white-circle reveal and -45° arrow rotation. Manufacturing video layout 101 scales its play control to 1.4 over 600 ms. Product links receive layout 104's clipped 1.1 image zoom and 0/15/30 px shadow over 300 ms. Existing APOWER colors are retained, not source orange. Testimonials are not given invented card-lift effects.
- `HomeGalleryImage` provides a real native image preview, Escape/backdrop/close dismissal, body scroll restoration and focus return. Expanded image sizing overrides thumbnail styles. The selected image/label are snapshotted, preventing a pending carousel loop commit from replacing the open preview.
- Partner pointer handling permits swiping from logo buttons while excluding controls/dialogs; existing click suppression avoids opening a picture after a drag. Only visible desktop logos or the centered phone logo are in the Tab sequence, preventing browser-native scrolling of the clipped viewport. Loop buffers remain noninteractive. Reduced-motion users get immediate feedback without transitions.

Verification: all 16 new hover browser checks and all 11 partner motion checks passed together (27/27, two workers), including intermediate hover frames, mouse-leave restoration, unchanged dimensions, real touch gestures, image preview/focus restoration, offscreen Tab traversal and opening an image during movement. All 181 unit/integration tests passed in the final isolated run; TypeScript, production export, route integrity and the 446-file asset audit passed.

The broader eight-file browser run passed 75/76: `the back-layer logo survives the loop commit instead of disappearing at the left edge` in `home-partners-motion.spec.ts` had an intermittent position mismatch under four-worker load. It subsequently passed alone and in the 27-check two-worker run. This timing instability is recorded rather than reporting the broader run as fully green. Earlier build/test overlap caused temporary HTTP failures and integration timeouts; clean separated runs were used for the final evidence. The two previously recorded `final-review.spec.ts` source-calibration discrepancies were not changed or rerun in this repair.

Read-only review found two P2 issues (offscreen keyboard scrolling and mutable open-preview image), both reproduced with failing regressions and corrected. No remaining actionable code-review findings. Local preview remains at port 3001; no commit, GitHub push or public deployment.

## First-frame text alignment — 2026-10-09

The approved first-frame-only correction uses retained LBH slider geometry: CN has a centered 1700px container, heading at 17% of banner height plus 10px inner padding and list at 38%; EN has an 1800px container, heading at 11% plus 10px and list at 41%. At widths from 1280px, headings/subheadings retain 36px/54px type; CN list type is 18px/27px and EN is 16px/24px. The grid expands its heading row when longer APOWER copy wraps, so the list never overlaps it.

The approved APOWER artwork differs from the reference: products occupy the right half. Text is therefore constrained to the left 48% of the viewport, with balanced title wrapping to prevent short orphan lines. Between 768px and 1279px only this frame uses fluid 24–32px headings and 16px list type, avoiding a reproduced EN 1200px overflow without changing the banner/image dimensions. Phones retain CN 20px/30px and EN 14px/21px headings, reference-relative top/left padding, and separate artwork space below the copy. Images, text content, colors, product slides and other modules remain unchanged by this correction.

Regression tests first reproduced the incorrect wide-screen anchors, product-area overlap, EN 1200px overflow and CN desktop orphan line. Final scoped browser run passed 60/60 (32 new first-frame checks plus desktop, responsive and motion suites), including 13 widths from 320px to 2560px in both languages. Independent read-only review checked breakpoint pairs 767/768, 1199/1200 and 1279/1280 and normal entrance animation completion.

The broader six-suite browser run before balanced-title polish passed 86/87. Existing `home-partners-motion.spec.ts:110` (back-layer logo position across a phone carousel loop) repeated its previously recorded timing instability; its immediate isolated rerun passed 1/1. An overlapping unit/browser run timed out two route-coverage checks and the nested fresh-checkout reproducibility check; the final isolated `npm test` passed 181/181. TypeScript and the final production export/route checks passed; the asset audit passed with 446 local files. No commit, push or public deployment was performed; local preview remains on port 3001.
