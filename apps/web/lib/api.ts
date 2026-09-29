export const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Seul un 401 signifie que le token n'est plus valide ; un 429, un 5xx ou une panne réseau non. */
export function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}

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
    throw new ApiError(res.status, `${res.status} ${res.statusText} — ${text || "Request failed"}`);
  }
  // 204 : pas de corps, même si l'API annonce du JSON (FastAPI le fait)
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  // @ts-expect-error: caller knows response type
  return res.text();
}
