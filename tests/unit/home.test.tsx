import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { englishHome, pages } from "@/content/pages";
import { HomeTemplate } from "@/components/templates/HomeTemplate";

afterEach(cleanup);

describe("homepage source recognition", () => {
  it("presents the brand proposition, production proof and manufacturing introduction", () => {
    render(<HomeTemplate page={englishHome} />);
    expect(screen.getByRole("heading", { name: /Saving You Time and Cost/ })).toBeVisible();
    expect(screen.getByText("10 Automated Production Lines")).toBeVisible();
    expect(screen.getByRole("heading", { name: /Why LBH's Personal Care Appliances Solutions/ })).toBeVisible();
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("keeps the complete Chinese homepage and contact actions localized", () => {
    render(<HomeTemplate page={pages.find((page) => page.id === "home" && page.locale === "cn")!} />);
    expect(screen.getByRole("heading", { name: "欢迎来到LBH电器家族" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "LBH电器的产品认证" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "我们的任务" })).toBeVisible();
    expect(screen.getByRole("link", { name: "咨询家电专家" })).toHaveAttribute("href", "/cn/Contact_Us");
  });
  it("renders complete captured Chinese welcome copy rather than an authored paraphrase", () => {
    render(<HomeTemplate page={pages.find(page => page.id === "home" && page.locale === "cn")!} />);
    expect(screen.getByText(/我们多年的行业经验磨练了我们在个护家电研发设计方面的专业知识/)).toBeVisible();
  });

  it("retains the source single-slide hero separately from the four featured products", () => {
    render(<HomeTemplate page={englishHome} />);
    const carousel = within(screen.getByRole("region", { name: "Products and brand highlights" }));
    expect(carousel.getAllByRole("group")).toHaveLength(1);
    expect(carousel.getByText("01 / 01")).toBeVisible();
    expect(carousel.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Saving You Time and Cost/ })).toBeVisible();
  });

  it.each(["en", "cn"] as const)("offers all four source featured products with %s detail links", (locale) => {
    render(<HomeTemplate page={pages.find((page) => page.id === "home" && page.locale === locale)!} />);
    const featured = within(screen.getByRole("region", { name: locale === "cn" ? "精选产品" : "Featured products" }));
    for (const [model, id] of [["LBH-3228", "11906944"], ["LBH-3210", "11906943"], ["LBH-320", "11906942"], ["LBH-WY605", "11906941"]]) {
      const actualIds: Record<string, string> = { "11906944": "11898269", "11906943": "11898257", "11906942": "11898254", "11906941": "11898119" };
      expect(featured.getByRole("link", { name: model })).toHaveAttribute("href", `/${locale}/ProductDetail/${locale === "cn" ? actualIds[id] : id}.html`);
    }
  });

  it("opens the manufacturing video and restores focus when Escape closes it", () => {
    render(<HomeTemplate page={englishHome} />);
    const trigger = screen.getByRole("button", { name: "Play manufacturing video" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Our manufacturing system" })).toBeVisible();
    expect(screen.getByLabelText("Manufacturing video")).toHaveAttribute("src", expect.stringMatching(/^\/media\/.*\.mp4$/));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("renders real manufacturing figures and category destinations", () => {
    render(<HomeTemplate page={englishHome} />);
    expect(screen.getByText("4800 +", { selector: '[aria-hidden="true"]' })).toBeVisible();
    expect(screen.getByText("Successful Custom Sample")).toBeVisible();
    expect(screen.getByRole("link", { name: /High Speed Hair Multi-Styler/ })).toHaveAttribute("href", "/en/Product/682971.html");
    expect(screen.getByRole("heading", { name: "LBH Appliances Product Certifications" })).toBeVisible();
  });
});
