import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import * as renderer from "@/components/site/SectionRenderer";
import type { ContentBlock } from "@/content/schema";
import ContentPage from "@/app/[locale]/[...slug]/page";
import { sourceEditorialMedia } from "../fixtures/editorial-source-media";

afterEach(cleanup);

const image = { src: "/media/example.webp", alt: "Laboratory inspection" };
const blocks: ContentBlock[] = [
  { type: "hero", title: "Research", subtitle: "Built around people", image, actions: [{ label: "Explore", href: "/en/ProductIndex" }] },
  { type: "rich-text", heading: "Testing", paragraphs: ["Every component is tested."], items: ["Safety", "Performance"] },
  { type: "media", image, caption: "Inspection equipment", videoUrl: "/media/tour.mp4" },
  { type: "split", heading: "Our workshop", paragraphs: ["From components to finished products."], imagePosition: "left", image, actions: [{ label: "Visit", href: "/en/Factory_tour" }] },
  { type: "stats", items: [{ value: "8 +", label: "Production lines" }] },
  { type: "gallery", heading: "Certificates", images: [image, { src: "/media/certificate.webp", alt: "Quality certificate" }] },
  { type: "timeline", items: [{ year: "2020", title: "Foundation", description: "The company begins." }, { year: "2026", title: "Expansion", description: "Our next chapter." }] },
  { type: "cta", heading: "Start your project", description: "Talk with our team.", actions: [{ label: "Contact", href: "/en/Contact_Us" }] },
];

it("renders all eight block types in order with usable media, lists and actions", () => {
  expect(renderer).toHaveProperty("renderBlock", expect.any(Function));
  const { container } = render(<>{blocks.map((block, index) => <div key={index}>{renderer.renderBlock(block)}</div>)}</>);
  expect([...container.children].map((node) => node.querySelector("h2, figcaption, dt")?.textContent)).toEqual([
    "Research", "Testing", "Inspection equipment", "Our workshop", "Production lines", "Certificates", "Foundation", "Start your project",
  ]);
  expect(screen.getByText("Every component is tested.")).toBeVisible();
  expect(screen.getByRole("definition")).toHaveTextContent("8 +");
  expect(screen.getByText("Our next chapter.")).toBeVisible();
  expect(screen.getByRole("link", { name: "Visit" })).toHaveAttribute("href", "/en/Factory_tour");
  expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/en/Contact_Us");
  expect(container.querySelector("video")).toHaveAttribute("controls");
  expect(container.querySelector("video")).toHaveAttribute("poster", image.src);
  expect(within(screen.getByRole("heading", { name: "Testing" }).closest("section")!).getByRole("list")).toHaveTextContent("SafetyPerformance");
});

it("shows the company banner once and retains source section order", async () => {
  render(await ContentPage({ params: Promise.resolve({ locale: "en", slug: ["Company_Introduction"] }) }));
  const main = screen.getByRole("main");
  const title = within(main).getByRole("heading", { name: "Company Introduction", level: 1 });
  expect(title.closest("header")).not.toBeNull();
  expect(main).toHaveClass("editorial-page");
  const headings = within(main).getAllByRole("heading").map((node) => node.textContent);
  expect(headings.indexOf("So how to define LBH")).toBeLessThan(headings.indexOf("LBH Product Certification"));
  expect(headings.indexOf("LBH Product Certification")).toBeLessThan(headings.indexOf("How are we different?"));
  expect(headings.indexOf("How are we different?")).toBeLessThan(headings.indexOf("Our Mission"));
  expect(headings.indexOf("Our Mission")).toBeLessThan(headings.indexOf("Listen to the Voice of the Customer"));
});

it("identifies an authored Chinese summary without implying source-language verification", async () => {
  render(await ContentPage({ params: Promise.resolve({ locale: "cn", slug: ["Contract_manufacturing_service"] }) }));
  expect(screen.getByRole("note")).toHaveTextContent("本页为英文资料的中文摘要，非已核验的中文原文。");
  expect(screen.getByRole("heading", { name: "代工服务", level: 1 })).toBeVisible();
  expect(screen.getByText(/2,000 件/)).toBeVisible();
});

it("does not add a summary label or fabricated technical detail to sparse English pages", async () => {
  render(await ContentPage({ params: Promise.resolve({ locale: "en", slug: ["Ventilation_duct_technology"] }) }));
  expect(screen.queryByRole("note")).not.toBeInTheDocument();
  expect(screen.getAllByRole("heading")).toHaveLength(1);
  expect(screen.getByRole("heading", { name: "Air Duct Technology", level: 1 })).toBeVisible();
});

it("presents seven chronological milestones without repeating the year headings", async () => {
  render(await ContentPage({ params: Promise.resolve({ locale: "en", slug: ["Milestone"] }) }));
  const items = within(screen.getByRole("list")).getAllByRole("listitem");
  expect(items).toHaveLength(7);
  expect(items[0]).toHaveTextContent("2020");
  expect(items[6]).toHaveTextContent("2026");
  expect(screen.getAllByRole("heading")).toHaveLength(8);
});

it.each(["en", "cn"] as const)("makes all six certificate scans accessible in %s", async (locale) => {
  render(await ContentPage({ params: Promise.resolve({ locale, slug: ["Certification_certificate"] }) }));
  expect(screen.getAllByRole("img", { name: locale === "cn" ? /^产品认证证书 \d$/ : /^Product certificate \d$/ })).toHaveLength(6);
});

for (const locale of ["en", "cn"] as const) {
  it.each(Object.entries(sourceEditorialMedia))(`retains the unique captured %s media once in ${locale}`, async (route, sources) => {
    const { container } = render(await ContentPage({ params: Promise.resolve({ locale, slug: [route] }) }));
    for (const source of sources) expect(container.querySelectorAll(`img[src="${source}"]`), source).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
}

it("shows factory assembly and motor images before statistics and browses the assembly variants", async () => {
  const { container } = render(await ContentPage({ params: Promise.resolve({ locale: "en", slug: ["Factory_tour"] }) }));
  const assembly = screen.getByRole("region", { name: "Assembly Site" });
  const motor = screen.getByRole("region", { name: "Motor Factory" });
  expect(within(assembly).getByRole("img")).toHaveAttribute("src", sourceEditorialMedia.Factory_tour[0]);
  expect(within(motor).getByRole("img")).toHaveAttribute("src", sourceEditorialMedia.Factory_tour[3]);
  expect(assembly.compareDocumentPosition(container.querySelector(".stats-grid")!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  fireEvent.click(within(assembly).getByRole("button", { name: "Next image" }));
  expect(within(assembly).getByRole("img")).toHaveAttribute("src", sourceEditorialMedia.Factory_tour[1]);
  fireEvent.click(within(assembly).getByRole("button", { name: "Previous image" }));
  expect(within(assembly).getByRole("img")).toHaveAttribute("src", sourceEditorialMedia.Factory_tour[0]);
});

it("keeps the laboratory's small test icons beside their labels instead of treating the extracted icon as a hero", async () => {
  const { container } = render(await ContentPage({ params: Promise.resolve({ locale: "en", slug: ["Product_Laboratory"] }) }));
  const icons = container.querySelectorAll('img[src="/media/9316b812398934d28d817fddee6da92989587072b7cba64db2a4852ae4cc2e8b.png"]');
  expect(icons).toHaveLength(4);
  expect(icons[0].closest(".editorial-test-item")).toHaveTextContent("New Design Concept Flexibility Test");
});
