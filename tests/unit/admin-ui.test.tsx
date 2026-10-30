import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AdminApp } from "@/components/admin/AdminApp";
afterEach(() => vi.unstubAllGlobals());
it("shows a usable login when the real session boundary returns unauthorized", async () => {
  vi.stubGlobal("fetch", () =>
    Promise.resolve(
      new Response(JSON.stringify({ error: "登录已失效" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    ),
  );
  render(<AdminApp />);
  await waitFor(() => expect(screen.getByLabelText("账号")).toBeVisible());
  expect(screen.getByLabelText("密码")).toHaveAttribute("type", "password");
  expect(screen.getByRole("button", { name: "登录后台" })).toBeVisible();
});
