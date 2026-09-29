// Stack démo isolée (docker-compose.demo.yml : API :8100, web :3100, base jetable).
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const DEMO_API = "http://localhost:8100";
export const DEMO_WEB = "http://localhost:3100";
export const root = fileURLToPath(new URL("../../../../", import.meta.url));
export const composeCmd = `docker compose -f ${root}docker-compose.demo.yml`;
const compose = (args) => execSync(`${composeCmd} ${args}`, { cwd: root, stdio: "inherit" });

export async function waitForWeb(timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { if ((await fetch(`${DEMO_WEB}/auth`)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("web démo injoignable");
}

/** Démarre une stack démo vierge, exécute `fn`, puis la détruit — y compris sur Ctrl+C. */
export async function withDemoStack(fn) {
  let tornDown = false;
  const teardown = () => {
    if (tornDown) return;
    tornDown = true;
    compose("down -v --remove-orphans");
  };
  const onSignal = (signal) => {
    console.error(`\n${signal} reçu : arrêt de la stack démo…`);
    teardown();
    process.exit(130);
  };
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  compose("down -v --remove-orphans"); // base toujours vide au départ
  try {
    compose("up -d --build");
    return await fn();
  } finally {
    teardown();
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
  }
}
