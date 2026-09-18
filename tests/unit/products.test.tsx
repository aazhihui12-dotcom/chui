import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { productStaticParams } from "@/lib/content";
import { products, categories } from "@/content/products";
import { pages } from "@/content/pages";
import { ProductDetailTemplate } from "@/components/templates/ProductDetailTemplate";
import { ProductIndexTemplate } from "@/components/templates/ProductIndexTemplate";
import { ProductCategoryTemplate } from "@/components/templates/ProductCategoryTemplate";
import ContentPage, { generateStaticParams } from "@/app/[locale]/[...slug]/page";

afterEach(cleanup);

describe("product route coverage", () => {
  it("exports both locales for the overview, five categories and 24 models only", () => {
    const routes = productStaticParams();
    expect(routes).toHaveLength(60);
    expect(routes).toContainEqual({ locale: "en", slug: ["ProductDetail", "11906944.html"] });
    expect(routes).toContainEqual({ locale: "cn", slug: ["Product", "682975.html"] });
    expect(routes).toContainEqual({ locale: "cn", slug: ["ProductIndex"] });
    expect(new Set(routes.map(({ locale, slug }) => `${locale}/${slug.join("/")}`)).size).toBe(60);
    expect(routes.filter(({ slug }) => slug[0] === "ProductDetail")).toHaveLength(48);
  });
});

