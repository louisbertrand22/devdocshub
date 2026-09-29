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
const noteText = `Note de test flow ${stamp}`;
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

await section("landing", async () => {
  const html = await (await fetch(`${BASE}/`)).text();
  check("landing : titre présent dans le HTML serveur", html.includes("enfin au même endroit"));
  const heroRequests = [];
  const onRequest = (r) => { if (/hero-(dark|light)\.png/.test(decodeURIComponent(r.url()))) heroRequests.push(decodeURIComponent(r.url()).match(/hero-(dark|light)/)[1]); };
  p.on("request", onRequest);
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  p.off("request", onRequest);
  check("landing : seule la capture du thème courant est téléchargée", heroRequests.length > 0 && heroRequests.every((t) => t === "dark"), heroRequests.join(","));
  const h1 = await p.locator("h1").allInnerTexts();
  check("landing : un seul h1 avec le titre", h1.length === 1 && h1[0].includes("enfin au même endroit"), JSON.stringify(h1));
  const cta = await p.getByRole("link", { name: "Créer un compte gratuit" }).first().getAttribute("href");
  check("landing : CTA vers /auth?mode=register", cta === "/auth?mode=register", cta ?? "");
  check("landing : ancres #features et #how", (await p.locator("#features").count()) === 1 && (await p.locator("#how").count()) === 1);
  const heroLoaded = await p.evaluate(() => [...document.querySelectorAll("img[data-hero]")].some((img) => img.naturalWidth > 0 && img.offsetParent !== null));
  check("landing : image du hero chargée dans le thème courant", heroLoaded);
  const overflows = [];
  for (const width of [320, 360, 390]) {
    await p.setViewportSize({ width, height: 800 });
    const extra = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (extra > 0) overflows.push(`${width}px:+${extra}`);
  }
  await p.setViewportSize({ width: 1440, height: 900 });
  check("landing : aucun débordement horizontal de 320 à 390px", overflows.length === 0, overflows.join(" "));
  const og = await p.evaluate(() => document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? null);
  check("landing : og:image absente ou absolue hors localhost", og === null || (/^https?:\/\//.test(og) && !/localhost/.test(og)), String(og));
  await p.getByRole("link", { name: "Créer un compte gratuit" }).first().click();
  await p.waitForURL("**/auth?mode=register", { timeout: 10000 });
  const tab = await p.locator('[role="tab"][data-state="active"]').innerText();
  check("landing : /auth?mode=register ouvre l'onglet inscription", tab.includes("Créer un compte"), tab);
});

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

await section("landing connecté", async () => {
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  const hidden = await p.evaluate(() => {
    const el = document.querySelector("[data-landing]");
    return !el || getComputedStyle(el).visibility === "hidden";
  });
  await p.waitForURL("**/dashboard", { timeout: 10000 });
  check("landing : connecté → /dashboard, landing jamais visible", hidden);

  // Déconnexion puis retour sur / en navigation client : `data-authed` ne doit pas rester collé.
  await avatar.click();
  await p.getByRole("menuitem", { name: "Se déconnecter" }).click();
  await p.waitForURL("**/auth", { timeout: 10000 });
  await p.locator('a[href="/"]').first().click();
  await p.waitForURL(`${BASE}/`, { timeout: 10000 });
  await p.locator("h1").waitFor({ timeout: 10000 });
  const visible = await p.evaluate(() => getComputedStyle(document.querySelector("[data-landing]")).visibility !== "hidden");
  check("landing : visible après déconnexion, en navigation client", visible);

  // Connexion, puis Précédent jusqu'à / : la landing ne doit jamais être peinte.
  await p.evaluate(() => {
    window.__landingFlash = false;
    new MutationObserver(() => {
      const el = document.querySelector("[data-landing]");
      if (el && localStorage.getItem("ddh_token") && getComputedStyle(el).visibility !== "hidden") window.__landingFlash = true;
    }).observe(document.body, { childList: true, subtree: true });
  });
  await p.getByRole("link", { name: "Se connecter" }).first().click();
  await p.waitForURL("**/auth", { timeout: 10000 });
  await p.fill("#login-email", email);
  await p.fill("#login-password", password);
  await p.press("#login-password", "Enter");
  await p.waitForURL("**/dashboard", { timeout: 15000 });
  await avatar.waitFor({ timeout: 15000 });
  await p.goBack();
  await p.waitForURL("**/auth", { timeout: 10000 });
  await p.goBack();
  await p.waitForURL("**/dashboard", { timeout: 10000 });
  await avatar.waitFor({ timeout: 15000 });
  check("landing : Précédent vers / une fois connecté → jamais affichée", !(await p.evaluate(() => window.__landingFlash)));
});

await section("docs", async () => {
  await p.goto(`${BASE}/docs/new`, { waitUntil: "networkidle" });
  await p.getByRole("button", { name: "Créer le doc" }).click();
  check("formulaire doc : erreurs inline si vide", (await p.getByText("Le titre est requis.").count()) === 1);
  await p.fill("#doc-title", docTitle);
  const autoSlug = await p.inputValue("#doc-slug");
  check("formulaire doc : slug proposé depuis le titre", autoSlug === `flow-doc-${stamp}`, autoSlug);
  await p.fill("#doc-tech", "FlowTech");
  await p.fill("#doc-content", "## Installation\nflow\n\n### Détails `avancés`\n\n```bash\necho flow\n```\n\n## Installation\nbis\n\n| Clé | Valeur |\n|---|---|\n| a | b |");
  await p.getByRole("button", { name: "Créer le doc" }).click();
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
  await p.goto(`${BASE}/notes/new?doc=${docId}`, { waitUntil: "networkidle" });
  const preselected = await p.locator("#doc_id").innerText();
  check("nouvelle note : doc présélectionné via ?doc=", preselected.includes(docTitle), preselected);
  await p.fill("#note-content", noteText);
  await p.getByLabel("Épingler cette note").click();
  await p.getByRole("button", { name: "Créer la note" }).click();
  await p.waitForURL("**/notes", { timeout: 10000 });
  check("note créée → /notes", true);
});

await section("collections", async () => {
  await p.goto(`${BASE}/collections/add`, { waitUntil: "networkidle" });
  await p.fill("#col-name", `Flow col ${stamp}`);
  await p.getByRole("button", { name: "Créer la collection" }).click();
  await p.waitForURL("**/collections", { timeout: 10000 });
  check("collection créée → /collections", true);
});

await section("listes", async () => {
  await p.goto(`${BASE}/docs`, { waitUntil: "networkidle" });
  const row = p.locator("main li", { hasText: docTitle });
  check("/docs : ligne du doc avec badge techno", (await row.count()) === 1 && (await row.getByText("~/flowtech").count()) === 1);
  await p.getByLabel("Filtrer les docs").fill("zzz-aucun-resultat");
  check("/docs : filtre sans résultat → état vide", (await p.getByText("Aucun résultat").count()) === 1);
  await p.goto(`${BASE}/docs?tech=flowtech`, { waitUntil: "networkidle" });
  const techRows = await p.locator("main ul > li").count();
  check("/docs?tech= préfiltre la techno", techRows >= 1 && (await p.locator("main li", { hasText: docTitle }).count()) === 1, `${techRows} lignes`);

  await p.goto(`${BASE}/notes?pinned=1`, { waitUntil: "networkidle" });
  const pinnedSidebar = await p.locator('aside nav[aria-label="Notes"] a[aria-current="page"]').innerText();
  const pinnedBox = await p.getByRole("checkbox", { name: "Épinglées seulement" }).getAttribute("data-state");
  check("/notes?pinned=1 : sidebar et case synchronisées", pinnedSidebar.includes("Épinglées") && pinnedBox === "checked" && (await p.locator("main li", { hasText: noteText }).count()) === 1, `${pinnedSidebar} / ${pinnedBox}`);
  await p.goto(`${BASE}/notes?doc=${docId}`, { waitUntil: "networkidle" });
  const noteRows = p.locator("main li", { hasText: noteText });
  check("/notes?doc= : notes du doc, avec son titre", (await noteRows.count()) === 1 && (await noteRows.getByText(docTitle).count()) === 1);

  await p.goto(`${BASE}/collections`, { waitUntil: "networkidle" });
  check("/collections : ligne de la collection", (await p.locator("main li", { hasText: `Flow col ${stamp}` }).count()) === 1);
});

await section("tableau de bord", async () => {
  await p.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  const text = await p.locator("main").innerText();
  check("dashboard : 3 compteurs, sans faux contenu", ["Docs", "Notes", "Collections"].every((l) => text.includes(l)) && !text.includes("Guide d'intégration API") && !text.includes("Utilisateurs"));
  check("dashboard : doc récent listé", (await p.locator("main li", { hasText: docTitle }).count()) >= 1);
  check("dashboard : note épinglée listée", (await p.locator("main li", { hasText: noteText }).count()) >= 1);
  await p.goto(`${BASE}/profile`, { waitUntil: "networkidle" });
  check("profil : email affiché", (await p.getByText(email).count()) >= 1);
  await p.goto(`${BASE}/users`, { waitUntil: "networkidle" });
  check("/users non admin → réservé aux administrateurs", (await p.getByText("Réservé aux administrateurs").count()) === 1);
});

await section("pages statiques", async () => {
  const pages = ["/about", "/blog", "/careers", "/contact", "/cookies", "/licenses", "/privacy", "/terms"];
  const legacy = /\b(?:slate|blue|purple|green|indigo|violet)-\d|bg-white|muted-foreground|text-primary|bg-muted\b|prose-slate|prose-invert/;
  for (const path of pages) {
    await p.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    const r = await p.evaluate((re) => {
      const legacyRe = new RegExp(re);
      const main = document.querySelector("main");
      const links = [...(main?.querySelectorAll("a") ?? [])];
      return {
        h1: document.querySelectorAll("main h1").length,
        prose: document.querySelectorAll("main article.prose").length,
        legacy: [...(main?.querySelectorAll("*") ?? [])].filter((el) => legacyRe.test(el.getAttribute("class") ?? "")).length,
        dead: links.filter((a) => a.getAttribute("href") === "#").length,
        unsafeExternal: links.filter((a) => /^https?:/.test(a.getAttribute("href") ?? "") && !(a.target === "_blank" && /noopener/.test(a.rel))).length,
      };
    }, legacy.source);
    check(`${path} : gabarit ProsePage, sans classes héritées ni liens morts`, r.h1 === 1 && r.prose === 1 && r.legacy === 0 && r.dead === 0 && r.unsafeExternal === 0, JSON.stringify(r));
  }
  for (const path of pages) {
    await p.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    const gap = await p.evaluate(() => {
      const article = document.querySelector("main article.prose");
      const first = article?.querySelector("h2, h3, p, ul, ol, div.card");
      return article && first ? Math.round(first.getBoundingClientRect().top - article.getBoundingClientRect().top) : -1;
    });
    check(`${path} : pas d'espace vide sous l'en-tête`, gap >= 0 && gap <= 8, `${gap}px`);
  }
  await p.goto(`${BASE}/blog`, { waitUntil: "networkidle" });
  const blog = await p.evaluate(() => {
    const metas = [...document.querySelectorAll("main article .meta")].filter((m) => /\d{4}/.test(m.textContent ?? ""));
    return {
      dates: metas.length,
      dateUnderTitle: metas.filter((m) => m.previousElementSibling?.tagName === "H2").length,
      doubleRules: document.querySelectorAll("main article .border-b").length,
    };
  });
  check("/blog : chaque date sous le titre de son article, sans double filet", blog.dates > 0 && blog.dates === blog.dateUnderTitle && blog.doubleRules === 0, JSON.stringify(blog));
  await p.goto(`${BASE}/licenses`, { waitUntil: "networkidle" });
  const licenses = await p.locator("main article").innerText();
  check("/licenses : liste à jour", !licenses.includes("Framer Motion") && ["Next.js", "React", "Tailwind CSS", "Radix UI", "react-markdown", "remark-gfm", "Geist", "class-variance-authority", "tailwind-merge"].every((n) => licenses.includes(n)));
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
