import { fireEvent, render, screen, within } from "@testing-library/react";
import { SiteShell } from "@/components/site/Header";

describe("SiteShell", () => {
  it("renders the localized primary navigation, language destination, and contact footer", () => {
    render(
      <SiteShell locale="en">
        <main>Page</main>
      </SiteShell>,
    );

    // Catches an accidental removal or locale-prefix regression in shared navigation.
    expect(screen.getByRole("link", { name: "Product" })).toHaveAttribute("href", "/en/ProductIndex");
    // Catches language switches that drop users on the wrong locale home route.
    expect(screen.getByRole("link", { name: "中文" })).toHaveAttribute("href", "/cn");
    // Catches footer shells that omit the site contact channel.
    expect(screen.getByRole("contentinfo")).toHaveTextContent("tina.fang@linknove.com");
  });

  it("opens and closes a desktop submenu with keyboard controls", () => {
    render(
      <SiteShell locale="en">
        <main>Page</main>
      </SiteShell>,
    );

    const toggle = screen.getByRole("button", { name: "Open Product menu" });
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Hair Dryer" })).toHaveAttribute("href", "/en/Product/682975.html");

    fireEvent.keyDown(toggle, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("focuses, locks, and restores the mobile drawer with Escape", () => {
    render(
      <SiteShell locale="en">
        <main>Page</main>
      </SiteShell>,
    );

    const menuButton = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(menuButton);

    const drawer = screen.getByRole("dialog", { name: "Menu" });
    const closeButton = within(drawer).getByRole("button", { name: "Close menu" });
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(document.activeElement).toBe(closeButton);
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(drawer, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(menuButton);
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps keyboard focus inside the open mobile drawer", () => {
    render(
      <SiteShell locale="en">
        <main>Page</main>
      </SiteShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const drawer = screen.getByRole("dialog", { name: "Menu" });
    const closeButton = within(drawer).getByRole("button", { name: "Close menu" });
    const lastControl = within(drawer).getByRole("button", { name: "Open Touch menu" });

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(lastControl);

    lastControl.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(closeButton);
  });
});
