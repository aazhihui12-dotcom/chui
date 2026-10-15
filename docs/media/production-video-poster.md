# Product manufacturing and factory tour video covers

Only the covers of the Chinese and English `Product_manufacturing` and
`Factory_tour` pages are replaced. The original video ID, player activation,
copy, module dimensions, corners and other pages' covers remain unchanged.

Both pages also fix the existing image-fit problem: the old
player rendered its 1280 × 720 image inside a smaller frame with native button
padding, clipping the picture and pushing its play icon below the frame.
Page-scoped CSS now fills the existing 16:9 frame, restores the visible centered
play control, and adds a subtle top scrim for the existing white label. It does
not affect any other page's player. The factory tour keeps its existing
split-column player rather than adopting the manufacturing page's width.

## Source and selection

- Video: [APOWER TECH End-to-End Production and Assembly Process 2.0](https://www.youtube.com/watch?v=bx1R2NQPTxw)
- Publisher shown by the video metadata: APOWER.
- Source rendition: 1920 × 1080 H.264, YouTube format 137.
- Manufacturing selected position: 00:40, an orderly row of white hair dryers.
- Factory tour selected position: 00:30, a wide assembly-workshop aisle.
- Source frames were extracted and visually inspected at full resolution.
- The original shared `/media/manufacturing-poster.jpg` was retained
  factory artwork, not a frame of this supplied APOWER video. It remains
  unchanged for other players.

The source transfer stopped before the complete video was downloaded;
the selected frames decoded successfully from the available portion. The
video is not copied into the website or repository. Playback continues
to use the unchanged privacy-enhanced YouTube embed.

## Output

- Asset: `public/media/apower/production-video-poster.webp`.
- Asset: `public/media/apower/factory-tour-video-poster.webp`.
- Dimensions: 1920 × 1080 (16:9), with no upscaling or crop.
- Encoding: WebP quality 94, compression level 6.
- No generated objects, generative retouching, equipment changes, branding
  changes or replacement factory scenery. The image-generation workflow
  was considered; the actual high-resolution frame was sufficient.

Extraction and encoding, given an authorized local source copy:

```sh
ffmpeg -ss 40 -i apower-production-1080p.mp4 -frames:v 1 frame-40s.png
ffmpeg -i frame-40s.png -frames:v 1 -c:v libwebp -quality 94 \
  -compression_level 6 production-video-poster.webp
ffmpeg -ss 30 -i apower-production-1080p.mp4 -frames:v 1 frame-30s.png
ffmpeg -i frame-30s.png -frames:v 1 -c:v libwebp -quality 94 \
  -compression_level 6 factory-tour-video-poster.webp
```
