# Product overview cover and mobile layout correction

Scope: `/cn/ProductIndex/` and `/en/ProductIndex/`. The existing text, product
data, overview video ID, filtering and product links are unchanged.

## Reproduced causes

- The desktop 34px uppercase heading outranked the mobile font rule, while
  the mobile banner retained a fixed 138px height. At 393px the English
  heading extended to y=214 but the banner ended at y=188.
- The absolute filter started above the catalog and overlapped the heading.
- The mobile 25px section-title rule had lower specificity than the desktop
  32px rule, so it never applied.
- The overview still used the shared legacy factory poster. Its image kept
  a 720px intrinsic height inside a 194px player, stretching and clipping
  the picture and moving the play control out of view.

The compact layout now uses content-driven banner height, 22–24px phone
titles / 28px compact-tablet titles, normal capitalization and an in-flow
filter. Catalog/proof spacing is reduced. Desktop heading size and layout
are preserved. The overview image fills its existing 16:9 frame without
distortion, with a centered rectangular play control. Its image already
contains the original APOWER logo, so the duplicate text overlay is hidden
only in this player.

At 701–900px, catalog side padding reserves space for the larger carousel
arrows; at 700px and below, the existing inset phone arrows are retained.

## Source asset

- Supplied video: <https://www.youtube.com/watch?v=uGqOG4NfbZQ>.
- Metadata title: `APOWER Manufacturing Factory Full Link Promotional Video [Pure Version]`.
- Publisher: `APOWER_OFFICIAL`; video length: 195 seconds.
- Rendition: YouTube format 137, H.264, 1920 × 1080.
- Selected frame: 00:55, automated circuit-board manufacturing equipment.
- Output: `public/media/apower/overview-video-poster.webp`, 1920 × 1080,
  WebP quality 94, compression level 6; no upscaling or crop.
- Source download stopped with HTTP 403 after a usable portion; the selected
  frame decoded successfully and was visually inspected. The partial video
  is not shipped. Playback remains the same YouTube embed.
- No AI-generated scenery, generative enhancement or branding changes.

```sh
ffmpeg -ss 55 -i apower-overview-1080p.mp4 -frames:v 1 overview-frame-55s.png
ffmpeg -i overview-frame-55s.png -frames:v 1 -c:v libwebp -quality 94 \
  -compression_level 6 overview-video-poster.webp
```
