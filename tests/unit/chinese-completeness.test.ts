import { pages } from "@/content/pages";
import expected from "../fixtures/chinese-source-content.json";
import { homeCopy } from "@/content/home";

it("serves canonical Chinese editorial content instead of an English-derived summary", () => {
  for (const id of ["Company_Introduction", "Contract_manufacturing_service", "Factory_tour", "PinZhiGuanLi", "Design_and_Development"]) {
    const page = pages.find(page => page.locale === "cn" && page.legacyPath === `/${id}`)!;
    expect(page.provenance.sourceUrl).toBe(`https://www.lbhappliances.com/cn/${id}`);
    expect(page.provenance.languageVerified).toBe(true);
    expect(page.provenance.coverage).toBe("full");
    expect(page.blocks.length).toBeGreaterThan(15);
  }
});
it("uses full captured Chinese home copy rather than abbreviated translations", () => {
  const copy = JSON.stringify(homeCopy.cn);
  for (const index of [1, 2, 3, 4, 5, 6, 7, 8, 14, 15, 16, 17, 18, 19, 20, 21, 22, 29, 30, 31, 32, 33, 34, 35, 36, 37, 41]) {
    expect(copy).toContain(expected["/"].paragraphs[index]);
  }
});
it("retains every canonical Chinese paragraph on all 33 available unique general routes", () => {
  expect(Object.keys(expected)).toHaveLength(33);
  for (const [route, reference] of Object.entries(expected)) {
    const page = pages.find(page => page.locale === "cn" && page.legacyPath === route)!;
    expect(page.provenance).toMatchObject({ sourceUrl: reference.sourceUrl, languageVerified: true, translation: "none", coverage: "full" });
    const text = JSON.stringify(page.blocks).replace(/\s/g, "");
    for (const paragraph of reference.paragraphs) expect(text, `${route}: ${paragraph}`).toContain(paragraph.replace(/\s/g, ""));
  }
});
