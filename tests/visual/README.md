# Visual verification

- `reference/`: live source-site screenshots, captured at the URLs and time in `reference/capture.json`. Reproduce with `node tests/visual/capture-reference.mjs`.
- `current/`: current Next.js screenshots at 1440×1200 and 390×844.
- `baseline/`: reviewed local regression snapshots. These detect unintended local changes; they are not a pixel-diff assertion against the source.

Run `NEXT_PUBLIC_SITE_URL=https://lbh-appliances-bilingual.gentle-slug-7609.chatgpt.site npm run build`, then `PLAYWRIGHT_STATIC=1 npx playwright test --project=chromium` to exercise the exported production site, including `.html` directory routes. `npm start` serves `out` at the URL printed by the static server; add `-- -p 3001` to select port 3001.

Source comparisons restored the logo/header dimensions, mobile hero artwork and compact typography, product heading band, dark product-detail surface/default feature pane, company artwork/card overlap, article banner/share/adjacent navigation, contact checkmark rows and inline shared inquiry form, five-column footer, manufacturing video/stat overlay, and mobile bottom actions. Orange text/background shades are slightly darkened where the source shade failed automated WCAG contrast checks.

The source is dynamic: videos, counters, font loading, carousel position, and failed lazy media can change its screenshots. Its Chinese product detail `/cn/ProductDetail/11906921.html` currently shows a missing-product message; the local site intentionally retains the approved Chinese translation of the captured English product. Automated local accessibility checks do not certify all WCAG requirements or prove pixel identity.

Review round 1 adds measured mobile geometry for the compact article/share disclosure, source-proportioned ProductIndex carousel and off-flow filter disclosure, fixed product inquiry/graphic-detail link, 520px Chinese home hero, and separate white Company Introduction heading section. Background video has a keyboard-accessible pause/resume control in addition to reduced-motion support. Every displayed image must decode with nonzero natural dimensions; hidden responsive alternatives/inactive panels are not displayed images, and there are no broken-image allowlist exceptions. A deliberately broken displayed-image test proves the guard reports the failed source.

Additional captured asset: `public/media/home-mobile-source.webp` is from `https://gcdn.meidianbang.cn/comdata/115577/202604/20260401111042244308.webp`, discovered in the live mobile hero's computed background. `manufacturing-opening.webp` is the first frame of the already captured local manufacturing video. The header/footer logo is the captured `20260312094632d28c7d.webp` asset, restored from the source cache.
