import { randomUUID } from "node:crypto";
import type {
  Product,
  ProductPage,
  Article,
  ArticlePage,
  ImageAsset,
  Specification,
} from "@/content/schema";

export type CmsKind = "product" | "article";
export type CmsStatus = "draft" | "published" | "archived";
export type CmsPayload = Product | Article;
export interface CmsRecord {
  id: string;
  kind: CmsKind;
  status: CmsStatus;
  version: number;
  payload: CmsPayload;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
export class CmsError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export const object = (input: unknown): Record<string, unknown> => {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new CmsError("数据格式错误");
  return input as Record<string, unknown>;
};
export function text(value: unknown, max: number, required = false): string {
  if (value === undefined || value === null) value = "";
  if (typeof value !== "string" || value.length > max)
    throw new CmsError(`文字不能超过 ${max} 个字符`);
  const result = value.trim();
  if (required && !result) throw new CmsError("请填写所有必填内容");
  return result;
}
export function imagePath(value: unknown): string {
  const path = text(value, 300, true);
  if (
    !/^\/(?:media\/[a-zA-Z0-9_./-]+|uploads\/[a-f0-9-]{36}\.webp)$/.test(
      path,
    ) ||
    path.split("/").some((p) => p === "." || p === "..") ||
    path.includes("//")
  )
    throw new CmsError("图片路径不合法，请使用上传的图片");
  return path;
}
function images(value: unknown): ImageAsset[] {
  if (!Array.isArray(value) || value.length > 80)
    throw new CmsError("图片数量不合法（最多 80 张）");
  return value.map((v) => ({
    src: imagePath(typeof v === "string" ? v : object(v).src),
    alt: "",
  }));
}
function specifications(value: unknown): Specification[] {
  if (!Array.isArray(value) || value.length > 60)
    throw new CmsError("参数数量不合法");
  return value.map((v) => {
    const r = object(v);
    return { label: text(r.label, 100, true), value: text(r.value, 500, true) };
  });
}
export function normalizeContent(
  kind: CmsKind,
  input: unknown,
  previous?: CmsRecord,
): { id: string; status: CmsStatus; payload: CmsPayload } {
  const raw = object(input),
    status = raw.status;
  if (status !== "draft" && status !== "published" && status !== "archived")
    throw new CmsError("发布状态不正确");
  const published = status === "published",
    localized = object(raw.locales);
  if (kind === "product") {
    const model = text(raw.model, 60, true);
    if (!/^AP-[A-Z0-9][A-Z0-9-]{0,54}$/.test(model))
      throw new CmsError("型号格式应为 AP- 开头的英文字母、数字及横线");
    if (previous && previous.id !== model)
      throw new CmsError("已创建产品的型号不可修改，请新增另一个型号");
    const categoryId = text(raw.categoryId, 60, true);
    if (
      !["682975", "682973", "682971", "garment-steamers"].includes(categoryId)
    )
      throw new CmsError("请选择现有产品分类");
    const legacyPath = `/ProductDetail/${model}.html`;
    const locales = Object.fromEntries(
      (["cn", "en"] as const).map((locale) => {
        const data = object(localized[locale]);
        const title = text(data.title, 200) || model,
          description = text(data.description, 2000, published);
        const gallery = images(data.images ?? []),
          specs = specifications(data.specifications ?? []),
          details = images(data.detailImages ?? []);
        if (published && (!gallery.length || !specs.length))
          throw new CmsError("发布产品需要中英文图片及规格参数");
        const page: ProductPage = {
          id: model,
          productId: model,
          model,
          categoryId,
          locale,
          legacyPath,
          kind: "product-detail",
          title,
          description,
          seo: { title: `${title} | APOWER TECH`, description },
          images: gallery.map((i) => ({ ...i, alt: title })),
          specifications: specs,
          features: details.map((image) => ({
            type: "media",
            image: { ...image, alt: title },
          })),
          accessories: [],
          blocks: [],
          inquiryTitle: `${model} ${locale === "cn" ? "产品询盘" : "Product inquiry"}`,
          provenance: {
            sourceUrl: "APOWER CMS",
            sourceLocale: locale,
            languageVerified: true,
            translation: "authored",
            coverage: "full",
          },
        };
        return [locale, page];
      }),
    ) as Product["locales"];
    return {
      id: model,
      status,
      payload: {
        id: model,
        model,
        categoryId,
        legacyPath,
        image: locales.en.images[0],
        gallery: locales.en.images,
        locales,
      },
    };
  }
  const id = previous?.id ?? randomUUID();
  const category = raw.category === "faq" ? "faq" : "news";
  const publishedAt =
    text(raw.publishedAt, 40) || new Date().toISOString().slice(0, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2})?$/.test(publishedAt) ||
    !Number.isFinite(Date.parse(publishedAt))
  )
    throw new CmsError("日期格式不正确");
  const locales = Object.fromEntries(
    (["cn", "en"] as const).map((locale) => {
      const data = object(localized[locale]),
        title = text(data.title, 200, published),
        body = text(data.body, 100000, published);
      const gallery = images(data.images ?? []),
        description = text(data.description, 2000) || body.slice(0, 160);
      const oldPage = previous?.payload.locales[locale];
      const page: ArticlePage = {
        id,
        articleId: id,
        locale,
        legacyPath: oldPage?.legacyPath ?? `/NewsDetail/${id}.html`,
        kind: "news-detail",
        title: title || "未命名草稿",
        description,
        seo: { title: `${title} | APOWER TECH`, description },
        images: gallery.map((i) => ({ ...i, alt: title })),
        publishedAt,
        author: "APOWER TECH",
        category,
        blocks: [
          {
            type: "rich-text",
            paragraphs: body.split(/\n\s*\n/).filter(Boolean),
          },
          ...gallery
            .slice(1)
            .map((image) => ({
              type: "media" as const,
              image: { ...image, alt: title },
            })),
        ],
        provenance: {
          sourceUrl: "APOWER CMS",
          sourceLocale: locale,
          languageVerified: true,
          translation: "authored",
          coverage: "full",
        },
      };
      return [locale, page];
    }),
  ) as Article["locales"];
  return {
    id,
    status,
    payload: {
      id,
      legacyPath: locales.en.legacyPath,
      publishedAt,
      author: "APOWER TECH",
      category,
      locales,
    },
  };
}
