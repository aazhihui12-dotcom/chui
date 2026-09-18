"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/content/schema";
import { submitInquiry, validateInquiry, type InquiryPayload } from "@/lib/inquiry";

const fields = ["name", "email", "company", "phone", "product", "message"] as const;
const labels = {
  en: { name: "Name", email: "Email", company: "Company", phone: "Phone", product: "Product", message: "Message" },
  cn: { name: "姓名", email: "电子邮箱", company: "公司", phone: "电话", product: "产品", message: "留言" },
};
const chineseErrors: Record<string, string> = { name: "请输入姓名", email: "请输入有效的电子邮箱", message: "请输入留言" };

export function InquiryForm({ locale, product = "" }: { locale: Locale; product?: string }) {
  const id = useId();
  const cn = locale === "cn";
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const submitting = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const payload: InquiryPayload = { name: value("name"), email: value("email"), message: value("message"), locale };
    for (const key of ["company", "phone", "product"] as const) if (value(key)) payload[key] = value(key);
    const nextErrors = validateInquiry(payload);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setState("idle");
      (form.elements.namedItem(Object.keys(nextErrors)[0]) as HTMLElement | null)?.focus();
      return;
    }
    submitting.current = true;
    setState("pending");
    try {
      await submitInquiry(payload);
      setState("success");
    } catch {
      setState("failed");
    } finally {
      submitting.current = false;
    }
  }
  if (state === "success") return <p className="inquiry-success" role="status">{cn ? "谢谢，我们会尽快与您联系。" : "Thank you. We will contact you soon."}</p>;
  return <form className="inquiry-form" noValidate onSubmit={submit} aria-busy={state === "pending"}>
    <p className="inquiry-required">{cn ? "标有 * 的字段为必填项。" : "Fields marked * are required."}</p>
    <fieldset disabled={state === "pending"}>
      {fields.map((field) => {
        const required = field === "name" || field === "email" || field === "message";
        const props = { id: `${id}-${field}`, name: field, required, "aria-invalid": errors[field] ? true : undefined, "aria-describedby": errors[field] ? `${id}-${field}-error` : undefined };
        return <div key={field} className={`inquiry-field${field === "message" ? " inquiry-field--wide" : ""}`}>
          <label htmlFor={props.id}>{labels[locale][field]}{required && <span aria-hidden="true" className="inquiry-asterisk" />}</label>
          {field === "message" ? <textarea {...props} rows={4} /> : <input {...props} type={field === "email" ? "email" : field === "phone" ? "tel" : "text"} autoComplete={{ name: "name", email: "email", company: "organization", phone: "tel", product: "off" }[field]} defaultValue={field === "product" ? product : ""} />}
          {errors[field] && <p className="inquiry-error" id={`${id}-${field}-error`}>{cn ? chineseErrors[field] : errors[field]}</p>}
        </div>;
      })}
      <button className="lbh-button inquiry-submit" type="submit">{state === "pending" ? cn ? "提交中…" : "Submitting…" : cn ? "提交" : "Submit"}</button>
    </fieldset>
    {state === "failed" && <p className="inquiry-error" role="alert">{cn ? "提交失败，请重试。" : "Submission failed. Please try again."}</p>}
  </form>;
}
