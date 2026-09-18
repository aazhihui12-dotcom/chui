import { afterEach, describe, expect, it, vi } from "vitest";
import { submitInquiry, validateInquiry, type InquiryPayload } from "@/lib/inquiry";

const valid: InquiryPayload = { name: "Alex", email: "alex@example.com", message: "Please send a quote.", locale: "en" };
afterEach(() => vi.useRealTimers());

describe("inquiry boundary", () => {
  it("rejects missing required fields and malformed email with the agreed errors", () => {
    expect(validateInquiry({ name: "", email: "bad", message: "", locale: "en" })).toEqual({ name: "Name is required", email: "Enter a valid email", message: "Message is required" });
  });
  it("rejects whitespace-only values while accepting optional fields and trimmed email", () => {
    expect(validateInquiry({ ...valid, name: "  ", message: "\n" })).toEqual({ name: "Name is required", message: "Message is required" });
    expect(validateInquiry({ ...valid, email: " alex+sales@example.co.uk " })).toEqual({});
  });
  it("requires a supported locale at the transport boundary", () => {
    expect(validateInquiry({ name: "Alex", email: "alex@example.com", message: "Quote" })).toHaveProperty("locale");
  });
  it("simulates exactly 300ms then returns a success reference without a network request", async () => {
    vi.useFakeTimers();
    const network = vi.spyOn(globalThis, "fetch");
    let complete = false;
    const result = submitInquiry(valid).then((value) => { complete = true; return value; });
    await vi.advanceTimersByTimeAsync(299);
    expect(complete).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toEqual({ ok: true, reference: expect.any(String) });
    expect((await result).reference.length).toBeGreaterThan(0);
    expect(network).not.toHaveBeenCalled();
    network.mockRestore();
  });
  it("rejects invalid submissions instead of returning simulated success", async () => {
    await expect(submitInquiry({ ...valid, email: "bad" })).rejects.toThrow();
  });
});
