// Captures dark/light × desktop/mobile + contrôle du thème appliqué.
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:8000";
const OUT = process.env.OUT_DIR ?? "screenshots";
const EXECUTABLE = process.env.CHROMIUM_PATH ?? "/usr/bin/chromium";
const PAGES = (process.env.PAGES ?? "/dashboard,/docs,/docs/new,/notes,/collections,/profile,/auth").split(",");
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const THEMES = ["dark", "light"];

async function getToken() {
  if (process.env.SHOT_TOKEN) return process.env.SHOT_TOKEN;
  const { SHOT_EMAIL: email, SHOT_PASSWORD: password } = process.env;
  if (!email || !password) return null;
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

const token = await getToken();
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: EXECUTABLE });
let failures = 0;

try {
  for (const theme of THEMES) {
    for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(([t, tok]) => {
        localStorage.setItem("theme", t);
        if (tok) localStorage.setItem("ddh_token", tok);
      }, [theme, token]);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => {
        // une erreur JS (ex. mismatch d'hydratation) est un échec, pas un simple log
        failures++;
        errors.push(`PAGEERROR ${String(e)}`);
      });
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

      for (const path of PAGES) {
        try {
          await page.goto(BASE + path, { waitUntil: "networkidle" });
        } catch (e) {
          // page qui ne se stabilise pas (ex. API bloquée) : on le signale et on capture quand même
          failures++;
          console.error(`TIMEOUT ${path} (${theme}/${vpName}): ${e.message.split("\n")[0]}`);
        }
        const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
        if (isDark !== (theme === "dark")) {
          failures++;
          console.error(`THEME MISMATCH ${path} (${theme}/${vpName}): html.dark=${isDark}`);
        }
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        if (overflow > 0) {
          failures++;
          console.error(`HORIZONTAL OVERFLOW ${path} (${theme}/${vpName}): +${overflow}px`);
        }
        const file = `${OUT}/${path.replaceAll("/", "_").replace(/^_/, "") || "root"}.${theme}.${vpName}.png`;
        await page.screenshot({ path: file, fullPage: true });
        console.log(file);
      }
      if (errors.length) console.log(`console errors (${theme}/${vpName}):\n  ${errors.join("\n  ")}`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
process.exit(failures ? 1 : 0);
