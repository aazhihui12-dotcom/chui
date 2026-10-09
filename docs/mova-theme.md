# MOVA-inspired local theme

Approved scope: colors and hero backdrops only; preserve content, typography,
layout and interactions. Local preview only; no GitHub push or online publish.

Palette sampled from https://www.mova.sg/: white `#ffffff`, charcoal `#333232`,
black `#000000`, warm gray `#f2f1ed`, champagne accent `#c9b498`.
Champagne text is used on dark surfaces, not as small text on white.
Legacy `--brand-navy` and `--brand-blue` token names are retained for template
compatibility. Generated route-level buttons consume shared variables.

## Hero assets

- `public/media/home-desktop-charcoal.webp`: 1920 × 800.
- `public/media/home-mobile-charcoal.webp`: 1308 × 1816.

Edited using built-in image_gen, one request per original deep-blue asset.
Generated PNGs were normalized to existing dimensions and converted to WebP
with Sharp (quality 92). Original deep-blue files are retained outside the
published directory in `assets/theme-archive/`. Product blue
accents and overall arrangement are visually preserved, but generated details
are not pixel-identical to the source.

### Exact image-generation prompts

Shared prompt:

Use case: precise-object-edit. Asset type: photorealistic LBH hair appliance website hero. Input image 1 is the only edit target. Make an exceptionally strict localized recoloring edit. Change ONLY the blue studio background and the blue cylindrical display podium surfaces/rims to a neutral charcoal palette, keeping the original soft gradient structure: upper/mid background around #333232, darker lower areas; podium bodies dark charcoal with existing highlights and restrained warm gray/champagne metallic rims near #c9b498. Muted luxury black/warm gray/champagne appearance. Preserve EVERY appliance and attachment unchanged: exact original black, silver and vibrant blue colors, silhouettes, small details, shapes, sizes, positions, brightness, highlights, material, lighting, cables and orientation. The blue on the appliances and accessories MUST stay blue. No text, no logos, no added objects. No layout changes, no cropping, no rescaling/repositioning subjects. Preserve clean original rendering and all existing empty space.

Desktop suffix:

Desktop output: preserve exact ultra-wide 1920x800 canvas (12:5 aspect ratio), entire original framing, and empty LEFT side. Products stay exactly where they are. Change only background and podium colors.

Mobile suffix:

Mobile output: preserve exact portrait 1308x1816 canvas (327:454 aspect ratio), entire original framing, and empty UPPER 60% area. Product display remains anchored at the bottom. Products stay exactly where they are. Change only background and podium colors.
