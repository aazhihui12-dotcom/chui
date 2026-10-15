import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { englishHome, pages } from "@/content/pages";
import { HomeTemplate } from "@/components/templates/HomeTemplate";

afterEach(cleanup);

describe("homepage source recognition", () => {
  it("presents the brand proposition, production proof and manufacturing introduction", () => {
    render(<HomeTemplate page={englishHome} />);
    expect(screen.getByRole("heading", { name: /Saving You Time and Cost/ })).toBeVisible();
    expect(screen.getByText("5 Automated Production Lines")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Why choose APOWER TECH's personal care appliance solutions?" })).toBeVisible();
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("keeps the complete Chinese homepage and contact actions localized", () => {
    render(<HomeTemplate page={pages.find((page) => page.id === "home" && page.locale === "cn")!} />);
    expect(screen.getByRole("heading", { name: "欢迎加入 APOWER 电器大家庭" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "APOWER 电器的产品认证" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "我们的使命" })).toBeVisible();
    expect(screen.getByRole("link", { name: "与家电专家交流" })).toHaveAttribute("href", "/cn/Contact_Us");
  });
  it("renders complete captured Chinese welcome copy rather than an authored paraphrase", () => {
    render(<HomeTemplate page={pages.find(page => page.id === "home" && page.locale === "cn")!} />);
    expect(screen.getByText(/多年的行业积累，锤炼了我们在个护家电研发设计领域的专业能力/)).toBeVisible();
  });

  it("shows one of the three supplied banners separately from the featured products", () => {
    render(<HomeTemplate page={englishHome} />);
    const carousel = within(screen.getByRole("region", { name: "Products and brand highlights" }));
    expect(carousel.getAllByRole("group")).toHaveLength(1);
    expect(carousel.getByText("Current slide: 1 / 3")).toBeInTheDocument();
    expect(carousel.getByRole("button",{name:'Next slide'})).toBeVisible();
    expect(screen.getByRole("heading", { name: /Saving You Time and Cost/ })).toBeVisible();
  });

  it.each(["en", "cn"] as const)("offers all four source featured products with %s detail links", (locale) => {
    render(<HomeTemplate page={pages.find((page) => page.id === "home" && page.locale === locale)!} />);
    const featured = within(screen.getByRole("region", { name: locale === "cn" ? "精选产品" : "Featured products" }));
    for (const model of ['AP-G1','AP-G3','AP-G11','AP-S1']) {
      expect(featured.getByRole("link", { name: model })).toHaveAttribute("href", `/${locale}/ProductDetail/${model}.html`);
    }
  });

  it("opens the manufacturing video and restores focus when Escape closes it", () => {
    render(<HomeTemplate page={englishHome} />);
    const trigger = screen.getByRole("button", { name: "Play manufacturing video" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Our manufacturing system" })).toBeVisible();
    expect(screen.getByTitle("APOWER TECH · Manufacturing video")).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/bx1R2NQPTxw?autoplay=1");
    expect(screen.getByRole("link", { name: "Open video on YouTube" })).toHaveAttribute("href", "https://www.youtube.com/watch?v=bx1R2NQPTxw");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it.each(["en", "cn"] as const)("uses APOWER footage and cover instead of the legacy factory video on the %s homepage", (locale) => {
    const { container } = render(<HomeTemplate page={pages.find(page => page.id === "home" && page.locale === locale)!} />);
    const preview = container.querySelector('.home-manufacturing .video-preview video');
    expect(preview).toHaveAttribute('src', '/media/apower/home-manufacturing-preview.mp4');
    expect(preview).toHaveAttribute('poster', '/media/apower/factory-tour-video-poster.webp');
    expect(container.querySelector('.home-manufacturing')).not.toHaveTextContent('LBH');
    expect(container.querySelector('iframe')).toBeNull();
  });

  it.each(["en", "cn"] as const)("removes %s manufacturing circular overlays while keeping the video clickable", (locale) => {
    const { container } = render(<HomeTemplate page={pages.find(page => page.id === "home" && page.locale === locale)!} />);
    const trigger = screen.getByRole("button", { name: locale === "cn" ? "播放制造视频" : "Play manufacturing video" });
    expect(trigger.querySelector(".video-preview__play")).toBeNull();
    expect(container.querySelector(".background-video-toggle")).toBeNull();
    expect(screen.getByRole("button", { name: locale === "cn" ? "播放背景视频" : "Play background video" })).toHaveClass("sr-only");
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: locale === "cn" ? "我们的制造体系" : "Our manufacturing system" })).toBeVisible();
  });

  it("renders real manufacturing figures and category destinations", () => {
    render(<HomeTemplate page={englishHome} />);
    expect(screen.getByText("750", { selector: '[aria-hidden="true"]' })).toBeVisible();
    expect(screen.getByText("Successful Custom Samples")).toBeVisible();
    expect(screen.getByRole("link", { name: /High-Speed Multi-Stylers/ })).toHaveAttribute("href", "/en/Product/682971.html");
    expect(screen.getByRole("heading", { name: "APOWER TECH Product Certifications" })).toBeVisible();
  });
});
