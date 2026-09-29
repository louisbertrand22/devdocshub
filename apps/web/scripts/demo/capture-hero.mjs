// Stack démo → seed → capture de la page doc du guide Nginx (dark + light) → public/landing/.
// Usage : pnpm --filter web landing:capture
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { seed, waitForApi } from "./seed.mjs";
import { DEMO_API as API, DEMO_WEB as WEB, waitForWeb, withDemoStack } from "./stack.mjs";

const HERO_SLUG = "reverse-proxy-tls-lets-encrypt";
const EXPECTED_DOCS = 10;
const out = fileURLToPath(new URL("../../public/landing/", import.meta.url));

await withDemoStack(async () => {
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
});
