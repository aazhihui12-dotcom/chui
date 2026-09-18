import { renderToStaticMarkup } from "react-dom/server";
import RootLayout from "@/app/(entry)/layout";

it("declares the LBH document shell", () => {
  const html = renderToStaticMarkup(
    <RootLayout>
      <main>content</main>
    </RootLayout>,
  );

  expect(html).toContain('<html lang="en">');
  expect(html).toContain("<main>content</main>");
});
