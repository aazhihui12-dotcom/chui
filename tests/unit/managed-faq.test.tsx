import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { it, expect } from "vitest";
import { FaqTemplate } from "@/components/templates/FaqTemplate";
import { ProductIndexTemplate } from "@/components/templates/ProductIndexTemplate";
import { getPage } from "@/lib/content";
it("uses the same published managed answers on FAQ and product overview without static fallback", () => {
  const entries = [
    {
      id: "managed",
      question: "A newly published FAQ?",
      answer: "A current managed answer.",
    },
  ];
  render(
    <FaqTemplate
      page={getPage("en", ["FAQ"])!}
      articles={[]}
      faqEntries={entries}
    />,
  );
  expect(screen.getByText("A newly published FAQ?")).toBeVisible();
  cleanup();
  render(
    <ProductIndexTemplate
      page={getPage("en", ["ProductIndex"])!}
      catalogFaq={entries}
    />,
  );
  expect(screen.getByText("A newly published FAQ?")).toBeVisible();
  cleanup();
  render(
    <FaqTemplate
      page={getPage("cn", ["FAQ"])!}
      articles={[]}
      faqEntries={[]}
    />,
  );
  expect(document.querySelectorAll("details")).toHaveLength(0);
});
