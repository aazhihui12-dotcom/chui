// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";
import { CmsStore } from "@/lib/cms/store";
import { handleCmsRequest } from "@/lib/cms/api";

let dir: string,
  store: CmsStore,
  token = "";
const origin = "https://177.5.75.237";
beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "apower-api-"));
  store = new CmsStore(join(dir, "cms.sqlite"));
  store.createUser("admin", "InitialPassword!123", "admin");
  token = "";
});
afterEach(() => {
  store.db.close();
  rmSync(dir, { recursive: true, force: true });
});
const call = (
  path: string,
  method = "GET",
  body?: unknown,
  headers: Record<string, string> = {},
) =>
  handleCmsRequest(
    new Request(origin + "/api/cms/" + path, {
      method,
      headers: {
        origin,
        ...(token ? { cookie: `apower_session=${token}` } : {}),
        ...headers,
        ...(body !== undefined && !(body instanceof Uint8Array)
          ? { "content-type": "application/json" }
          : {}),
      },
      body:
        body === undefined
          ? undefined
          : body instanceof Uint8Array
            ? (body as BodyInit)
            : JSON.stringify(body),
    }),
    store,
    { origin, uploadDir: join(dir, "uploads"), secure: true },
  );
async function login(change = true) {
  const r = await call("login", "POST", {
    username: "admin",
    password: "InitialPassword!123",
  });
  expect(r.status).toBe(200);
  expect(r.headers.get("set-cookie")).toContain("HttpOnly");
  expect(r.headers.get("set-cookie")).toContain("Secure");
  token = r.headers.get("set-cookie")!.match(/apower_session=([^;]+)/)![1];
  if (change) {
    expect(
      (
        await call("password", "POST", {
          oldPassword: "InitialPassword!123",
          password: "ChangedPassword!456",
        })
      ).status,
    ).toBe(200);
    token = "";
    const next = await call("login", "POST", {
      username: "admin",
      password: "ChangedPassword!456",
    });
    token = next.headers.get("set-cookie")!.match(/apower_session=([^;]+)/)![1];
  }
}
const article = () => ({
  status: "draft",
  category: "news",
  publishedAt: "2026-10-30",
  locales: {
    cn: {
      title: "测试新闻",
      description: "测试摘要",
      body: "中文正文",
      images: [],
    },
    en: {
      title: "Test news",
      description: "Intro",
      body: "English body",
      images: [],
    },
  },
});

