import { renderToStaticMarkup } from "react-dom/server";
import LocaleLayout from "@/app/[locale]/layout";
it.each([["cn", "zh-CN"], ["en", "en"]])("renders the %s document with its language at the static root", async (locale, language) => {
  const html = renderToStaticMarkup(await LocaleLayout({ children: <p>Page</p>, params: Promise.resolve({ locale }) }));
  expect(html).toMatch(new RegExp(`<html lang="${language}">`));
  expect(html.match(/<html/g)).toHaveLength(1);
});
