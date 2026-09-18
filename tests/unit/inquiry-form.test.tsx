import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InquiryForm } from "@/components/interactive/InquiryForm";
import * as inquiry from "@/lib/inquiry";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });
function fill(cn = false) {
  fireEvent.change(screen.getByLabelText(cn ? "姓名" : "Name"), { target: { value: " Alex " } });
  fireEvent.change(screen.getByLabelText(cn ? "电子邮箱" : "Email"), { target: { value: "alex@example.com" } });
  fireEvent.change(screen.getByLabelText(cn ? "留言" : "Message"), { target: { value: " Please send a quote. " } });
}
describe("inquiry form", () => {
  it("links field errors to invalid inputs and focuses the first error", () => {
    render(<InquiryForm locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    for (const [label, error] of [["Name", "Name is required"], ["Email", "Enter a valid email"], ["Message", "Message is required"]]) {
      expect(screen.getByLabelText(label)).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByLabelText(label)).toHaveAccessibleDescription(error);
    }
    expect(screen.getByLabelText("Name")).toHaveFocus();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
  it("submits normalized product context once and disables all fields while pending", async () => {
    vi.useFakeTimers();
    const submit = vi.spyOn(inquiry, "submitInquiry");
    render(<InquiryForm locale="en" product="LBH-3228" />);
    expect(screen.getByLabelText("Product")).toHaveValue("LBH-3228");
    fill();
    fireEvent.change(screen.getByLabelText("Company"), { target: { value: " Example Ltd " } });
    fireEvent.change(screen.getByLabelText("Phone"), { target: { value: " +44 1234 " } });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByRole("button", { name: "Submitting…" })).toBeDisabled();
    expect(screen.getByLabelText("Name")).toBeDisabled();
    fireEvent.submit(screen.getByLabelText("Name").closest("form")!);
    expect(submit).toHaveBeenCalledExactlyOnceWith({ name: "Alex", email: "alex@example.com", company: "Example Ltd", phone: "+44 1234", message: "Please send a quote.", product: "LBH-3228", locale: "en" });
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(screen.getByRole("status")).toHaveTextContent("Thank you. We will contact you soon.");
    expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
  });
  it.each(["en", "cn"] as const)("offers localized retry after transport failure in %s", async (locale) => {
    const cn = locale === "cn";
    vi.spyOn(inquiry, "submitInquiry").mockRejectedValueOnce(new Error("offline"));
    render(<InquiryForm locale={locale} />);
    fireEvent.click(screen.getByRole("button", { name: cn ? "提交" : "Submit" }));
    expect(screen.getByLabelText(cn ? "姓名" : "Name")).toHaveAccessibleDescription(cn ? "请输入姓名" : "Name is required");
    fill(cn);
    fireEvent.click(screen.getByRole("button", { name: cn ? "提交" : "Submit" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(cn ? "提交失败，请重试。" : "Submission failed. Please try again.");
    expect(screen.getByLabelText(cn ? "留言" : "Message")).toHaveValue(" Please send a quote. ");
    fireEvent.click(screen.getByRole("button", { name: cn ? "提交" : "Submit" }));
    expect(await screen.findByRole("status")).toHaveTextContent(cn ? "谢谢，我们会尽快与您联系。" : "Thank you. We will contact you soon.");
  });
});