describe("admin request boundary", () => {
  it("revalidates a session after a delayed body and before saving", async () => {
    await login();
    let control!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        control = c;
      },
    });
    const pending = handleCmsRequest(
      new Request(origin + "/api/cms/content/article", {
        method: "POST",
        headers: {
          origin,
          cookie: `apower_session=${token}`,
          "content-type": "application/json",
        },
        body: stream,
        duplex: "half",
      } as RequestInit),
      store,
      { origin, uploadDir: join(dir, "uploads"), secure: true },
    );
    store.logout(token);
    control.enqueue(Buffer.from(JSON.stringify(article())));
    control.close();
    expect((await pending).status).toBe(401);
    expect(store.list("article")).toHaveLength(0);
  });
  it("revalidates administrator identity after reading account request data", async () => {
    await login();
    let control!: ReadableStreamDefaultController<Uint8Array>;
    const pending = handleCmsRequest(
      new Request(origin + "/api/cms/users", {
        method: "POST",
        headers: {
          origin,
          cookie: `apower_session=${token}`,
          "content-type": "application/json",
        },
        body: new ReadableStream<Uint8Array>({
          start(c) {
            control = c;
          },
        }),
        duplex: "half",
      } as RequestInit),
      store,
      { origin, uploadDir: join(dir, "uploads"), secure: true },
    );
    store.logout(token);
    control.enqueue(
      Buffer.from(
        JSON.stringify({
          username: "intruder",
          password: "IntruderPassword!123",
          role: "admin",
        }),
      ),
    );
    control.close();
    expect((await pending).status).toBe(401);
    expect(store.users()).toHaveLength(1);
  });
  it("does not write an upload after the account session has been revoked", async () => {
    await login();
    const png = await sharp({
      create: { width: 1200, height: 1200, channels: 3, background: "#123456" },
    })
      .png()
      .toBuffer();
    const pending = call("uploads", "POST", png, {
      "content-type": "image/png",
    });
    await new Promise<void>((resolve) =>
      setImmediate(() => {
        store.logout(token);
        resolve();
      }),
    );
    expect((await pending).status).toBe(401);
    expect(() => readdirSync(join(dir, "uploads"))).toThrow();
  });
  it("cannot finish password change using a session revoked during the request", async () => {
    await login();
    const pending = call("password", "POST", {
      oldPassword: "ChangedPassword!456",
      password: "AnotherPassword!789",
    });
    store.logout(token);
    expect((await pending).status).toBe(401);
    expect(
      await store.login("admin", "ChangedPassword!456", "after"),
    ).toBeTruthy();
  });
  it("denies anonymous reads/writes and cross-origin requests including login", async () => {
    expect((await call("content/product")).status).toBe(401);
    expect((await call("content/article", "POST", article())).status).toBe(401);
    expect(
      (
        await call(
          "login",
          "POST",
          { username: "admin", password: "InitialPassword!123" },
          { origin: "https://evil.example" },
        )
      ).status,
    ).toBe(403);
  });
  it("requires an initial password change and revokes the old session after change/logout", async () => {
    await login(false);
    expect((await call("content/product")).status).toBe(403);
    expect(
      (
        await call("password", "POST", {
          oldPassword: "InitialPassword!123",
          password: "short",
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await call("password", "POST", {
          oldPassword: "InitialPassword!123",
          password: "ChangedPassword!456",
        })
      ).status,
    ).toBe(200);
    expect((await call("session")).status).toBe(401);
  });
  it("supports draft → publish → delete → restore with conflict detection and safe exports", async () => {
    await login();
    let r = await call("content/article", "POST", article());
    expect(r.status).toBe(201);
    let record = (await r.json()).record;
    expect(store.list("article", "published")).toHaveLength(0);
    r = await call(`content/article/${record.id}`, "PATCH", {
      ...article(),
      id: record.id,
      version: record.version,
      status: "published",
    });
    expect(r.status).toBe(200);
    record = (await r.json()).record;
    expect(store.list("article", "published")).toHaveLength(1);
    expect(
      (await call(`content/article/${record.id}`, "DELETE", { version: 1 }))
        .status,
    ).toBe(409);
    expect(
      (
        await call(`content/article/${record.id}`, "DELETE", {
          version: record.version,
        })
      ).status,
    ).toBe(200);
    expect(store.list("article", "published")).toHaveLength(0);
    expect(
      (await call(`content/article/${record.id}/restore`, "POST", {})).status,
    ).toBe(200);
    expect(store.get("article", record.id)!.status).toBe("draft");
    const backup = await call("backup");
    expect(backup.status).toBe(200);
    const value = await backup.text();
    expect(value).toContain("测试新闻");
    expect(value).not.toContain("password_hash");
    expect(value).not.toContain("token_hash");
  });
  it("prevents editors managing accounts/backups and immediately revokes disabled accounts", async () => {
    await login();
    const adminToken = token;
    const r = await call("users", "POST", {
      username: "operator",
      password: "OperatorPassword!123",
      role: "editor",
    });
    expect(r.status).toBe(201);
    const editor = (await r.json()).user;
    let response = await call("login", "POST", {
      username: "operator",
      password: "OperatorPassword!123",
    });
    token = response.headers
      .get("set-cookie")!
      .match(/apower_session=([^;]+)/)![1];
    await call("password", "POST", {
      oldPassword: "OperatorPassword!123",
      password: "NewOperatorPassword!456",
    });
    token = "";
    response = await call("login", "POST", {
      username: "operator",
      password: "NewOperatorPassword!456",
    });
    token = response.headers
      .get("set-cookie")!
      .match(/apower_session=([^;]+)/)![1];
    const editorToken = token;
    expect((await call("users")).status).toBe(403);
    expect((await call("backup")).status).toBe(403);
    expect((await call("content/article", "POST", article())).status).toBe(201);
    token = adminToken;
    expect(
      (await call(`users/${editor.id}`, "PATCH", { active: false })).status,
    ).toBe(200);
    token = editorToken;
    expect((await call("session")).status).toBe(401);
  });
  it("re-encodes real images and rejects HTML, SVG, misleading types and oversized bodies", async () => {
    await login();
    const png = await sharp({
      create: { width: 16, height: 16, channels: 3, background: "#ff4078" },
    })
      .png()
      .toBuffer();
    const r = await call("uploads", "POST", png, {
      "content-type": "image/png",
    });
    expect(r.status).toBe(201);
    const uploaded = await r.json();
    expect(uploaded.image.src).toMatch(/^\/uploads\/[a-f0-9-]{36}\.webp$/);
    expect(readdirSync(join(dir, "uploads"))).toHaveLength(1);
    expect((await sharp(join(dir, uploaded.image.src)).metadata()).format).toBe(
      "webp",
    );
    expect(
      (
        await call(
          "uploads",
          "POST",
          Buffer.from("<svg><script>alert(1)</script></svg>"),
          { "content-type": "image/svg+xml" },
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await call("uploads", "POST", Buffer.from("<html>bad</html>"), {
          "content-type": "image/png",
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await call("uploads", "POST", new Uint8Array(8 * 1024 * 1024 + 1), {
          "content-type": "image/png",
        })
      ).status,
    ).toBe(413);
  });
  it("does not accept absent origins or forged forwarded headers as origin authorization", async () => {
    const r = await handleCmsRequest(
      new Request(origin + "/api/cms/login", {
        method: "POST",
        headers: {
          "x-forwarded-host": "177.5.75.237",
          "x-forwarded-proto": "https",
        },
        body: "{}",
      }),
      store,
      { origin, uploadDir: dir, secure: true },
    );
    expect(r.status).toBe(403);
  });
  it("preserves password whitespace instead of silently changing the password at login", async () => {
    store.createUser("spaces", "  LongPassword123!  ", "editor");
    expect(
      (
        await call("login", "POST", {
          username: "spaces",
          password: "  LongPassword123!  ",
        })
      ).status,
    ).toBe(200);
  });
});
