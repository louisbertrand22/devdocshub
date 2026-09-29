// Parcours e2e sur une stack démo jetable : ne laisse aucune donnée de test dans la base de dev.
// Usage : pnpm --filter web flows:isolated
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { waitForApi } from "./seed.mjs";
import { DEMO_API, DEMO_WEB, composeCmd, waitForWeb, withDemoStack } from "./stack.mjs";

const flows = fileURLToPath(new URL("../flows.mjs", import.meta.url));

const status = await withDemoStack(async () => {
  await waitForApi(DEMO_API);
  await waitForWeb();
  const r = spawnSync(process.execPath, [flows], {
    stdio: "inherit",
    env: { ...process.env, BASE_URL: DEMO_WEB, API_URL: DEMO_API, API_RESTART_CMD: `${composeCmd} restart api` },
  });
  return r.status ?? 1;
});
process.exit(status);
