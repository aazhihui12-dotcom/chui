# APOWER 2025 color theme

Color reference: APOWER-空气力量科技G系列卖点梳理手册【 2025 】.pdf, 29 pages. Reference only; the PDF is not included in this repository.

The approved revision uses white #ffffff and light neutral #f4f3f7 for product, editorial and form surfaces; charcoal #171820 for navigation, footer and dark feature sections; technology blue #165dcc for primary actions; and light blue #9fc5ff for accents on dark surfaces. Text is charcoal #25242d or muted gray #666570 on light surfaces, white or #c5c5d0 on dark surfaces. Large gold headings and competing solid blue secondary actions are removed. Secondary actions use transparent backgrounds and inset blue strokes without changing their dimensions. These are UI adaptations of the manual's visual identity, not changes to the site's brand content.

Only CSS colors were adapted. Existing photos, logos, copy, routes, components, font metrics, control sizes and interactions are retained. Light photo backgrounds keep dark readable foregrounds. Form errors and success notices retain distinct semantic colors.

`scripts/apower-colors.mjs` applies the same palette when regenerating the per-page source styles. Raw source captures and their expected original colors remain unchanged. To check retained source typography and button dimensions with the new palette, serve the static export on port 3001 and run `node scripts/check-source-styles.mjs --typography-only`. Original visual snapshots still represent the original LBH palette and are not a new-theme approval baseline.
