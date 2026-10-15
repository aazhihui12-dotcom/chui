# Homepage manufacturing video brand correction

The Chinese and English homepage manufacturing module previously used a
retained LBH MP4 as both its background preview and the modal's full video.
Changing only its poster would not remove the other brand after playback.

Both playback sources now use APOWER material:

- Full video: the supplied APOWER factory video,
  <https://www.youtube.com/watch?v=bx1R2NQPTxw>.
- Modal: privacy-enhanced YouTube iframe, created only after activation,
  plus an explicit link to the same full video if embedding is unavailable.
- Background: `public/media/apower/home-manufacturing-preview.mp4`, an
  eight-second silent excerpt from 00:30–00:38 of that video, not the
  retained LBH local clip. Source metadata and partial-source availability
  are documented in `production-video-poster.md`.
- Poster: the already reviewed real 00:30 workshop frame,
  `/media/apower/factory-tour-video-poster.webp` (1920 × 1080).

The excerpt uses H.264, 1280 × 720, 25 fps, yuv420p and MP4 faststart for
inline mobile playback. No generated or retouched factory imagery is used.
The layout, figures, invisible background pause/resume control, muted loop,
reduced-motion preference, dialog close and focus restoration remain.
Escape closes while focus is in the surrounding page/dialog. A cross-origin
player cannot forward its keyboard events to the page; after its controls,
Tab reaches an explicit close button that becomes visible on focus, then
Enter closes and restores focus. The top close button is always available.
Other homepage modules and pages are unchanged.

The now-unused LBH MP4 and its opening poster are removed from the published
asset collection; their prior versions remain recoverable in Git history.

Encoding from the available authorized local source:

```sh
ffmpeg -ss 30 -i apower-production-1080p.mp4 -t 8 -an \
  -vf scale=1280:720 -r 25 -c:v libx264 -preset medium -crf 23 \
  -pix_fmt yuv420p -movflags +faststart home-manufacturing-preview.mp4
```
