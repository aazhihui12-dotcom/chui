import { renderToStaticMarkup } from "react-dom/server";
import { getAlternatePath } from "@/lib/routes";
import { getPage } from "@/lib/content";
import { ContactTemplate } from "@/components/templates/ContactTemplate";
import { languageAlternates } from "@/lib/metadata";

it("pairs languages by actual source article identities, not equal numeric IDs", () => {
  expect(getAlternatePath("en", ["NewsDetail", "6860206.html"])).toBe("/cn/NewsDetail/6809208.html");
  expect(getAlternatePath("cn", ["NewsDetail", "6809208.html"])).toBe("/en/NewsDetail/6860206.html");
  const page = getPage("cn", ["NewsDetail", "6809208.html"]);
  expect(page?.title).toBe("你们的供货能力如何？");
  expect(page?.description).toBe("日均产能5000台，一年出货150万至200万台");
  expect(languageAlternates("/NewsDetail/6860206.html")["zh-CN"]).toMatch(/\/cn\/NewsDetail\/6809208.html\/$/);
});

it("retains old Chinese links as compatibility entry points to the same article", () => {
  expect(getPage("cn", ["NewsDetail", "6860206.html"])?.legacyPath).toBe("/NewsDetail/6809208.html");
});

it("renders the captured Chinese Contact headings verbatim", () => {
  const html = renderToStaticMarkup(<ContactTemplate page={getPage("cn", ["Contact_Us"])!} />);
  expect(html).toContain("让我们来承接您新的个护家电项目吧！");
  expect(html).toContain("中国办事处");
});
