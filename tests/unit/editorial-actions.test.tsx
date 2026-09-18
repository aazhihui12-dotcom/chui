import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CtaBlock } from "@/components/site/blocks/CtaBlock";
import { HeroBlock } from "@/components/site/blocks/HeroBlock";
import { SplitBlock } from "@/components/site/blocks/SplitBlock";
afterEach(cleanup);
it.each(["en", "cn"] as const)("all typed editorial inquiry actions dispatch a cancelable %s request and retain fallback", (locale) => {
  const action = { label: "Get quote", href: `/${locale}/Contact_Us`, action: "inquiry" as const };
  const requests: CustomEvent[] = [];
  const receive = (event: Event) => { requests.push(event as CustomEvent); event.preventDefault(); };
  window.addEventListener("lbh:inquiry", receive);
  render(<><CtaBlock block={{ type: "cta", actions: [action] }} /><HeroBlock block={{ type: "hero", title: "Title", actions: [action] }} /><SplitBlock block={{ type: "split", heading: "Split", paragraphs: [], image: { src: "/media/test.png", alt: "" }, actions: [action] }} /></>);
  for (const link of screen.getAllByRole("link", { name: /Get quote/ })) {
    expect(link).toHaveAttribute("href", action.href);
    expect(fireEvent.click(link)).toBe(false);
  }
  expect(requests).toHaveLength(3);
  for (const request of requests) { expect(request.cancelable).toBe(true); expect(request.detail).toEqual({ locale, title: "Get quote" }); }
  window.removeEventListener("lbh:inquiry", receive);
});
