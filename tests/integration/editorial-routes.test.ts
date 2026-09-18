import { renderToStaticMarkup } from "react-dom/server";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { expect, it } from "vitest";
import { getPage } from "@/lib/content";
import ContentPage, { generateMetadata, generateStaticParams } from "@/app/[locale]/[...slug]/page";

const expectedEditorialPaths = [
  "Company_Introduction", "Lead_the_team", "Factory_tour", "Milestone", "Certification_certificate",
  "Sustainable_Development", "Product_Laboratory", "Exclusive_sale", "Contract_manufacturing_service",
  "PinZhiGuanLi", "Design_and_Development", "Order_Management", "Product_manufacturing",
  "Product_Warranty_and_After-Sales_Service", "Ventilation_duct_technology", "We_are_here_to_offer_assistance",
];

it.each(expectedEditorialPaths)("exports, dispatches and preserves metadata for /%s in both locales", async (path) => {
  for (const locale of ["en", "cn"] as const) {
    const slug = path.split("/");
    const page = getPage(locale, slug);
    expect(page).toBeDefined();
    expect(generateStaticParams()).toContainEqual({ locale, slug });
    const params = Promise.resolve({ locale, slug });
    expect(await generateMetadata({ params })).toMatchObject({ title: page!.seo.title, description: page!.seo.description });
    const html = renderToStaticMarkup(await ContentPage({ params }));
    expect(html).toContain('class="editorial-page');
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).not.toContain("undefined");
  }
});

it("rejects a newly added ContentBlock member at the renderer during type checking", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "lbh-editorial-types-"));
  try {
    const root = process.cwd();
    writeFileSync(path.join(directory, "schema.ts"), readFileSync("content/schema.ts", "utf8").replace("export type ContentBlock =", 'export type ContentBlock = { type: "new-unhandled-block" } |'));
    writeFileSync(path.join(directory, "tsconfig.json"), JSON.stringify({
      extends: path.join(root, "tsconfig.json"),
      compilerOptions: { incremental: false, types: [], paths: { "@/content/schema": [path.join(directory, "schema.ts")], "@/*": [path.join(root, "*")] } },
      include: [path.join(root, "components/site/SectionRenderer.tsx")],
    }));
    const result = spawnSync(process.execPath, [path.join(root, "node_modules/typescript/bin/tsc"), "--project", path.join(directory, "tsconfig.json"), "--noEmit"], { encoding: "utf8" });
    expect(result.stdout).toMatch(/SectionRenderer\.tsx[^\n]*never/);
    expect(result.status).not.toBe(0);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}, 20000);
