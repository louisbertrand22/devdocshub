// Parcours e2e : `pnpm --filter web flows`. Échoue (code 1) si un check échoue.
import { chromium } from "playwright-core";
import { execSync } from "node:child_process";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:8000";
const RESTART = process.env.API_RESTART_CMD;
const stamp = Date.now().toString(36);
const email = `flow-${stamp}@test.dev`;
const password = "Flow12345!";
const docTitle = `Flow doc ${stamp}`;
const results = [];
const check = (name, ok, extra = "") => results.push({ name, ok, extra });

async function section(name, fn) {
  if (RESTART) {
    execSync(RESTART, { stdio: "ignore", shell: "/bin/bash" });
    for (let i = 0; i < 40; i++) {
      try { if ((await fetch(`${API}/docs`)).ok) break; } catch {}
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  try { await fn(); } catch (e) { check(`${name}: interrompu`, false, String(e).split("\n")[0]); }
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
await ctx.addInitScript(() => {
  window.__htmlClassLog = [];
  new MutationObserver(() => {
    const h = document.documentElement;
    if (h) window.__htmlClassLog.push({ dark: h.classList.contains("dark"), body: !!document.body });
  }).observe(document, { attributes: true, subtree: true, attributeFilter: ["class"], childList: true });
});
const p = await ctx.newPage();
const pageErrors = [];
p.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 120)));
const avatar = p.locator('button[aria-label="Menu du compte"]');
const submitActiveTab = () => p.locator('[role="tabpanel"][data-state="active"] button').last().click();
let docId = null;

await section("auth", async () => {
  await p.goto(`${BASE}/auth`, { waitUntil: "networkidle" });
  const look = await p.evaluate(() => ({
    logo: document.body.innerText.includes("devdocshub"),
    emoji: document.body.innerText.includes("🧭"),
    gradient: [...document.querySelectorAll("body *")].some((el) => getComputedStyle(el).backgroundImage.includes("gradient")),
  }));
  check("/auth : logo devdocshub, sans emoji ni dégradé", look.logo && !look.emoji && !look.gradient, JSON.stringify(look));
  await p.getByRole("tab", { name: "Créer un compte" }).click();
  await p.fill("#reg-name", `flow${stamp}`);
  await p.fill("#reg-email", email);
  await p.fill("#reg-password", password);
  await submitActiveTab();
  await p.waitForURL("**/dashboard", { timeout: 15000 });
  await avatar.waitFor({ timeout: 15000 });
  check("inscription → dashboard + avatar", true);

  await avatar.click();
  await p.getByRole("menuitem", { name: "Se déconnecter" }).click();
  await p.waitForURL("**/auth", { timeout: 10000 });
  check("déconnexion → /auth", true);

  await p.fill("#login-email", email);
  await p.fill("#login-password", password);
  await p.press("#login-password", "Enter");
  await p.waitForURL("**/dashboard", { timeout: 15000 });
  await avatar.waitFor({ timeout: 15000 });
  check("connexion → dashboard + avatar", true);
});

