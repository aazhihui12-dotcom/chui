import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { InquiryDialog } from "@/components/interactive/InquiryDialog";
import { ProductInquiry } from "@/components/interactive/ProductInquiry";
import { ContactInquiry } from "@/components/interactive/ContactInquiry";

afterEach(cleanup);
describe("shared inquiry host", () => {
  it("accepts a product request, prefills its model and title, and restores focus on Escape", () => {
    render(<><ProductInquiry context={{ locale: "en", productId: "11906944", model: "LBH-3228", title: "LBH-3228 Inquiry" }} label="Quote" /><InquiryDialog locale="en" /></>);
    const trigger = screen.getByRole("link", { name: "Quote" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "LBH-3228 Inquiry" })).toBeVisible();
    expect(screen.getByLabelText("Product")).toHaveValue("LBH-3228");
    expect(screen.getByLabelText("Name")).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
  it("accepts general requests and offers close and backdrop dismissal without leaking old values", () => {
    render(<><ContactInquiry locale="cn" title="联系我们" label="咨询" email="sales@example.com" /><InquiryDialog locale="cn" /></>);
    const trigger = screen.getByRole("link", { name: "咨询" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "联系我们" })).toBeVisible();
    expect(screen.getByLabelText("产品")).toHaveValue("");
    fireEvent.change(screen.getByLabelText("姓名"), { target: { value: "旧资料" } });
    fireEvent.click(screen.getByRole("button", { name: "关闭询盘" }));
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    expect(screen.getByLabelText("姓名")).toHaveValue("");
    fireEvent.click(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("cancels only matching valid events and keeps one active request", () => {
    render(<InquiryDialog locale="en" />);
    for (const detail of [null, { locale: "cn", title: "Wrong locale" }, { locale: "en", title: 1 }]) {
      const event = new CustomEvent("lbh:inquiry", { detail, cancelable: true });
      fireEvent(window, event);
      expect(event.defaultPrevented).toBe(false);
    }
    const request = new CustomEvent("lbh:inquiry", { detail: { locale: "en", title: "General inquiry" }, cancelable: true });
    fireEvent(window, request);
    expect(request.defaultPrevented).toBe(true);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Keep my draft" } });
    fireEvent(window, new CustomEvent("lbh:inquiry", { detail: { locale: "en", title: "Another inquiry" }, cancelable: true }));
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByLabelText("Name")).toHaveValue("Keep my draft");
  });
});