describe("product pages", () => {
  it("renders canonical Chinese overview details without abridging customization and factory text", () => {
    render(<ProductIndexTemplate page={pages.find(page => page.kind === "product-index" && page.locale === "cn")!} />);
    expect(screen.getByText("选择环保包装方案，体现您对可持续发展的承诺，并强化您的品牌形象。")).toBeVisible();
    expect(screen.getByText(/我们对品质的承诺不仅体现在设计上/)).toBeVisible();
  });
  it("shows only captured product gallery photos, without loading graphics or feature posters", () => {
    render(<ProductDetailTemplate product={products[0]} locale="en" />);
    expect(screen.getAllByRole("button", { name: /^View image \d+ of LBH-3228$/ })).toHaveLength(4);
  });

  it("renders model and source-ordered specifications", () => {
    render(<ProductDetailTemplate product={products[0]} locale="en" />);
    expect(screen.getByRole("heading", { name: "LBH-3228", level: 1 })).toBeVisible();
    expect(within(screen.getByRole("table")).getByText(/100-120V\/220-240V/)).toBeVisible();
    const rows = within(screen.getByRole("table", { name: "LBH-3228 Parameters" })).getAllByRole("row");
    expect(rows.slice(0, 3).map((row) => row.textContent)).toEqual(["ModelLBH-3228", "Voltage100-120V/220-240V, 50/60Hz", "Wattage86W"]);
  });

  it("switches thumbnails and restores focus after closing the enlarged image", () => {
    render(<ProductDetailTemplate product={products[0]} locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "View image 2 of LBH-3228" }));
    const enlarge = screen.getByRole("button", { name: "Enlarge LBH-3228 image" });
    expect(within(enlarge).getByRole("img")).toHaveAttribute("src", "/media/fcc94b06b588d10b188c5eb7a8bedfe6ce21fc6097ff78aa2a453114ecbf61b6.png");
    act(() => enlarge.focus());
    fireEvent.click(enlarge);
    expect(screen.getByRole("dialog", { name: "LBH-3228 gallery" })).toBeVisible();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(enlarge).toHaveFocus();
  });

  it("offers keyboard tabs and honest empty accessory content", () => {
    render(<ProductDetailTemplate product={products[0]} locale="en" />);
    fireEvent.keyDown(screen.getByRole("tab", { name: "Parameters" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Product Features" })).toHaveAttribute("aria-selected", "true");
    expect(within(screen.getByRole("tabpanel")).getAllByRole("img")).toHaveLength(3);
    fireEvent.keyDown(screen.getByRole("tab", { name: "Product Features" }), { key: "End" });
    expect(screen.getByRole("tab", { name: "Optional Accessories" })).toHaveFocus();
    expect(screen.getByText("Contact us for available accessories and customization options.")).toBeVisible();
  });

  it("provides localized controls and passes model context through the inquiry event", () => {
    render(<ProductDetailTemplate product={products[0]} locale="cn" />);
    let detail: unknown;
    const listener = (event: Event) => { detail = (event as CustomEvent).detail; event.preventDefault(); };
    window.addEventListener("lbh:inquiry", listener);
    try {
      fireEvent.click(screen.getByRole("link", { name: "立即询价" }));
      expect(detail).toEqual({ locale: "cn", productId: "11906944", model: "LBH-3228", title: "LBH-3228 产品询盘" });
    } finally { window.removeEventListener("lbh:inquiry", listener); }
    expect(screen.getByRole("tab", { name: "规格参数" })).toBeVisible();
    expect(screen.getByRole("link", { name: "立即询价" })).toHaveAttribute("href", "/cn/Contact_Us?product=LBH-3228");
  });

  it("filters the full overview by category and restores all models", () => {
    render(<ProductIndexTemplate page={pages.find((page) => page.locale === "en" && page.kind === "product-index")!} />);
    const grid = () => within(screen.getByRole("region", { name: "Product catalog" }));
    expect(grid().getAllByRole("link", { hidden: true })).toHaveLength(24);
    fireEvent.click(screen.getByRole("button", { name: "Hair Straightener" }));
    expect(grid().getAllByRole("link", { hidden: true })).toHaveLength(5);
    expect(grid().queryByRole("link", { name: "LBH-3228" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show All" }));
    expect(grid().getAllByRole("link", { hidden: true })).toHaveLength(24);
  });

  it("presents three overview slides and browses every product in source order", () => {
    render(<ProductIndexTemplate page={pages.find((page) => page.locale === "en" && page.kind === "product-index")!} />);
    const catalog = screen.getByRole("region", { name: "Product catalog" });
    expect(catalog).toHaveAttribute("aria-roledescription", "carousel");
    const carousel = within(catalog);
    const names = () => carousel.getAllByRole("link").map((link) => link.getAttribute("aria-label"));
    expect(names()).toEqual(["LBH-3228", "LBH-3210", "LBH-320"]);
    expect(carousel.getAllByRole("group")).toHaveLength(3);
    const previous = carousel.getByRole("button", { name: "Previous products" });
    const next = carousel.getByRole("button", { name: "Next products" });
    expect(previous).toBeDisabled();
    const seen = new Set(names());
    for (let index = 0; index < 21; index++) {
      fireEvent.click(next);
      names().forEach((name) => seen.add(name));
    }
    expect(seen.size).toBe(24);
    expect(names()).toEqual(["LBH-001A", "LBH-BD22", "LBH-3808"]);
    expect(next).toBeDisabled();
    fireEvent.click(previous);
    expect(names()).toEqual(["LBH-3257", "LBH-001A", "LBH-BD22"]);
    expect(carousel.getByRole("status")).toHaveTextContent("Products 21–23 of 24");
  });

  it("resets the carousel when filtering and keeps a short category fully visible", () => {
    render(<ProductIndexTemplate page={pages.find((page) => page.locale === "en" && page.kind === "product-index")!} />);
    const carousel = () => within(screen.getByRole("region", { name: "Product catalog" }));
    fireEvent.click(carousel().getByRole("button", { name: "Next products" }));
    fireEvent.click(screen.getByRole("button", { name: "High Speed Hair Multi-Styler" }));
    expect(carousel().getAllByRole("link").map((link) => link.getAttribute("aria-label"))).toEqual(["LBH-BD22", "LBH-3808"]);
    expect(carousel().getByRole("button", { name: "Previous products" })).toBeDisabled();
    expect(carousel().getByRole("button", { name: "Next products" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Show All" }));
    expect(carousel().getByRole("link", { name: "LBH-3228" })).toBeVisible();
    expect(carousel().getByRole("button", { name: "Previous products" })).toBeDisabled();
  });

  it.each(["en", "cn"] as const)("keeps customization, manufacturing and certification sections in %s", (locale) => {
    render(<ProductIndexTemplate page={pages.find((page) => page.locale === locale && page.kind === "product-index")!} />);
    for (const name of locale === "en" ? ["Customized, Unique Small Appliance Solutions", "Maximize Product Performance with Our Customized Solutions", "Globally Recognized Quality Certification", "Differentiated Services: Precisely Meeting Your Business Needs", "Ensure that every order is produced on time and meets quality standards.", "Our Valued Partners"] : ["定制独特的小家电解决方案", "通过定制方案提升产品性能", "全球认可的质量认证", "差异化服务：精准满足您业务需求", "确保每份订单都能按时生产，并保证质量", "我们宝贵的合作伙伴"]) expect(screen.getByRole("heading", { name })).toBeVisible();
  });

  it.each([[0, 2], [1, 6], [2, 5], [3, 3], [4, 8]])("keeps category %i scoped to its source products", (index, count) => {
    render(<ProductCategoryTemplate category={categories[index]} locale="cn" />);
    expect(screen.getByRole("heading", { name: categories[index].title.cn, level: 1 })).toBeVisible();
    expect(within(screen.getByRole("region", { name: "产品目录" })).getAllByRole("link")).toHaveLength(count);
    expect(screen.getByRole("region", { name: "产品目录" })).not.toHaveAttribute("aria-roledescription", "carousel");
    expect(screen.getByRole("link", { name: "显示全部" })).toHaveAttribute("href", "/cn/ProductIndex");
  });

  it("includes every current non-home route and dispatches product detail rendering", async () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(192);
    expect(params).toContainEqual({ locale: "en", slug: ["Company_Introduction"] });
    expect(params.some(({ slug }) => !slug.length)).toBe(false);
    render(await ContentPage({ params: Promise.resolve({ locale: "en", slug: ["ProductDetail", "11906944.html"] }) }));
    expect(screen.getByRole("heading", { name: "LBH-3228", level: 1 })).toBeVisible();
  });
});
