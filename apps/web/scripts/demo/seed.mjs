// Remplit l'API de démo avec les guides réels (scripts/demo/docs/*.md).
import { readdirSync, readFileSync } from "node:fs";
import { parseFrontMatter } from "../../lib/front-matter.ts";

export const DEMO = { email: "demo@devdocshub.dev", password: "Demo12345!", username: "demo" };

async function call(api, path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${api}${path}`, {
    method,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

export async function waitForApi(api, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if ((await fetch(`${api}/docs`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`API ${api} injoignable après ${timeoutMs / 1000}s`);
}

export async function login(api) {
  return (await call(api, "/auth/login", { method: "POST", body: { email: DEMO.email, password: DEMO.password } })).access_token;
}

export async function seed(api) {
  await call(api, "/auth/register", { method: "POST", body: DEMO });
  const token = await login(api);
  const me = await call(api, "/auth/me", { token });

  const dir = new URL("./docs/", import.meta.url);
  const ids = {};
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    const { data, body } = parseFrontMatter(readFileSync(new URL(file, dir), "utf8"));
    const doc = await call(api, "/docs/add", {
      method: "POST",
      token,
      body: { title: data.title, slug: data.slug, tech: data.tech, content: body },
    });
    ids[data.slug] = doc.id;
  }

  const notes = [
    ["docker-compose-en-pratique", "Penser au --build après un changement de Dockerfile.", true],
    ["reverse-proxy-tls-lets-encrypt", "Le minuteur certbot.timer renouvelle tout seul : vérifier avec --dry-run après une migration de serveur.", true],
    ["postgres-pg-dump-restore", "Tester la restauration chaque mois sur la base de recette.", false],
  ];
  for (const [slug, content, pinned] of notes) {
    await call(api, "/notes", { method: "POST", token, body: { doc_id: ids[slug], user_id: me.id, content, is_pinned: pinned } });
  }

  const infra = await call(api, "/collections/", { method: "POST", token, body: { name: "Infra", description: "Serveur, reverse proxy et sauvegardes" } });
  for (const slug of ["reverse-proxy-tls-lets-encrypt", "systemd-service", "postgres-pg-dump-restore"]) {
    await call(api, `/collections/${infra.id}/docs`, { method: "POST", token, body: { doc_id: ids[slug] } });
  }
  return { token, ids };
}
