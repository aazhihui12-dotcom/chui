import type { Page } from "@playwright/test";

// Hidden responsive alternatives and inactive carousel/tab images are not
// displayed. Every displayed image, including below the fold, must decode.
// No broken-image exceptions are allowed for the local representative routes.
export async function decodedImageFailures(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    await document.fonts.ready;
    const displayed = [...document.images].filter((image) => image.getClientRects().length > 0 && getComputedStyle(image).visibility !== "hidden");
    const failures = await Promise.all(displayed.map(async (image) => {
      image.loading = "eager";
      try {
        await image.decode();
        return image.naturalWidth > 0 && image.naturalHeight > 0 ? null : image.currentSrc || image.src;
      } catch {
        return image.currentSrc || image.src;
      }
    }));
    return failures.filter((source): source is string => source !== null);
  });
}
