# Existing-server speed optimization

User request: optimize the existing website server and measure achievable speed, without moving to COS/CDN. This is a corrective performance pass, not a visual redesign.

## Constraints

Preserve original image bytes, Inter Medium, Han glyph shapes/metrics, layouts, product/news content, CMS persistence, TLS, DNS, and current server/package. No paid services or changes to GitHub Pages main. Stage a new release and retain rollback.

## Evidence and approach

Baseline Chrome direct to production: English desktop cold resource completion 6.48s / warm 0.80s, hero LCP 0.544s. Chinese 390x900 cold 21.23s / warm 1.48s: preview starts downloading 3.27MB with only 44% visible. Both locales fetch a 377,192-byte Han font; English only needs symbols and 中文. Language-switch imports getPage -> all page/product/article content, contributing a 723KB uncompressed client chunk. CPU/memory are idle; gzip already works.

Server-only gzip changes would duplicate working compression. Paid CDN is outside the request. Selected correction: (1) identical-glyph Han UI/body WOFF2 subsets with disjoint unicode-range; (2) small static route existence index instead of shipping page bodies to LanguageSwitch; (3) require 50% visibility before background playback. Keep click-to-open, reduced motion, manual pause and no-observer fallback. No forced delay or lower image quality.

## Acceptance

Failing regression tests precede each fix. Full tests, type check, production build, Chrome desktop/mobile tests (including 390x900 CN), font metric/coverage checks, language correspondence and cache/security checks must pass. Measure first paint/LCP separately from all-resource network-idle and cached visits. Report ranges from multiple sequential cold/warm samples, not a universal best-case promise. Safe staged deployment must preserve CMS files and environment.
