export class ApiFailure extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T = Record<string, unknown>>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const file = typeof File !== "undefined" && data instanceof File;
  const response = await fetch(`/api/cms/${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers:
      data === undefined
        ? {}
        : { "content-type": file ? (data as File).type : "application/json" },
    body:
      data === undefined
        ? undefined
        : file
          ? (data as File)
          : JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok)
    throw new ApiFailure(result.error || "操作失败，请重试", response.status);
  return result as T;
}
