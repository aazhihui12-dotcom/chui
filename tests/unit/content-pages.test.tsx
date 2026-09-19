import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import ContentPage from "@/app/[locale]/[...slug]/page";
import { getPage } from "@/lib/content";
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";

afterEach(() => { cleanup(); window.history.replaceState({}, "", "/"); });
const page = (path: string, locale = "en") => ContentPage({ params: Promise.resolve({ locale, slug: path.split("/") }) });

it("retains the captured Blog thumbnail on placeholder cards across pagination", async () => {
  render(await page("Blog"));
  const source = "/media/41ec23ad17142394e482f3a2afb2a0be8af1c40d2c904b99afd8e1df396f32a7.jpg";
  for (const card of screen.getAllByRole("article")) {
    expect(within(card).getByRole("img")).toHaveAttribute("src", source);
    expect(card).toHaveTextContent("Source placeholder");
  }
  fireEvent.click(screen.getByRole("button", { name: "Next page" }));
  expect(screen.getAllByRole("img")).toHaveLength(3);
});

it("leads contact with the source project headline, followed by contact details and one inline inquiry form", async () => {
  render(await page("Contact_Us"));
  const heading = screen.getByRole("heading", { level: 1, name: "Let us take on your new personal care and home appliance project!" });
  expect(heading.closest("header")).not.toBeNull();
  expect(screen.getByRole("heading", { level: 2, name: "Contact Us Now" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Send Message", exact: true })).toBeVisible();
  expect(document.querySelectorAll("form")).toHaveLength(1);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("paginates the eleven news records without mixing in FAQs or losing the last three records", async () => {
  render(await page("Blog"));
  expect(screen.getAllByRole("article")).toHaveLength(8);
  expect(screen.queryByText("What is your supply capacity?")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Next page" }));
  expect(screen.getAllByRole("article")).toHaveLength(3);
  expect(screen.getByRole("link", { name: /Title.*6860195/ })).toHaveAttribute("href", "/en/NewsDetail/6860195.html");
  expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  expect(screen.getByRole("status")).toHaveTextContent("2 / 2");
  fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
  expect(screen.getAllByRole("article")).toHaveLength(8);
});

it("treats NewsList/2 as the FAQ category and honors legacy PageNo on load", async () => {
  window.history.replaceState({}, "", "/cn/NewsList/2.html?PageNo=2");
  render(await page("NewsList/2.html", "cn"));
  expect(screen.getAllByRole("article")).toHaveLength(11);
  expect(screen.getByRole("link", { name: "你们的供货能力如何？" })).toHaveAttribute("href", "/cn/NewsDetail/6809208.html");
  expect(screen.getByRole("status")).toHaveTextContent("2 / 2");
});

it("renders article metadata and source body with a localized back link", async () => {
  const { container } = render(await page("NewsDetail/6860206.html"));
  expect(screen.getByRole("article")).toHaveTextContent("With a daily production capacity of 5,000 units");
  expect(screen.getByText("LBH APPLIANCES")).toBeVisible();
  expect(container.querySelector("time")).toHaveAttribute("datetime", "2026-03-02T13:48:40");
  expect(screen.getByRole("link", { name: "Back to FAQ" })).toHaveAttribute("href", "/en/FAQ");
});

it.each(["en", "cn"])("keeps placeholder %s metadata and identifies unavailable substantive content", async (locale) => {
  render(await page("NewsDetail/6860195.html", locale));
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(locale === "cn" ? "标题" : "Title");
  expect(screen.getByText("2026-01-27 18:06:45")).toBeVisible();
  expect(screen.getByText("LBH APPLIANCES")).toBeVisible();
  expect(screen.getByRole("note")).toHaveTextContent(locale === "cn" ? "原站仅提供占位内容" : "The source provides placeholder content only");
  expect(screen.getByRole("article")).toHaveTextContent(locale === "cn" ? "内容介绍" : "Content introduction");
});

it("expands and collapses FAQ answers with labeled, connected buttons and localized detail links", async () => {
  render(await page("FAQ"));
  const question = screen.getByRole("button", { name: "What is your supply capacity?" });
  expect(screen.getAllByRole("button", { expanded: false })).toHaveLength(23);
  expect(question).toHaveAttribute("aria-expanded", "false");
  const answer = document.getElementById(question.getAttribute("aria-controls")!)!;
  expect(answer).not.toBeVisible();
  fireEvent.click(question);
  expect(question).toHaveAttribute("aria-expanded", "true");
  expect(answer).toBeVisible();
  expect(answer).toHaveAttribute("aria-labelledby", question.id);
  expect(within(answer).getByRole("link", { name: "Read more" })).toHaveAttribute("href", "/en/NewsDetail/6860206.html");
  fireEvent.click(question);
  expect(answer).not.toBeVisible();
});

it("renders real contact channels and the Chinese inline inquiry fields", async () => {
  render(await page("Contact_Us", "cn"));
  expect(screen.getByRole("link", { name: "tina.fang@linknove.com" })).toHaveAttribute("href", "mailto:tina.fang@linknove.com");
  expect(screen.getByRole("link", { name: "+86 137 0306 7387" })).toHaveAttribute("href", "tel:+8613703067387");
  expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", "https://wa.me/8613703067387");
  expect(screen.getByText(/兴南路9号/)).toBeVisible();
  expect(screen.getByLabelText("姓名")).toBeVisible();
  expect(screen.getByLabelText("电子邮箱")).toBeVisible();
  expect(screen.getByLabelText("留言")).toBeVisible();
  expect(document.querySelectorAll("form")).toHaveLength(1);
});

it("offers four catalogue records while clearly marking their files unavailable", async () => {
  const { container } = render(await page("Product_Catalogue"));
  expect(screen.getAllByRole("article")).toHaveLength(4);
  expect(screen.getByRole("status")).toHaveTextContent("No downloadable files are currently available");
  expect(screen.getByRole("link", { name: /261888/ })).toHaveAttribute("href", "/en/DownLoad/261888.html");
  expect(container.querySelector("a[download]")).toBeNull();
  expect(container.querySelector('a[href*="a=download"]')).toBeNull();
  expect(screen.getByRole("link", { name: "Request Full Product Catalog" })).toHaveAttribute("href", "/en/Contact_Us");
});

it("links only verified local downloads and rejects missing files, remote URLs and path traversal", async () => {
  mkdirSync("public/downloads", { recursive: true });
  const directory = mkdtempSync("public/downloads/test-");
  const href = `/${directory.replace(/^public\//, "")}/catalogue.txt`;
  writeFileSync(`${directory}/catalogue.txt`, "Test fixture, not a production catalogue");
  const record = getPage("en", ["DownLoad", "261888.html"])!;
  const original = record.downloads;
  record.downloads = [
    { label: "Verified catalogue", href },
    { label: "Missing", href: "/downloads/missing.pdf" },
    { label: "Remote", href: "https://example.com/fake.pdf" },
    { label: "Traversal", href: "/downloads/../../package.json" },
  ];
  try {
    render(await page("DownLoad/261888.html"));
    expect(screen.getByRole("link", { name: "Verified catalogue" })).toHaveAttribute("href", href);
    expect(screen.getByRole("link", { name: "Verified catalogue" })).toHaveAttribute("download");
    expect(screen.queryByRole("link", { name: /Missing|Remote|Traversal/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  } finally { record.downloads = original; rmSync(directory, { recursive: true }); }
});
