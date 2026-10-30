"use client";
import { useState, type FormEvent } from "react";
import type { Product, Article, Locale, ImageAsset } from "@/content/schema";
import type { CmsKind, CmsRecord, CmsStatus } from "@/lib/cms/content";
import { api } from "./api-client";

const categories = [
  ["682975", "吹风机系列"],
  ["682973", "直发器系列"],
  ["682971", "高速多功能美发器"],
  ["garment-steamers", "吸附挂烫机系列"],
];
interface Localized {
  title: string;
  description: string;
  body: string;
  specifications: string;
  images: string[];
  detailImages: string[];
}
export interface EditorInput {
  model: string;
  categoryId: string;
  category: string;
  publishedAt: string;
  locales: Record<Locale, Localized>;
}
function initial(kind: CmsKind, record?: CmsRecord): EditorInput {
  const product = record?.payload as Product | undefined,
    article = record?.payload as Article | undefined;
  return {
    model: kind === "product" ? (product?.model ?? "AP-") : "",
    categoryId: product?.categoryId ?? "682975",
    category: article?.category ?? "news",
    publishedAt:
      article?.publishedAt?.slice(0, 10) ??
      new Date().toISOString().slice(0, 10),
    locales: Object.fromEntries(
      (["cn", "en"] as const).map((locale) => {
        const p = record?.payload.locales[locale];
        return [
          locale,
          {
            title: p?.title ?? "",
            description: p?.description ?? "",
            body:
              p?.blocks
                .filter((b) => b.type === "rich-text")
                .flatMap((b) =>
                  b.type === "rich-text"
                    ? [b.heading, ...b.paragraphs].filter(Boolean)
                    : [],
                )
                .join("\n\n") ?? "",
            specifications:
              kind === "product"
                ? (product?.locales[locale].specifications
                    .map((s) => `${s.label} | ${s.value}`)
                    .join("\n") ?? "")
                : "",
            images: p?.images.map((i) => i.src) ?? [],
            detailImages:
              kind === "product"
                ? (product?.locales[locale].features.flatMap((b) =>
                    b.type === "media" ? [b.image.src] : [],
                  ) ?? [])
                : [],
          },
        ];
      }),
    ) as Record<Locale, Localized>,
  };
}
function UploadList({
  label,
  paths,
  onChange,
  onError,
}: {
  label: string;
  paths: string[];
  onChange: (p: string[]) => void;
  onError: (s: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <fieldset className="cms-uploads">
      <legend>{label}</legend>
      <div className="cms-image-grid">
        {paths.map((src, i) => (
          <div key={`${src}-${i}`}>
            <img src={src} alt={`图片 ${i + 1}`} />
            <span>{i === 0 ? "首图" : `${i + 1}`}</span>
            <div>
              <button
                type="button"
                disabled={!i || busy}
                onClick={() =>
                  onChange([src, ...paths.filter((_, j) => j !== i)])
                }
              >
                设为首图
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onChange(paths.filter((_, j) => j !== i))}
              >
                移除
              </button>
            </div>
          </div>
        ))}
      </div>
      <label className="cms-upload-button">
        {busy ? "正在上传…" : "＋ 上传图片"}
        <input
          aria-label={label + "上传"}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy}
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (!files.length) return;
            setBusy(true);
            const next = [...paths];
            try {
              for (const file of files) {
                if (file.size > 8 * 1024 * 1024)
                  throw new Error("每张图片不能超过 8MB");
                const r = await api<{ image: ImageAsset }>(
                  "uploads",
                  "POST",
                  file,
                );
                next.push(r.image.src);
                onChange([...next]);
              }
            } catch (error) {
              onError(error instanceof Error ? error.message : "上传失败");
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      <small>
        JPG / PNG / WebP，每张不超过 8MB。第一张为首图，其余按顺序展示。
      </small>
    </fieldset>
  );
}
export function ContentEditor({
  kind,
  record,
  onSave,
  onClose,
}: {
  kind: CmsKind;
  record?: CmsRecord;
  onSave: (data: unknown) => Promise<CmsRecord>;
  onClose: () => void;
}) {
  const [value, setValue] = useState(() => initial(kind, record)),
    [locale, setLocale] = useState<Locale>("cn"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const change = (key: keyof Localized, data: string | string[]) =>
    setValue((v) => ({
      ...v,
      locales: {
        ...v.locales,
        [locale]: { ...v.locales[locale], [key]: data },
      },
    }));
  const isProduct = kind === "product",
    language = locale === "cn" ? "中文" : "英文",
    local = value.locales[locale];
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const status = ((e.nativeEvent as SubmitEvent).submitter?.getAttribute(
        "value",
      ) ??
        record?.status ??
        "draft") as CmsStatus;
      const localized = Object.fromEntries(
        (["cn", "en"] as const).map((l) => [
          l,
          {
            ...value.locales[l],
            title: value.locales[l].title || (isProduct ? value.model : ""),
            specifications: isProduct
              ? value.locales[l].specifications
                  .split("\n")
                  .filter((s) => s.trim())
                  .map((line) => {
                    const split = line.indexOf("|");
                    if (split < 1)
                      throw new Error(
                        "参数请按照“参数名 | 参数值”每行一条填写",
                      );
                    return {
                      label: line.slice(0, split).trim(),
                      value: line.slice(split + 1).trim(),
                    };
                  })
              : undefined,
          },
        ]),
      );
      await onSave({
        ...value,
        locales: localized,
        status,
        version: record?.version,
      });
      setMessage(
        status === "published"
          ? "已保存并发布，官网即时生效。"
          : status === "archived"
            ? "已下架，官网不再展示。"
            : "草稿已保存，尚未在官网展示。",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="cms-editor">
      <div className="cms-section-heading">
        <div>
          <p className="cms-eyebrow">CONTENT EDITOR</p>
          <h2>
            {record ? "编辑" : "新增"}
            {isProduct ? "产品" : "资讯"}
          </h2>
        </div>
        <button onClick={onClose} type="button">
          返回列表
        </button>
      </div>
      {error && (
        <p role="alert" className="cms-alert">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="cms-success">
          {message}
        </p>
      )}
      <form onSubmit={submit}>
        <div className="cms-card cms-fields">
          {isProduct ? (
            <>
              <label>
                产品型号
                <input
                  aria-label="产品型号"
                  value={value.model}
                  readOnly={!!record}
                  maxLength={60}
                  onChange={(e) =>
                    setValue({ ...value, model: e.target.value.toUpperCase() })
                  }
                />
                <small>AP- 开头；创建后型号和网址保持不变。</small>
              </label>
              <label>
                产品分类
                <select
                  value={value.categoryId}
                  onChange={(e) =>
                    setValue({ ...value, categoryId: e.target.value })
                  }
                >
                  {categories.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <>
              <label>
                资讯分类
                <select
                  value={value.category}
                  onChange={(e) =>
                    setValue({ ...value, category: e.target.value })
                  }
                >
                  <option value="news">博客与新闻</option>
                  <option value="faq">常见问题</option>
                </select>
              </label>
              <label>
                发布时间
                <input
                  type="date"
                  value={value.publishedAt}
                  onChange={(e) =>
                    setValue({ ...value, publishedAt: e.target.value })
                  }
                />
              </label>
            </>
          )}
        </div>
        <div className="cms-language" role="group" aria-label="编辑语言">
          {(["cn", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={locale === l}
              onClick={() => setLocale(l)}
            >
              {l === "cn" ? "中文内容" : "English 内容"}
            </button>
          ))}
          <small>中英文共用发布状态，发布前请补齐两种语言。</small>
        </div>
        <div className="cms-card cms-fields" key={locale}>
          <label>
            {language}标题
            <input
              aria-label={language + "标题"}
              value={local.title}
              maxLength={200}
              onChange={(e) => change("title", e.target.value)}
              placeholder={isProduct ? "留空时使用产品型号" : "请输入文章标题"}
            />
          </label>
          <label>
            {language}摘要
            <textarea
              aria-label={language + "摘要"}
              rows={3}
              value={local.description}
              maxLength={2000}
              onChange={(e) => change("description", e.target.value)}
            />
          </label>
          {isProduct ? (
            <label>
              {language}规格参数
              <textarea
                aria-label={language + "规格参数"}
                className="cms-spec-input"
                rows={12}
                value={local.specifications}
                onChange={(e) => change("specifications", e.target.value)}
                placeholder={
                  locale === "cn"
                    ? "型号 | AP-G1\n电压 | 220V"
                    : "Model | AP-G1\nVoltage | 220V"
                }
              />
              <small>每行一条，使用半角竖线 | 分隔参数名与参数值。</small>
            </label>
          ) : (
            <label>
              {language}正文
              <textarea
                aria-label={language + "正文"}
                rows={18}
                value={local.body}
                maxLength={100000}
                onChange={(e) => change("body", e.target.value)}
              />
              <small>空一行分隔段落。文字会安全显示，不执行 HTML 代码。</small>
            </label>
          )}
          <UploadList
            label={language + (isProduct ? "主图及配色" : "封面及正文图片")}
            paths={local.images}
            onChange={(paths) => change("images", paths)}
            onError={setError}
          />
          {isProduct && (
            <UploadList
              label={language + "产品详情长图"}
              paths={local.detailImages}
              onChange={(paths) => change("detailImages", paths)}
              onError={setError}
            />
          )}
          <button
            type="button"
            onClick={() =>
              setValue((v) => ({
                ...v,
                locales: {
                  ...v.locales,
                  [locale === "cn" ? "en" : "cn"]: {
                    ...v.locales[locale === "cn" ? "en" : "cn"],
                    images: [...local.images],
                    detailImages: [...local.detailImages],
                  },
                },
              }))
            }
          >
            将本语言图片复制到{locale === "cn" ? "英文" : "中文"}
          </button>
        </div>
        <div className="cms-editor-actions">
          <button
            type="submit"
            value={record?.status ?? "draft"}
            disabled={busy}
          >
            {busy ? "保存中…" : "保存修改"}
          </button>
          <button
            className="cms-primary"
            type="submit"
            value="published"
            disabled={busy}
          >
            保存并发布
          </button>
          <button type="submit" value="draft" disabled={busy}>
            {record?.status === "published" ? "转为草稿（下线）" : "保存草稿"}
          </button>
          {record?.status === "published" && (
            <button type="submit" value="archived" disabled={busy}>
              下架
            </button>
          )}
          {record?.status === "published" && (
            <a
              href={`/en${record.payload.locales.en.legacyPath}/`}
              target="_blank"
              rel="noreferrer"
            >
              查看官网 ↗
            </a>
          )}
        </div>
      </form>
    </section>
  );
}
