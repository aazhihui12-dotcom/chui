import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { EditorialGallery } from "@/components/interactive/EditorialGallery";
import { ProductCarousel } from "@/components/interactive/ProductCarousel";
import { products } from "@/content/products";
import { PartnerCarousel } from "@/components/interactive/PartnerCarousel";
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
const images = [{ src: "/media/one.webp", alt: "One" }, { src: "/media/two.webp", alt: "Two" }];
it("advances the source partner-logo carousel every four seconds and supports pausing", () => {
  vi.useFakeTimers(); render(<PartnerCarousel images={images} locale="en" label="Partners" />);
  expect(screen.getByRole("status")).toHaveTextContent("1 / 2");
  act(() => vi.advanceTimersByTime(4000)); expect(screen.getByRole("status")).toHaveTextContent("2 / 2");
  fireEvent.click(screen.getByRole("button", { name: "Pause slideshow" }));
  act(() => vi.advanceTimersByTime(4000)); expect(screen.getByRole("status")).toHaveTextContent("2 / 2");
});
it("advances source-enabled product slides after 4 seconds and stops for hover, focus and manual interaction", () => {
  vi.useFakeTimers();
  render(<ProductCarousel products={products} locale="en" />);
  const carousel = screen.getByRole("region");
  act(() => vi.advanceTimersByTime(3999));
  expect(screen.getByRole("status")).toHaveTextContent("Products 1–3");
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByRole("status")).toHaveTextContent("Products 2–4");
  fireEvent.mouseEnter(carousel); act(() => vi.advanceTimersByTime(8000));
  expect(screen.getByRole("status")).toHaveTextContent("Products 2–4");
  fireEvent.mouseLeave(carousel); fireEvent.focus(within(carousel).getAllByRole("link")[0]);
  act(() => vi.advanceTimersByTime(8000)); expect(screen.getByRole("status")).toHaveTextContent("Products 2–4");
  fireEvent.blur(within(carousel).getAllByRole("link")[0]);
  fireEvent.click(screen.getByRole("button", { name: "Next products" }));
  act(() => vi.advanceTimersByTime(8000)); expect(screen.getByRole("status")).toHaveTextContent("Products 3–5");
});
it("preserves an explicitly non-autoplay gallery", () => {
  vi.useFakeTimers(); render(<EditorialGallery images={images} locale="en" label="Motor" />);
  act(() => vi.advanceTimersByTime(12000)); expect(screen.getByRole("status")).toHaveTextContent("1 / 2");
  expect(screen.queryByRole("button", { name: /Pause/ })).toBeNull();
});
it("supports explicit pause/resume and prevents reduced-motion autoplay", () => {
  vi.useFakeTimers();
  const { unmount } = render(<EditorialGallery images={images} locale="en" label="Assembly" autoplayMs={4000} />);
  fireEvent.click(screen.getByRole("button", { name: "Pause slideshow" }));
  act(() => vi.advanceTimersByTime(8000)); expect(screen.getByRole("status")).toHaveTextContent("1 / 2");
  fireEvent.click(screen.getByRole("button", { name: "Resume slideshow" }));
  act(() => vi.advanceTimersByTime(4000)); expect(screen.getByRole("status")).toHaveTextContent("2 / 2");
  unmount();
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  render(<EditorialGallery images={images} locale="en" label="Assembly" autoplayMs={4000} />);
  act(() => vi.advanceTimersByTime(8000)); expect(screen.getByRole("status")).toHaveTextContent("1 / 2");
});
