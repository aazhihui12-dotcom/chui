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
it("uses the supplied APOWER home copy while retaining the captured source separately", () => {
  const copy = JSON.stringify(homeCopy.cn);
  expect(copy).toContain('APOWER');
  expect(copy).not.toMatch(/LBH|LHB/);
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
