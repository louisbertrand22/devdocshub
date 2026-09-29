// Stack démo → seed → capture de la page doc du guide Nginx (dark + light) → public/landing/.
// Usage : pnpm --filter web landing:capture
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { seed, waitForApi } from "./seed.mjs";

const API = "http://localhost:8100";
const WEB = "http://localhost:3100";
const HERO_SLUG = "reverse-proxy-tls-lets-encrypt";
const EXPECTED_DOCS = 10;
const root = fileURLToPath(new URL("../../../../", import.meta.url));
const out = fileURLToPath(new URL("../../public/landing/", import.meta.url));
const compose = (args) => execSync(`docker compose -f docker-compose.demo.yml ${args}`, { cwd: root, stdio: "inherit" });

async function waitForWeb(timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { if ((await fetch(`${WEB}/auth`)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("web démo injoignable");
}

compose("down -v --remove-orphans"); // base toujours vide au départ
try {
  compose("up -d --build");
  await waitForApi(API);
  await waitForWeb();
  const { token, ids } = await seed(API);

  // Garde-fou : la capture ne doit contenir que les guides de démo
  const all = await (await fetch(`${API}/docs/all`, { headers: { authorization: `Bearer ${token}` } })).json();
  if (all.length !== EXPECTED_DOCS) throw new Error(`base de démo non vierge : ${all.length} docs au lieu de ${EXPECTED_DOCS}`);

  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium" });
  try {
    for (const theme of ["dark", "light"]) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
      await ctx.addInitScript(([t, tok]) => {
        localStorage.setItem("theme", t);
        localStorage.setItem("ddh_token", tok);
      }, [theme, token]);
      const page = await ctx.newPage();
      await page.goto(`${WEB}/docs/${ids[HERO_SLUG]}`, { waitUntil: "networkidle" });
      await page.getByRole("heading", { level: 1 }).waitFor();
      await page.locator('aside nav[aria-label="Docs"] a', { hasText: "Reverse proxy" }).waitFor();
      await page.screenshot({ path: `${out}hero-${theme}.png` });
      console.log(`écrit public/landing/hero-${theme}.png`);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
} finally {
  compose("down -v --remove-orphans"); // toujours nettoyer
}