await section("docs", async () => {
  await p.goto(`${BASE}/docs/new`, { waitUntil: "networkidle" });
  await p.fill('input[placeholder="My guide"]', docTitle);
  await p.fill('input[placeholder="my-guide"]', `flow-doc-${stamp}`);
  await p.fill('input[placeholder="python, javascript, etc."]', "FlowTech");
  await p.fill('textarea[placeholder="# Intro..."]', "## Installation\nflow\n\n### Détails `avancés`\n\n```bash\necho flow\n```\n\n## Installation\nbis\n\n| Clé | Valeur |\n|---|---|\n| a | b |");
  await p.getByRole("button", { name: "Create" }).click();
  await p.waitForURL("**/docs", { timeout: 10000 });
  const sidebar = p.locator('aside nav[aria-label="Docs"]');
  await sidebar.getByText(docTitle).waitFor({ timeout: 10000 });
  check("doc créé visible dans la sidebar sans rechargement", true);
  await sidebar.getByText(docTitle).click();
  await p.waitForURL(/\/docs\/[0-9a-f-]{36}$/, { timeout: 10000 });
  docId = p.url().split("/").pop();
  await p.getByRole("heading", { level: 1, name: docTitle }).waitFor({ timeout: 10000 });
  const toc = p.locator('nav[aria-label="Sur cette page"] a');
  const hrefs = await toc.evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  const idsExist = await p.evaluate((hs) => hs.every((h) => !!document.getElementById(h.slice(1))), hrefs);
  check("page doc : sommaire aligné sur les titres", JSON.stringify(hrefs) === JSON.stringify(["#installation", "#details-avances", "#installation-2"]) && idsExist, JSON.stringify(hrefs));
  const codeBlock = p.getByText("bash", { exact: true });
  await p.getByRole("button", { name: "Copier" }).click();
  const copied = await p.getByRole("button", { name: /Copié/ }).waitFor({ timeout: 3000 }).then(() => 1, () => 0);
  const clip = await p.evaluate(() => navigator.clipboard.readText());
  check("page doc : bloc de code avec langue + Copier", (await codeBlock.count()) > 0 && copied > 0 && clip === "echo flow", `clip=${JSON.stringify(clip)}`);
  check("page doc : tableaux markdown (GFM) rendus", (await p.locator("article table").count()) === 1);
  const addNote = await p.getByRole("link", { name: /Ajouter une note/ }).getAttribute("href");
  check("page doc : section Notes avec lien d'ajout", addNote === `/notes/new?doc=${docId}`, addNote ?? "");
  await p.goto(`${BASE}/docs/00000000-0000-0000-0000-000000000000`, { waitUntil: "networkidle" });
  check("page doc : id inconnu → « Document introuvable »", (await p.getByText("Document introuvable").count()) > 0);
});

await section("notes", async () => {
  await p.goto(`${BASE}/notes/new`, { waitUntil: "networkidle" });
  await p.click("#doc_id");
  await p.getByRole("option", { name: new RegExp(docTitle) }).click();
  await p.locator("form textarea").first().fill("Note de test flow");
  await p.locator('form button[type="submit"]').click();
  await p.waitForURL("**/notes", { timeout: 10000 });
  check("note créée → /notes", true);
});

await section("collections", async () => {
  await p.goto(`${BASE}/collections/add`, { waitUntil: "networkidle" });
  await p.fill('input[placeholder="Knowledge Base"]', `Flow col ${stamp}`);
  await p.getByRole("button", { name: "Create collection" }).click();
  await p.waitForURL("**/collections", { timeout: 10000 });
  check("collection créée → /collections", true);
});

await section("clavier", async () => {
  await p.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  const order = [];
  for (let i = 0; i < 9; i++) {
    await p.keyboard.press("Tab");
    order.push(await p.evaluate(() => {
      const el = document.activeElement;
      return el?.getAttribute("aria-label") || el?.textContent?.trim().slice(0, 20) || el?.tagName;
    }));
  }
  check("ordre Tab de la top bar", order.join(" > ").includes("Menu du compte"), order.join(" > "));
  await p.keyboard.press("Control+k");
  await p.keyboard.type(docTitle);
  await p.getByRole("option", { name: docTitle }).waitFor({ timeout: 10000 });
  await p.keyboard.press("Enter");
  await p.waitForURL(/\/docs\/[0-9a-f-]{36}$/, { timeout: 10000 });
  check("⌘K + Entrée ouvre le doc", true);
});

await section("thème", async () => {
  for (const target of ["light", "dark"]) {
    const isDark = await p.evaluate(() => document.documentElement.classList.contains("dark"));
    if ((target === "light") === isDark) await p.locator('button[aria-label^="Passer en thème"]').click();
    await p.reload({ waitUntil: "networkidle" });
    const log = await p.evaluate(() => window.__htmlClassLog);
    const withBody = log.filter((e) => e.body);
    const wrong = withBody.filter((e) => e.dark !== (target === "dark")).length;
    const final = await p.evaluate(() => document.documentElement.classList.contains("dark"));
    check(`rechargement en ${target} sans flash`, final === (target === "dark") && withBody.length > 0 && wrong === 0, `${wrong} état(s) au mauvais thème`);
  }
});

check("aucune erreur JS", pageErrors.length === 0, pageErrors.join(" | "));
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.extra ? "  — " + r.extra : ""}`);
await browser.close();
process.exit(results.every((r) => r.ok) ? 0 : 1);
