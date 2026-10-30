import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { it, expect, vi, afterEach } from "vitest";
import { ContentEditor } from "@/components/admin/ContentEditor";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("does not save before all selected images finish uploading", async () => {
  let finish!: (value: Response) => void;
  vi.stubGlobal(
    "fetch",
    () =>
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
  );
  const saved: unknown[] = [];
  render(
    <ContentEditor
      kind="article"
      onClose={() => {}}
      onSave={async (data) => {
        saved.push(data);
        return { id: "test" } as never;
      }}
    />,
  );
  fireEvent.change(screen.getByLabelText("中文封面及正文图片上传"), {
    target: {
      files: [new File(["image"], "fixture.png", { type: "image/png" })],
    },
  });
  expect(
    screen.getByRole("button", { name: "保存草稿", exact: true }),
  ).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "保存并发布", exact: true }),
  ).toBeDisabled();
  expect(saved).toHaveLength(0);
  finish(
    new Response(
      JSON.stringify({
        image: {
          src: "/uploads/a22b3ce1-aabb-4abc-8abc-123456789abc.webp",
          width: 1,
          height: 1,
          alt: "",
        },
      }),
      { status: 201, headers: { "content-type": "application/json" } },
    ),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "保存草稿", exact: true }),
    ).toBeEnabled(),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "保存草稿", exact: true }),
  );
  await waitFor(() => expect(saved).toHaveLength(1));
  expect(
    (saved[0] as { locales: { cn: { images: string[] } } }).locales.cn.images,
  ).toHaveLength(1);
});
it("preserves the original publication time when only editing text", async () => {
  const saved: unknown[] = [];
  const record = {
    id: "article",
    kind: "article",
    status: "published",
    version: 1,
    payload: {
      publishedAt: "2026-03-02 13:48:40",
      category: "news",
      locales: {
        cn: { title: "标题", description: "", blocks: [], images: [] },
        en: { title: "Title", description: "", blocks: [], images: [] },
      },
    },
  };
  render(
    <ContentEditor
      kind="article"
      record={record as never}
      onClose={() => {}}
      onSave={async (data) => {
        saved.push(data);
        return record as never;
      }}
    />,
  );
  fireEvent.change(screen.getByLabelText("中文标题"), {
    target: { value: "修改标题" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "保存修改", exact: true }),
  );
  await waitFor(() => expect(saved).toHaveLength(1));
  expect((saved[0] as { publishedAt: string }).publishedAt).toBe(
    "2026-03-02 13:48:40",
  );
});
