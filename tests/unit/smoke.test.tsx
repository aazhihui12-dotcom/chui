import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";

it("declares the LBH document shell", () => {
  render(
    <RootLayout>
      <main>content</main>
    </RootLayout>,
  );

  expect(screen.getByText("content")).toBeInTheDocument();
});
