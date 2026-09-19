# APOWER 2025 color theme

Color reference: APOWER-空气力量科技G系列卖点梳理手册【 2025 】.pdf, 29 pages. Reference only; the PDF is not included in this repository.

The interface uses ink navy #050711, electric violet #8020ed, cobalt #4164dc, champagne #d6b386, white #f5f4ff and muted lavender #bcc0d4. These are UI adaptations of the manual's black/blue/purple backgrounds and white/gold typography, not changes to the site's brand content.

Only CSS colors were adapted. Existing photos, logos, copy, routes, components, font metrics, control sizes and interactions are retained. Light photo backgrounds keep dark readable foregrounds. Form errors and success notices retain distinct semantic colors.

`scripts/apower-colors.mjs` applies the same palette when regenerating the per-page source styles. Raw source captures and their expected original colors remain unchanged. To check retained source typography and button dimensions with the new palette, serve the static export on port 3001 and run `node scripts/check-source-styles.mjs --typography-only`. Original visual snapshots still represent the original LBH palette and are not a new-theme approval baseline.
