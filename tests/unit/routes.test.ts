import { getAlternatePath } from "@/lib/routes";

it("switches a product detail to the same identifier in the other language", () => {
  expect(getAlternatePath("en", ["ProductDetail", "11906944.html"]))
    .toBe("/cn/ProductDetail/11906944.html");
  expect(getAlternatePath("cn", ["ProductDetail", "11906944.html"]))
    .toBe("/en/ProductDetail/11906944.html");
});

it("switches home routes and falls back to the alternate home for unknown content", () => {
  expect(getAlternatePath("en", [])).toBe("/cn");
  expect(getAlternatePath("cn", [])).toBe("/en");
  expect(getAlternatePath("en", ["missing-page"])).toBe("/cn");
});
