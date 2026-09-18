import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
    expect(screen.getByRole("heading", { name: "欢迎加入LBH电器大家庭" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "LBH电器产品认证" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "我们的使命" })).toBeVisible();
    expect(screen.getByRole("link", { name: "咨询家电专家" })).toHaveAttribute("href", "/cn/Contact_Us");
  });

  it("allows visitors to browse hero slides in either direction", () => {
    render(<HomeTemplate page={englishHome} />);
    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(screen.getByRole("heading", { name: "LBH-3228" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(screen.getByRole("heading", { name: /Saving You Time and Cost/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Go to slide 3" }));
    expect(screen.getByRole("heading", { name: "LBH-3210" })).toBeVisible();
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
    expect(screen.getByText("4800 +")).toBeVisible();
    expect(screen.getByText("Successful Custom Sample")).toBeVisible();
    expect(screen.getByRole("link", { name: /High Speed Hair Multi-Styler/ })).toHaveAttribute("href", "/en/Product/682971.html");
    expect(screen.getByRole("heading", { name: "LBH Appliances Product Certifications" })).toBeVisible();
  });
});
