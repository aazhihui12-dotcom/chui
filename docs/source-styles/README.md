# Source-measured typography and controls

Scope: font families, sizes, weights, line heights, letter spacing, text colors,
and CTA colors, dimensions, borders and corners. English and Chinese routes use
their own source measurements at 1440px and 390px. Existing page structure and
inquiry submission adapters are preserved; email delivery remains unconfigured.

## Evidence and regeneration

- `*-1440.json` and `*-390.json`: read-only measurements of all 194 canonical
  source pages (388 route/viewport combinations), including hidden scroll-reveal
  text. No source forms are submitted.
- `mapping.json`: text and control correspondence, expected metrics, and unmatched
  text. Semantic matches are used for translated source placeholders and split
  headings. This is not proof that all content or layout is identical.
- `verification.json`: browser checks of the exported local pages. Latest run:
  388 combinations, 50,587 property comparisons, no mismatches or horizontal overflow.
- `node scripts/capture-source-styles.mjs`: resumes missing source captures.
  `--refresh-general` refreshes non-detail pages; `--refresh-news` refreshes lists.
- `npm run build`: exports Next.js, regenerates route-scoped CSS, checks all routes.
- With the static preview at `http://127.0.0.1:3001`, run
  `node scripts/check-source-styles.mjs` to repeat browser verification.

Page styles are scoped to `data-source-page`, including legacy Chinese aliases.
Generated selectors depend on the exported DOM; regenerate them after changing
templates. The build fails if a source capture is missing. Do not edit generated
CSS by hand. Text not matched to a source node is explicitly listed, not silently
counted as verified. Added UI without a source counterpart retains its own styles.

## Verification and known limitations

- Production build and route integrity: 194 canonical pages, 97 legacy redirects.
- Unit/integration suite: 170 passed, including fresh-checkout reproducibility.
- Browser suite: 90 functional/visual checks passed; 2 accessibility checks fail on color contrast after
  restoring original colors. Those checks remain enabled and were not weakened.
- Review regressions cover active product-tab colors and product-card hover color;
  captured resting colors do not override interactive state changes.
- 16 local visual regression snapshots refreshed for the intentional font/control
  changes. They check local regression, not source screenshot pixel identity.
- Asset audit: 427 local files; zero errors; 4 previously unavailable source assets
  remain excluded by the existing audit.

The source's gold/white buttons and some light/orange text fail WCAG AA contrast.
Their source colors are preserved to honor the requested visual fidelity. Do not
claim WCAG AA compliance or pixel-perfect whole-site identity from these results.
System-font rendering may differ across operating systems, as on the source site.
