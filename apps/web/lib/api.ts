export const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
  baseUrl?: string,
  token?: string | null
): Promise<T> {
  const url = `${(baseUrl ?? DEFAULT_API_BASE).replace(/\/$/, "")}${path.startsWith("/") ? path : "/" + path}`;
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token)
    headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} — ${text || "Request failed"}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  // @ts-expect-error: caller knows response type
  return res.text();
}
